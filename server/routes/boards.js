const express = require('express');
const db = require('../db/pool');
const { optionalAuth } = require('../middleware/authMiddleware');

const router = express.Router();
const ALLOWED_COLUMN_TYPES = ['status', 'dropdown', 'text', 'date', 'person', 'number'];

router.use(optionalAuth);

// GET /api/boards
router.get('/', async (_req, res, next) => {
  try {
    const { rows } = await db.query(
      'SELECT id, title, description, owner_id, created_at, updated_at FROM boards ORDER BY created_at ASC'
    );
    res.json({ boards: rows });
  } catch (err) {
    next(err);
  }
});

// POST /api/boards
router.post('/', async (req, res, next) => {
  const { title, description = '' } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Board title is required' });
  }

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    const boardRes = await client.query(
      `INSERT INTO boards (title, description, owner_id)
       VALUES ($1, $2, $3)
       RETURNING id, title, description, owner_id, created_at, updated_at`,
      [title.trim(), description.trim(), req.user ? req.user.id : null]
    );
    const board = boardRes.rows[0];

    const defaultCols = [
      { title: 'Status', type: 'status', position: 0 },
      { title: 'Owner', type: 'person', position: 1 },
      { title: 'Due Date', type: 'date', position: 2 },
    ];

    const createdColumns = [];
    for (const col of defaultCols) {
      const colRes = await client.query(
        `INSERT INTO board_columns (board_id, title, type, position)
         VALUES ($1, $2, $3, $4)
         RETURNING id, board_id, title, type, position, settings`,
        [board.id, col.title, col.type, col.position]
      );
      createdColumns.push(colRes.rows[0]);
    }

    await client.query('COMMIT');
    res.status(201).json({ board, columns: createdColumns, tasks: [] });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

// GET /api/boards/:boardId
router.get('/:boardId', async (req, res, next) => {
  const { boardId } = req.params;
  try {
    const [boardRes, colsRes, tasksRes] = await Promise.all([
      db.query('SELECT * FROM boards WHERE id = $1', [boardId]),
      db.query('SELECT * FROM board_columns WHERE board_id = $1 ORDER BY position ASC, created_at ASC', [boardId]),
      db.query('SELECT * FROM tasks WHERE board_id = $1 ORDER BY position ASC, created_at ASC', [boardId]),
    ]);
    if (!boardRes.rows[0]) return res.status(404).json({ error: 'Board not found' });
    res.json({ board: boardRes.rows[0], columns: colsRes.rows, tasks: tasksRes.rows });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/boards/:boardId
router.delete('/:boardId', async (req, res, next) => {
  try {
    const { rowCount } = await db.query('DELETE FROM boards WHERE id = $1', [req.params.boardId]);
    if (rowCount === 0) return res.status(404).json({ error: 'Board not found' });
    res.json({ deleted: true });
  } catch (err) {
    next(err);
  }
});

// POST /api/boards/:boardId/columns
router.post('/:boardId/columns', async (req, res, next) => {
  const { boardId } = req.params;
  const { title, type = 'text', settings = {} } = req.body;
  if (!title || !title.trim()) return res.status(400).json({ error: 'Column title is required' });
  if (!ALLOWED_COLUMN_TYPES.includes(type)) {
    return res.status(400).json({ error: `Invalid column type. Allowed: ${ALLOWED_COLUMN_TYPES.join(', ')}` });
  }
  try {
    const posRes = await db.query(
      'SELECT COALESCE(MAX(position), -1) + 1 AS next_pos FROM board_columns WHERE board_id = $1',
      [boardId]
    );
    const { rows } = await db.query(
      `INSERT INTO board_columns (board_id, title, type, position, settings)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [boardId, title.trim(), type, posRes.rows[0].next_pos, settings]
    );
    res.status(201).json({ column: rows[0] });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/boards/:boardId/columns/:columnId
// Updates column title and/or merges custom stages/options into `settings` JSONB
router.patch('/:boardId/columns/:columnId', async (req, res, next) => {
  const { boardId, columnId } = req.params;
  const { title, settings } = req.body;
  try {
    const { rows } = await db.query(
      `UPDATE board_columns
       SET title = COALESCE($1, title),
           settings = CASE
             WHEN $2::jsonb IS NOT NULL THEN settings || $2::jsonb
             ELSE settings
           END
       WHERE id = $3 AND board_id = $4
       RETURNING *`,
      [
        title !== undefined ? title.trim() : null,
        settings !== undefined ? JSON.stringify(settings) : null,
        columnId,
        boardId,
      ]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Column not found' });
    res.json({ column: rows[0] });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/boards/:boardId/columns/:columnId
router.delete('/:boardId/columns/:columnId', async (req, res, next) => {
  const { boardId, columnId } = req.params;
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    const delRes = await client.query(
      'DELETE FROM board_columns WHERE id = $1 AND board_id = $2 RETURNING id',
      [columnId, boardId]
    );
    if (delRes.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Column not found' });
    }
    await client.query(
      'UPDATE tasks SET values = values - $1, updated_at = NOW() WHERE board_id = $2 AND values ? $1',
      [columnId, boardId]
    );
    await client.query('COMMIT');
    res.json({ deletedColumnId: columnId });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

// POST /api/boards/:boardId/tasks
router.post('/:boardId/tasks', async (req, res, next) => {
  const { boardId } = req.params;
  const { title, values = {} } = req.body;
  if (!title || !title.trim()) return res.status(400).json({ error: 'Task title is required' });
  try {
    const posRes = await db.query(
      'SELECT COALESCE(MAX(position), -1) + 1 AS next_pos FROM tasks WHERE board_id = $1',
      [boardId]
    );
    const { rows } = await db.query(
      `INSERT INTO tasks (board_id, title, position, values)
       VALUES ($1, $2, $3, $4::jsonb)
       RETURNING *`,
      [boardId, title.trim(), posRes.rows[0].next_pos, JSON.stringify(values)]
    );
    res.status(201).json({ task: rows[0] });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/boards/:boardId/tasks/:taskId
router.patch('/:boardId/tasks/:taskId', async (req, res, next) => {
  const { boardId, taskId } = req.params;
  const { title, values } = req.body;
  try {
    const { rows } = await db.query(
      `UPDATE tasks
       SET title = COALESCE($1, title),
           values = CASE WHEN $2::jsonb IS NOT NULL THEN values || $2::jsonb ELSE values END,
           updated_at = NOW()
       WHERE id = $3 AND board_id = $4
       RETURNING *`,
      [
        title !== undefined ? title.trim() : null,
        values !== undefined ? JSON.stringify(values) : null,
        taskId,
        boardId,
      ]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Task not found' });
    res.json({ task: rows[0] });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/boards/:boardId/tasks/:taskId
router.delete('/:boardId/tasks/:taskId', async (req, res, next) => {
  const { boardId, taskId } = req.params;
  try {
    const { rowCount } = await db.query('DELETE FROM tasks WHERE id = $1 AND board_id = $2', [taskId, boardId]);
    if (rowCount === 0) return res.status(404).json({ error: 'Task not found' });
    res.json({ deletedTaskId: taskId });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
