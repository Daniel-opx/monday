import React, { useState, useMemo } from 'react';
import {
  LayoutGrid,
  Plus,
  Trash2,
  Database,
  Code2,
  Lock,
  AlertCircle,
  Calendar,
  User,
  Type,
  Hash,
  Activity,
  Terminal,
  Layers,
  Sparkles,
  X,
  Edit3,
  Check,
  Sliders,
  ListFilter
} from 'lucide-react';

const COLOR_PRESETS = {
  emerald: { label: 'Green', bg: 'bg-emerald-500', hover: 'hover:bg-emerald-600', text: 'text-white', dot: 'bg-emerald-500' },
  amber: { label: 'Amber', bg: 'bg-amber-500', hover: 'hover:bg-amber-600', text: 'text-white', dot: 'bg-amber-500' },
  rose: { label: 'Red', bg: 'bg-rose-500', hover: 'hover:bg-rose-600', text: 'text-white', dot: 'bg-rose-500' },
  indigo: { label: 'Indigo', bg: 'bg-indigo-500', hover: 'hover:bg-indigo-600', text: 'text-white', dot: 'bg-indigo-500' },
  purple: { label: 'Purple', bg: 'bg-purple-500', hover: 'hover:bg-purple-600', text: 'text-white', dot: 'bg-purple-500' },
  sky: { label: 'Blue', bg: 'bg-sky-500', hover: 'hover:bg-sky-600', text: 'text-white', dot: 'bg-sky-500' },
  slate: { label: 'Gray', bg: 'bg-slate-300', hover: 'hover:bg-slate-400', text: 'text-slate-800', dot: 'bg-slate-400' }
};

const DEFAULT_STATUS_OPTIONS = [
  { id: 'opt_done', label: 'Done', color: 'emerald' },
  { id: 'opt_working', label: 'Working on it', color: 'amber' },
  { id: 'opt_review', label: 'In QA Review', color: 'purple' },
  { id: 'opt_stuck', label: 'Stuck', color: 'rose' },
  { id: 'opt_not_started', label: 'Not Started', color: 'slate' }
];

const DEFAULT_DROPDOWN_OPTIONS = [
  { id: 'opt_high', label: 'High Priority', color: 'rose' },
  { id: 'opt_med', label: 'Medium', color: 'indigo' },
  { id: 'opt_low', label: 'Low', color: 'sky' }
];

const INITIAL_BOARDS = [
  {
    id: 'b_sprint_1',
    title: 'Product Launch Sprint',
    description: 'Core engineering & product deliverables for the v1 launch',
    columns: [
      {
        id: 'col_status',
        title: 'Status',
        type: 'status',
        position: 0,
        settings: {
          options: [
            { id: 'opt_done', label: 'Done', color: 'emerald' },
            { id: 'opt_working', label: 'Working on it', color: 'amber' },
            { id: 'opt_qa', label: 'In QA Review', color: 'purple' },
            { id: 'opt_stuck', label: 'Stuck', color: 'rose' },
            { id: 'opt_todo', label: 'Not Started', color: 'slate' }
          ]
        }
      },
      { id: 'col_owner', title: 'Owner', type: 'person', position: 1, settings: {} },
      { id: 'col_due', title: 'Due Date', type: 'date', position: 2, settings: {} },
      { id: 'col_pts', title: 'Story Points', type: 'number', position: 3, settings: {} },
      { id: 'col_notes', title: 'Tech Notes', type: 'text', position: 4, settings: {} }
    ],
    tasks: [
      {
        id: 't_101',
        title: 'Design PostgreSQL relational + JSONB schema',
        position: 0,
        values: {
          col_status: 'Done',
          col_owner: 'Alex',
          col_due: '2026-10-28',
          col_pts: '5',
          col_notes: 'Indexed tasks.values with GIN'
        }
      },
      {
        id: 't_102',
        title: 'Build Express dynamic column & task endpoints',
        position: 1,
        values: {
          col_status: 'In QA Review',
          col_owner: 'Sam',
          col_due: '2026-10-30',
          col_pts: '8',
          col_notes: 'Atomic JSONB || merge & - key delete'
        }
      },
      {
        id: 't_103',
        title: 'Implement JWT / Session Authentication (Your Exercise!)',
        position: 2,
        values: {
          col_status: 'Stuck',
          col_owner: 'You',
          col_due: '2026-11-02',
          col_pts: '5',
          col_notes: 'Hash with bcrypt + verify JWT in middleware'
        }
      },
      {
        id: 't_104',
        title: 'Connect React table to /api/boards endpoints',
        position: 3,
        values: {
          col_status: 'Not Started',
          col_owner: 'Jordan',
          col_due: '2026-11-05',
          col_pts: '3',
          col_notes: 'Optimistic cell updates'
        }
      }
    ]
  },
  {
    id: 'b_bug_triage',
    title: 'Backend Bug Triage',
    description: 'Track API edge cases and schema migrations with custom stages',
    columns: [
      {
        id: 'col_b_status',
        title: 'Stage',
        type: 'status',
        position: 0,
        settings: {
          options: [
            { id: 'st_triaged', label: 'Triaged', color: 'sky' },
            { id: 'st_fixing', label: 'Fixing', color: 'amber' },
            { id: 'st_verified', label: 'Verified Prod', color: 'emerald' },
            { id: 'st_blocked', label: 'Blocked', color: 'rose' }
          ]
        }
      },
      { id: 'col_b_assignee', title: 'Assignee', type: 'person', position: 1, settings: {} },
      { id: 'col_b_severity', title: 'Priority (1-5)', type: 'number', position: 2, settings: {} }
    ],
    tasks: [
      {
        id: 't_201',
        title: 'Strip deleted column keys from tasks JSONB column',
        position: 0,
        values: {
          col_b_status: 'Verified Prod',
          col_b_assignee: 'Alex',
          col_b_severity: '1'
        }
      },
      {
        id: 't_202',
        title: 'Protect /api/boards routes with requireAuth middleware',
        position: 1,
        values: {
          col_b_status: 'Fixing',
          col_b_assignee: 'You',
          col_b_severity: '2'
        }
      }
    ]
  }
];

const COLUMN_TYPE_META = {
  status: { label: 'Status (Stages)', icon: Activity, badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  dropdown: { label: 'Dropdown', icon: ListFilter, badge: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  person: { label: 'Person', icon: User, badge: 'bg-sky-50 text-sky-700 border-sky-200' },
  date: { label: 'Date', icon: Calendar, badge: 'bg-purple-50 text-purple-700 border-purple-200' },
  number: { label: 'Number', icon: Hash, badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  text: { label: 'Text', icon: Type, badge: 'bg-slate-100 text-slate-700 border-slate-200' }
};

function getColumnOptions(col) {
  if (col.settings?.options && Array.isArray(col.settings.options) && col.settings.options.length > 0) {
    return col.settings.options;
  }
  if (col.type === 'dropdown') return DEFAULT_DROPDOWN_OPTIONS;
  return DEFAULT_STATUS_OPTIONS;
}

export default function App() {
  const [boards, setBoards] = useState(INITIAL_BOARDS);
  const [activeBoardId, setActiveBoardId] = useState(INITIAL_BOARDS[0].id);
  const [activeTab, setActiveTab] = useState('board'); // 'board' | 'inspector' | 'backend' | 'auth'

  // Form states
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newColTitle, setNewColTitle] = useState('');
  const [newColType, setNewColType] = useState('status');
  const [editingColId, setEditingColId] = useState(null);
  const [editingColTitle, setEditingColTitle] = useState('');
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTaskTitle, setEditingTaskTitle] = useState('');

  // Column Options / Stages Editor Modal state
  const [optionsModalColId, setOptionsModalColId] = useState(null);
  const [newStageLabel, setNewStageLabel] = useState('');
  const [newStageColor, setNewStageColor] = useState('indigo');

  // Simulated SQL/REST query log so the learner can see the exact backend queries triggered
  const [queryLogs, setQueryLogs] = useState([
    {
      id: 'log_init',
      method: 'GET',
      endpoint: '/api/boards/b_sprint_1',
      sql: 'SELECT * FROM boards WHERE id = $1; SELECT * FROM board_columns WHERE board_id = $1 ORDER BY position; SELECT * FROM tasks WHERE board_id = $1 ORDER BY position;',
      time: 'Just now'
    }
  ]);

  // Auth sandbox modal state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authEmail, setAuthEmail] = useState('developer@example.com');
  const [authName, setAuthName] = useState('Alex Developer');
  const [authPassword, setAuthPassword] = useState('');
  const [authBanner, setAuthBanner] = useState(null);

  const activeBoard = useMemo(
    () => boards.find((b) => b.id === activeBoardId) || boards[0] || null,
    [boards, activeBoardId]
  );

  const activeOptionsColumn = useMemo(() => {
    if (!activeBoard || !optionsModalColId) return null;
    return activeBoard.columns.find((c) => c.id === optionsModalColId) || null;
  }, [activeBoard, optionsModalColId]);

  function pushLog(method, endpoint, sql) {
    setQueryLogs((prev) => [
      {
        id: 'log_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        method,
        endpoint,
        sql,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      },
      ...prev.slice(0, 14)
    ]);
  }

  // Board handlers
  function handleCreateBoard(e) {
    e.preventDefault();
    const title = newBoardTitle.trim();
    if (!title) return;
    const newId = 'b_' + Date.now().toString(36);
    const created = {
      id: newId,
      title,
      description: 'Custom workspace board with dynamic columns',
      columns: [
        {
          id: 'col_s_' + newId,
          title: 'Status',
          type: 'status',
          position: 0,
          settings: { options: DEFAULT_STATUS_OPTIONS }
        },
        { id: 'col_o_' + newId, title: 'Owner', type: 'person', position: 1, settings: {} },
        { id: 'col_d_' + newId, title: 'Due Date', type: 'date', position: 2, settings: {} }
      ],
      tasks: []
    };
    setBoards((prev) => [...prev, created]);
    setActiveBoardId(newId);
    setNewBoardTitle('');
    pushLog(
      'POST',
      '/api/boards',
      `BEGIN; INSERT INTO boards (title) VALUES ('${title}') RETURNING id; INSERT INTO board_columns (board_id, title, type, position, settings) VALUES ...; COMMIT;`
    );
  }

  function handleDeleteBoard(boardId) {
    if (boards.length <= 1) return;
    const nextBoards = boards.filter((b) => b.id !== boardId);
    setBoards(nextBoards);
    if (activeBoardId === boardId && nextBoards[0]) {
      setActiveBoardId(nextBoards[0].id);
    }
    pushLog(
      'DELETE',
      `/api/boards/${boardId}`,
      `DELETE FROM boards WHERE id = '${boardId}'; -- ON DELETE CASCADE removes board_columns & tasks`
    );
  }

  // Dynamic Column handlers
  function handleAddColumn(e) {
    e.preventDefault();
    const title = newColTitle.trim();
    if (!title || !activeBoard) return;
    const colId = 'col_' + Date.now().toString(36);
    const nextPos = activeBoard.columns.length;
    const initialSettings =
      newColType === 'status'
        ? { options: DEFAULT_STATUS_OPTIONS }
        : newColType === 'dropdown'
        ? { options: DEFAULT_DROPDOWN_OPTIONS }
        : {};

    const newCol = {
      id: colId,
      title,
      type: newColType,
      position: nextPos,
      settings: initialSettings
    };

    setBoards((prev) =>
      prev.map((b) =>
        b.id === activeBoard.id ? { ...b, columns: [...b.columns, newCol] } : b
      )
    );
    setNewColTitle('');
    pushLog(
      'POST',
      `/api/boards/${activeBoard.id}/columns`,
      `INSERT INTO board_columns (board_id, title, type, position, settings) VALUES ('${activeBoard.id}', '${title}', '${newColType}', ${nextPos}, '${JSON.stringify(initialSettings)}'::jsonb) RETURNING *;`
    );
  }

  function handleDeleteColumn(colId) {
    if (!activeBoard) return;
    setBoards((prev) =>
      prev.map((b) => {
        if (b.id !== activeBoard.id) return b;
        return {
          ...b,
          columns: b.columns.filter((c) => c.id !== colId),
          tasks: b.tasks.map((t) => {
            const nextValues = { ...t.values };
            delete nextValues[colId];
            return { ...t, values: nextValues };
          })
        };
      })
    );
    pushLog(
      'DELETE',
      `/api/boards/${activeBoard.id}/columns/${colId}`,
      `BEGIN; DELETE FROM board_columns WHERE id = '${colId}'; UPDATE tasks SET values = values - '${colId}' WHERE board_id = '${activeBoard.id}'; COMMIT;`
    );
  }

  function saveColumnRename(colId) {
    const trimmed = editingColTitle.trim();
    if (!trimmed || !activeBoard) {
      setEditingColId(null);
      return;
    }
    setBoards((prev) =>
      prev.map((b) =>
        b.id === activeBoard.id
          ? {
              ...b,
              columns: b.columns.map((c) => (c.id === colId ? { ...c, title: trimmed } : c))
            }
          : b
      )
    );
    setEditingColId(null);
    pushLog(
      'PATCH',
      `/api/boards/${activeBoard.id}/columns/${colId}`,
      `UPDATE board_columns SET title = '${trimmed}' WHERE id = '${colId}' AND board_id = '${activeBoard.id}';`
    );
  }

  // Custom Stage / Option handlers for a column (`board_columns.settings.options`)
  function updateColumnOptions(colId, nextOptions, oldLabelToReplace, newLabelReplacement) {
    if (!activeBoard) return;
    const nextSettings = { options: nextOptions };

    setBoards((prev) =>
      prev.map((b) => {
        if (b.id !== activeBoard.id) return b;
        return {
          ...b,
          columns: b.columns.map((c) =>
            c.id === colId ? { ...c, settings: { ...c.settings, options: nextOptions } } : c
          ),
          tasks:
            oldLabelToReplace && newLabelReplacement !== undefined
              ? b.tasks.map((t) =>
                  t.values?.[colId] === oldLabelToReplace
                    ? { ...t, values: { ...t.values, [colId]: newLabelReplacement } }
                    : t
                )
              : b.tasks
        };
      })
    );

    pushLog(
      'PATCH',
      `/api/boards/${activeBoard.id}/columns/${colId}`,
      `UPDATE board_columns SET settings = settings || '${JSON.stringify(nextSettings)}'::jsonb WHERE id = '${colId}' AND board_id = '${activeBoard.id}' RETURNING *;`
    );
  }

  function handleAddStageOption(e) {
    e.preventDefault();
    if (!activeOptionsColumn) return;
    const trimmed = newStageLabel.trim();
    if (!trimmed) return;
    const currentOpts = getColumnOptions(activeOptionsColumn);
    if (currentOpts.some((o) => o.label.toLowerCase() === trimmed.toLowerCase())) {
      return;
    }
    const nextOpts = [
      ...currentOpts,
      { id: 'opt_' + Date.now().toString(36), label: trimmed, color: newStageColor }
    ];
    updateColumnOptions(activeOptionsColumn.id, nextOpts);
    setNewStageLabel('');
  }

  function handleUpdateStageOption(optId, field, value) {
    if (!activeOptionsColumn) return;
    const currentOpts = getColumnOptions(activeOptionsColumn);
    const targetOpt = currentOpts.find((o) => o.id === optId);
    const nextOpts = currentOpts.map((o) =>
      o.id === optId ? { ...o, [field]: value } : o
    );
    if (field === 'label' && targetOpt && value.trim()) {
      updateColumnOptions(activeOptionsColumn.id, nextOpts, targetOpt.label, value);
    } else {
      updateColumnOptions(activeOptionsColumn.id, nextOpts);
    }
  }

  function handleDeleteStageOption(optId) {
    if (!activeOptionsColumn) return;
    const currentOpts = getColumnOptions(activeOptionsColumn);
    if (currentOpts.length <= 1) return; // Keep at least 1 option
    const removedOpt = currentOpts.find((o) => o.id === optId);
    const nextOpts = currentOpts.filter((o) => o.id !== optId);
    const fallbackLabel = nextOpts[0]?.label || '';
    updateColumnOptions(activeOptionsColumn.id, nextOpts, removedOpt?.label, fallbackLabel);
  }

  // Task Row & Dynamic Cell handlers
  function handleAddTask(e) {
    e.preventDefault();
    const title = newTaskTitle.trim();
    if (!title || !activeBoard) return;
    const taskId = 't_' + Date.now().toString(36);
    const defaultValues = {};
    activeBoard.columns.forEach((c) => {
      if (c.type === 'status' || c.type === 'dropdown') {
        const opts = getColumnOptions(c);
        defaultValues[c.id] = opts[opts.length - 1]?.label || opts[0]?.label || '';
      }
    });

    const newTask = {
      id: taskId,
      title,
      position: activeBoard.tasks.length,
      values: defaultValues
    };

    setBoards((prev) =>
      prev.map((b) =>
        b.id === activeBoard.id ? { ...b, tasks: [...b.tasks, newTask] } : b
      )
    );
    setNewTaskTitle('');
    pushLog(
      'POST',
      `/api/boards/${activeBoard.id}/tasks`,
      `INSERT INTO tasks (board_id, title, position, values) VALUES ('${activeBoard.id}', '${title}', ${newTask.position}, '${JSON.stringify(defaultValues)}'::jsonb);`
    );
  }

  function handleCellChange(taskId, colId, value) {
    if (!activeBoard) return;
    setBoards((prev) =>
      prev.map((b) =>
        b.id === activeBoard.id
          ? {
              ...b,
              tasks: b.tasks.map((t) =>
                t.id === taskId ? { ...t, values: { ...t.values, [colId]: value } } : t
              )
            }
          : b
      )
    );
    pushLog(
      'PATCH',
      `/api/boards/${activeBoard.id}/tasks/${taskId}`,
      `UPDATE tasks SET values = values || '${JSON.stringify({ [colId]: value })}'::jsonb, updated_at = NOW() WHERE id = '${taskId}';`
    );
  }

  function saveTaskRename(taskId) {
    const trimmed = editingTaskTitle.trim();
    if (!trimmed || !activeBoard) {
      setEditingTaskId(null);
      return;
    }
    setBoards((prev) =>
      prev.map((b) =>
        b.id === activeBoard.id
          ? {
              ...b,
              tasks: b.tasks.map((t) => (t.id === taskId ? { ...t, title: trimmed } : t))
            }
          : b
      )
    );
    setEditingTaskId(null);
    pushLog(
      'PATCH',
      `/api/boards/${activeBoard.id}/tasks/${taskId}`,
      `UPDATE tasks SET title = '${trimmed}', updated_at = NOW() WHERE id = '${taskId}';`
    );
  }

  function handleDeleteTask(taskId) {
    if (!activeBoard) return;
    setBoards((prev) =>
      prev.map((b) =>
        b.id === activeBoard.id
          ? { ...b, tasks: b.tasks.filter((t) => t.id !== taskId) }
          : b
      )
    );
    pushLog(
      'DELETE',
      `/api/boards/${activeBoard.id}/tasks/${taskId}`,
      `DELETE FROM tasks WHERE id = '${taskId}' AND board_id = '${activeBoard.id}';`
    );
  }

  function handleAuthSubmit(e) {
    e.preventDefault();
    const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';
    setAuthBanner({
      endpoint,
      payload:
        authMode === 'login'
          ? { email: authEmail, password: '***' }
          : { name: authName, email: authEmail, password: '***' }
    });
    pushLog(
      'POST',
      endpoint,
      `-- [YOUR AUTH EXERCISE] Hit 501 stub in server/routes/auth.js for ${authEmail}`
    );
  }

  // Compute numeric column summaries
  const numericTotals = useMemo(() => {
    if (!activeBoard) return {};
    const sums = {};
    activeBoard.columns.forEach((col) => {
      if (col.type === 'number') {
        sums[col.id] = activeBoard.tasks.reduce((acc, t) => {
          const n = parseFloat(t.values?.[col.id]);
          return acc + (Number.isFinite(n) ? n : 0);
        }, 0);
      }
    });
    return sums;
  }, [activeBoard]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row font-sans">
      {/* Left Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-100 flex flex-col justify-between shrink-0 border-b md:border-b-0 md:border-r border-slate-800">
        <div className="p-4">
          {/* Brand Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-indigo-500 flex items-center justify-center font-bold text-white shadow-sm">
                M
              </div>
              <div>
                <div className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
                  monday-lite
                  <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                    PG + JSONB
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">Express + React Stack</div>
              </div>
            </div>
          </div>

          {/* Boards List */}
          <div className="mt-6">
            <div className="flex items-center justify-between px-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              <span>Workspaces / Boards</span>
              <span>{boards.length}</span>
            </div>

            <ul className="mt-2 space-y-1">
              {boards.map((b) => {
                const isSelected = activeBoard?.id === b.id;
                return (
                  <li
                    key={b.id}
                    onClick={() => {
                      setActiveBoardId(b.id);
                      pushLog(
                        'GET',
                        `/api/boards/${b.id}`,
                        `SELECT * FROM boards WHERE id = '${b.id}'; SELECT * FROM board_columns WHERE board_id = '${b.id}'; SELECT * FROM tasks WHERE board_id = '${b.id}';`
                      );
                    }}
                    className={`group flex items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium cursor-pointer transition ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <LayoutGrid className="h-3.5 w-3.5 shrink-0 opacity-80" />
                      <span className="truncate">{b.title}</span>
                    </div>
                    {boards.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteBoard(b.id);
                        }}
                        className={`opacity-0 group-hover:opacity-100 p-0.5 rounded transition ${
                          isSelected
                            ? 'text-indigo-200 hover:text-white hover:bg-indigo-700'
                            : 'text-slate-400 hover:text-rose-400'
                        }`}
                        title="Delete board"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>

            {/* Create Board Form */}
            <form onSubmit={handleCreateBoard} className="mt-3 flex gap-1.5">
              <input
                type="text"
                value={newBoardTitle}
                onChange={(e) => setNewBoardTitle(e.target.value)}
                placeholder="+ New board title..."
                className="w-full rounded-lg bg-slate-800 border border-slate-700 px-2.5 py-1.5 text-xs text-white placeholder-slate-400 focus:border-indigo-400 focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-lg bg-indigo-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 shrink-0"
              >
                Add
              </button>
            </form>
          </div>

          {/* Architecture / Learning Views */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <div className="px-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Developer Views
            </div>
            <div className="mt-2 space-y-1">
              <button
                type="button"
                onClick={() => setActiveTab('board')}
                className={`w-full flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium transition ${
                  activeTab === 'board'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <Layers className="h-3.5 w-3.5 text-indigo-400" />
                <span>Dynamic Board UI</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('inspector')}
                className={`w-full flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium transition ${
                  activeTab === 'inspector'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <Database className="h-3.5 w-3.5 text-emerald-400" />
                <span>PostgreSQL + JSONB Live State</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('backend')}
                className={`w-full flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium transition ${
                  activeTab === 'backend'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <Code2 className="h-3.5 w-3.5 text-sky-400" />
                <span>Express Backend & Schema</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('auth')}
                className={`w-full flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium transition ${
                  activeTab === 'auth'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <Lock className="h-3.5 w-3.5 text-amber-400" />
                <span>Your Auth Exercise Guide</span>
              </button>
            </div>
          </div>
        </div>

        {/* Auth Trigger Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <button
            type="button"
            onClick={() => {
              setAuthBanner(null);
              setAuthModalOpen(true);
            }}
            className="w-full flex items-center justify-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-300 hover:bg-amber-500/20 transition"
          >
            <Lock className="h-3.5 w-3.5" />
            <span>Test Login / Register Stub</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">
                {activeBoard ? activeBoard.title : 'Select a Board'}
              </h1>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                {activeBoard?.columns.length || 0} columns · {activeBoard?.tasks.length || 0} tasks
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {activeBoard?.description}
            </p>
          </div>

          {/* Add Dynamic Column Controls */}
          {activeTab === 'board' && activeBoard && (
            <form
              onSubmit={handleAddColumn}
              className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1.5 shadow-sm"
            >
              <input
                type="text"
                value={newColTitle}
                onChange={(e) => setNewColTitle(e.target.value)}
                placeholder="Add column (e.g. Stage, Priority)..."
                className="rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none min-w-[180px]"
              />
              <select
                value={newColType}
                onChange={(e) => setNewColType(e.target.value)}
                className="rounded-lg bg-white border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:border-indigo-500 focus:outline-none"
              >
                <option value="status">Status (Custom Stages)</option>
                <option value="dropdown">Dropdown (Custom Labels)</option>
                <option value="person">Person</option>
                <option value="date">Date</option>
                <option value="number">Number</option>
                <option value="text">Text</option>
              </select>
              <button
                type="submit"
                className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 transition"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Column</span>
              </button>
            </form>
          )}
        </header>

        {/* Body Content */}
        <main className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* TAB 1: DYNAMIC BOARD TABLE */}
          {activeTab === 'board' && activeBoard && (
            <>
              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/90 text-xs font-semibold text-slate-600">
                      <th className="w-2 bg-indigo-500 p-0"></th>
                      <th className="py-3 pl-4 pr-3 min-w-[260px] border-r border-slate-200">
                        Task Item
                      </th>
                      {activeBoard.columns.map((col) => {
                        const meta = COLUMN_TYPE_META[col.type] || COLUMN_TYPE_META.text;
                        const ColIcon = meta.icon;
                        const isEditing = editingColId === col.id;
                        const hasConfigurableOptions =
                          col.type === 'status' || col.type === 'dropdown';

                        return (
                          <th
                            key={col.id}
                            className="py-2.5 px-3 min-w-[180px] border-r border-slate-200 group"
                          >
                            {isEditing ? (
                              <div className="flex items-center gap-1">
                                <input
                                  type="text"
                                  value={editingColTitle}
                                  onChange={(e) => setEditingColTitle(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') saveColumnRename(col.id);
                                    if (e.key === 'Escape') setEditingColId(null);
                                  }}
                                  autoFocus
                                  className="w-full rounded border border-indigo-400 px-1.5 py-0.5 text-xs font-medium text-slate-800 focus:outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => saveColumnRename(col.id)}
                                  className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                                >
                                  <Check className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between gap-1.5">
                                <div className="flex items-center gap-1.5 truncate">
                                  <ColIcon className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                  <span className="truncate text-slate-700">{col.title}</span>
                                  <span
                                    className={`text-[10px] font-medium px-1.5 py-0.2 rounded border ${meta.badge}`}
                                  >
                                    {col.type}
                                  </span>
                                </div>
                                <div className="flex items-center gap-0.5">
                                  {hasConfigurableOptions && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setOptionsModalColId(col.id);
                                        setNewStageLabel('');
                                      }}
                                      className="flex items-center gap-1 rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-600 hover:bg-indigo-100 border border-indigo-200/80 transition"
                                      title="Edit available stages / options for this column"
                                    >
                                      <Sliders className="h-2.5 w-2.5" />
                                      <span>Stages</span>
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingColId(col.id);
                                      setEditingColTitle(col.title);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-indigo-600 rounded transition"
                                    title="Rename column"
                                  >
                                    <Edit3 className="h-3 w-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteColumn(col.id)}
                                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 rounded transition"
                                    title="Delete column & strip JSONB key"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </th>
                        );
                      })}
                      <th className="w-12 py-3 px-2 text-center text-slate-400">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-200">
                    {activeBoard.tasks.length === 0 ? (
                      <tr>
                        <td
                          colSpan={activeBoard.columns.length + 3}
                          className="py-8 text-center text-xs text-slate-400"
                        >
                          No tasks yet. Add your first task row below!
                        </td>
                      </tr>
                    ) : (
                      activeBoard.tasks.map((task) => {
                        const isEditingTask = editingTaskId === task.id;
                        return (
                          <tr
                            key={task.id}
                            className="hover:bg-slate-50/80 transition group"
                          >
                            <td className="w-2 bg-indigo-500/80 p-0"></td>
                            <td className="py-2.5 pl-4 pr-3 font-medium text-slate-800 border-r border-slate-100">
                              {isEditingTask ? (
                                <div className="flex items-center gap-1">
                                  <input
                                    type="text"
                                    value={editingTaskTitle}
                                    onChange={(e) => setEditingTaskTitle(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') saveTaskRename(task.id);
                                      if (e.key === 'Escape') setEditingTaskId(null);
                                    }}
                                    autoFocus
                                    className="w-full rounded border border-indigo-400 px-2 py-1 text-xs focus:outline-none"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => saveTaskRename(task.id)}
                                    className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                                  >
                                    <Check className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-xs sm:text-sm">{task.title}</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingTaskId(task.id);
                                      setEditingTaskTitle(task.title);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-indigo-600 rounded"
                                    title="Rename task"
                                  >
                                    <Edit3 className="h-3 w-3" />
                                  </button>
                                </div>
                              )}
                            </td>

                            {activeBoard.columns.map((col) => {
                              const val = task.values?.[col.id] ?? '';

                              if (col.type === 'status' || col.type === 'dropdown') {
                                const colOptions = getColumnOptions(col);
                                const matchedOpt =
                                  colOptions.find((o) => o.label === val) || colOptions[0];
                                const colorCfg =
                                  COLOR_PRESETS[matchedOpt?.color] || COLOR_PRESETS.slate;

                                return (
                                  <td
                                    key={col.id}
                                    className="p-1.5 border-r border-slate-100"
                                  >
                                    <select
                                      value={matchedOpt?.label || ''}
                                      onChange={(e) => {
                                        if (e.target.value === '__EDIT_OPTIONS__') {
                                          setOptionsModalColId(col.id);
                                          setNewStageLabel('');
                                          return;
                                        }
                                        handleCellChange(task.id, col.id, e.target.value);
                                      }}
                                      className={`w-full rounded-md px-2.5 py-1.5 text-xs font-semibold text-center cursor-pointer transition focus:outline-none ${colorCfg.bg} ${colorCfg.hover} ${colorCfg.text}`}
                                    >
                                      {colOptions.map((opt) => (
                                        <option
                                          key={opt.id}
                                          value={opt.label}
                                          className="bg-white text-slate-800 font-medium"
                                        >
                                          {opt.label}
                                        </option>
                                      ))}
                                      <option
                                        value="__EDIT_OPTIONS__"
                                        className="bg-slate-100 text-indigo-700 font-semibold"
                                      >
                                        + Edit Stages / Options...
                                      </option>
                                    </select>
                                  </td>
                                );
                              }

                              if (col.type === 'person') {
                                const initials = val
                                  ? val
                                      .trim()
                                      .split(/\s+/)
                                      .map((s) => s[0]?.toUpperCase())
                                      .slice(0, 2)
                                      .join('')
                                  : '?';
                                return (
                                  <td
                                    key={col.id}
                                    className="p-1.5 border-r border-slate-100"
                                  >
                                    <div className="flex items-center gap-1.5 px-1.5">
                                      <div
                                        className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                                          val
                                            ? 'bg-indigo-100 text-indigo-700'
                                            : 'bg-slate-100 text-slate-400'
                                        }`}
                                      >
                                        {initials}
                                      </div>
                                      <input
                                        type="text"
                                        value={val}
                                        placeholder="Assign..."
                                        onChange={(e) =>
                                          handleCellChange(task.id, col.id, e.target.value)
                                        }
                                        className="w-full rounded px-1.5 py-1 text-xs text-slate-700 hover:bg-slate-100/80 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                                      />
                                    </div>
                                  </td>
                                );
                              }

                              return (
                                <td
                                  key={col.id}
                                  className="p-1.5 border-r border-slate-100"
                                >
                                  <input
                                    type={
                                      col.type === 'date'
                                        ? 'date'
                                        : col.type === 'number'
                                        ? 'number'
                                        : 'text'
                                    }
                                    value={val}
                                    placeholder={col.type === 'number' ? '0' : '—'}
                                    onChange={(e) =>
                                      handleCellChange(task.id, col.id, e.target.value)
                                    }
                                    className={`w-full rounded px-2 py-1.5 text-xs text-slate-700 hover:bg-slate-100/80 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none ${
                                      col.type === 'number' ? 'text-right font-mono' : ''
                                    }`}
                                  />
                                </td>
                              );
                            })}

                            <td className="py-2 px-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleDeleteTask(task.id)}
                                className="p-1 text-slate-300 hover:text-rose-600 rounded transition"
                                title="Delete task row"
                              >
                                <Trash2 className="h-3.5 w-3.5 mx-auto" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>

                  {/* Summary Footer for Numeric & Status Columns */}
                  <tfoot>
                    <tr className="border-t border-slate-200 bg-slate-50/60 text-xs">
                      <td className="w-2 bg-indigo-300 p-0"></td>
                      <td className="py-2 pl-4 pr-3 font-semibold text-slate-500 border-r border-slate-200">
                        Column Totals / Distribution
                      </td>
                      {activeBoard.columns.map((col) => (
                        <td
                          key={col.id}
                          className="py-2 px-3 border-r border-slate-200 text-slate-600"
                        >
                          {col.type === 'number' ? (
                            <div className="text-right font-mono font-semibold text-slate-800">
                              Sum: {numericTotals[col.id] || 0}
                            </div>
                          ) : col.type === 'status' || col.type === 'dropdown' ? (
                            <div className="flex h-2 w-full overflow-hidden rounded-full bg-slate-200">
                              {getColumnOptions(col).map((opt) => {
                                const count = activeBoard.tasks.filter(
                                  (t) =>
                                    (t.values?.[col.id] ||
                                      getColumnOptions(col)[0]?.label) === opt.label
                                ).length;
                                const pct =
                                  activeBoard.tasks.length > 0
                                    ? (count / activeBoard.tasks.length) * 100
                                    : 0;
                                if (pct === 0) return null;
                                const preset =
                                  COLOR_PRESETS[opt.color] || COLOR_PRESETS.slate;
                                return (
                                  <div
                                    key={opt.id}
                                    style={{ width: `${pct}%` }}
                                    className={preset.bg}
                                    title={`${opt.label}: ${count}`}
                                  />
                                );
                              })}
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400">—</span>
                          )}
                        </td>
                      ))}
                      <td></td>
                    </tr>
                  </tfoot>
                </table>

                {/* Add New Task Row Input Bar */}
                <form
                  onSubmit={handleAddTask}
                  className="flex items-center gap-2 border-t border-slate-200 bg-white px-4 py-2.5"
                >
                  <Plus className="h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="+ Add a new task row and press Enter..."
                    className="flex-1 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition"
                  >
                    Add Task
                  </button>
                </form>
              </div>

              {/* Live Express + PostgreSQL Query Log */}
              <div className="rounded-xl border border-slate-200 bg-slate-900 text-slate-200 p-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-emerald-400" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                      Live Express REST API & PostgreSQL Query Log
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Every UI action triggers these exact queries in <code className="text-indigo-300">server/routes/boards.js</code>
                  </span>
                </div>
                <div className="mt-3 space-y-2 max-h-48 overflow-y-auto font-mono text-xs">
                  {queryLogs.map((log) => (
                    <div
                      key={log.id}
                      className="rounded-lg bg-slate-950/70 border border-slate-800/80 p-2.5 flex flex-col gap-1"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              log.method === 'GET'
                                ? 'bg-sky-500/20 text-sky-300'
                                : log.method === 'POST'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : log.method === 'PATCH'
                                ? 'bg-amber-500/20 text-amber-300'
                                : 'bg-rose-500/20 text-rose-300'
                            }`}
                          >
                            {log.method}
                          </span>
                          <span className="text-slate-200 font-semibold">{log.endpoint}</span>
                        </div>
                        <span className="text-[10px] text-slate-500">{log.time}</span>
                      </div>
                      <div className="text-emerald-300/90 text-[11px] break-all">
                        {log.sql}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* TAB 2: POSTGRESQL + JSONB LIVE STATE INSPECTOR */}
          {activeTab === 'inspector' && activeBoard && (
            <div className="space-y-6">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
                <h2 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                  <Database className="h-4 w-4 text-emerald-600" />
                  How Custom Column Stages & Available Values Work in PostgreSQL
                </h2>
                <p className="mt-1 text-xs text-emerald-900 leading-relaxed">
                  Each row in <code className="bg-emerald-100 px-1 py-0.5 rounded font-mono">board_columns</code> has a{' '}
                  <code className="bg-emerald-100 px-1 py-0.5 rounded font-mono">settings JSONB</code> column. For{' '}
                  <strong>Status</strong> and <strong>Dropdown</strong> columns, <code className="bg-emerald-100 px-1 py-0.5 rounded font-mono">settings.options</code>{' '}
                  stores the array of allowed stages/labels and their colors:{' '}
                  <code className="bg-emerald-100 px-1 py-0.5 rounded font-mono">{`{"options": [{"id": "opt_1", "label": "In QA Review", "color": "purple"}]}`}</code>.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Table 1: board_columns rows */}
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                    Relational + JSONB Table: <code className="text-indigo-600">board_columns</code> (includes <code className="text-emerald-600">settings.options</code>)
                  </div>
                  <pre className="rounded-lg bg-slate-900 text-slate-100 p-3 text-xs font-mono overflow-x-auto">
                    {JSON.stringify(activeBoard.columns, null, 2)}
                  </pre>
                </div>

                {/* Table 2: tasks rows with JSONB values */}
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                    Relational + JSONB Table: <code className="text-indigo-600">tasks</code> (<code className="text-emerald-600">values JSONB</code>)
                  </div>
                  <pre className="rounded-lg bg-slate-900 text-slate-100 p-3 text-xs font-mono overflow-x-auto">
                    {JSON.stringify(activeBoard.tasks, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: EXPRESS BACKEND & SQL SCHEMA */}
          {activeTab === 'backend' && (
            <div className="space-y-6">
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-base font-bold text-slate-900">
                  PostgreSQL Schema (<code className="text-indigo-600">server/db/schema.sql</code>)
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Notice <code className="font-mono">settings JSONB</code> on <code className="font-mono">board_columns</code> for storing custom per-column stages/dropdown options, and <code className="font-mono">values JSONB</code> on <code className="font-mono">tasks</code>.
                </p>
                <pre className="mt-3 rounded-lg bg-slate-900 text-slate-100 p-4 text-xs font-mono overflow-x-auto leading-relaxed">
{`CREATE TABLE board_columns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  title VARCHAR(100) NOT NULL,
  type VARCHAR(32) NOT NULL CHECK (type IN ('status', 'dropdown', 'text', 'date', 'person', 'number')),
  position INTEGER NOT NULL DEFAULT 0,
  -- Stores per-column custom stages/options: {"options": [{"id": "...", "label": "In QA", "color": "purple"}]}
  settings JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  values JSONB NOT NULL DEFAULT '{}'::jsonb
);`}
                </pre>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-base font-bold text-slate-900">
                  Updating Column Stages & Options (<code className="text-indigo-600">PATCH /api/boards/:boardId/columns/:columnId</code>)
                </h2>
                <pre className="mt-3 rounded-lg bg-slate-900 text-slate-100 p-4 text-xs font-mono overflow-x-auto leading-relaxed">
{`// Rename a column OR update its custom stages/options in settings JSONB
router.patch('/:boardId/columns/:columnId', async (req, res, next) => {
  const { boardId, columnId } = req.params;
  const { title, settings } = req.body;

  const { rows } = await db.query(
    \`UPDATE board_columns
     SET title = COALESCE($1, title),
         settings = CASE
           WHEN $2::jsonb IS NOT NULL THEN settings || $2::jsonb
           ELSE settings
         END
     WHERE id = $3 AND board_id = $4
     RETURNING *\`,
    [
      title !== undefined ? title.trim() : null,
      settings !== undefined ? JSON.stringify(settings) : null,
      columnId,
      boardId,
    ]
  );
  res.json({ column: rows[0] });
});`}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 4: YOUR AUTH EXERCISE GUIDE */}
          {activeTab === 'auth' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
                <h2 className="text-base font-bold text-amber-950 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-600" />
                  Your Hands-On Learning Exercise: Implementing Authentication
                </h2>
                <p className="mt-1 text-xs text-amber-900 leading-relaxed">
                  The boards, dynamic columns, custom column stages, and task tables are 100% wired up. We left clear, step-by-step scaffolds in 4 files so you can build the Authentication flow yourself from end to end.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="text-xs font-bold uppercase text-indigo-600">
                    Step 1 · Password Hashing & Registration
                  </div>
                  <div className="mt-1 font-semibold text-sm text-slate-900">
                    <code>server/routes/auth.js</code> → <code>POST /api/auth/register</code>
                  </div>
                  <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                    Validate <code>name</code>, <code>email</code>, and <code>password</code>. Hash the password with <code>await bcrypt.hash(password, 10)</code>, insert into the <code>users</code> table, and return a signed JWT using <code>jsonwebtoken</code>.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="text-xs font-bold uppercase text-indigo-600">
                    Step 2 · Login Credential Verification
                  </div>
                  <div className="mt-1 font-semibold text-sm text-slate-900">
                    <code>server/routes/auth.js</code> → <code>POST /api/auth/login</code>
                  </div>
                  <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                    Query <code>SELECT * FROM users WHERE email = $1</code>. Verify the hash with <code>await bcrypt.compare(password, user.password_hash)</code>, then sign and return a JWT with <code>{`{ sub: user.id, email: user.email }`}</code>.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="text-xs font-bold uppercase text-indigo-600">
                    Step 3 · Route Protection Middleware
                  </div>
                  <div className="mt-1 font-semibold text-sm text-slate-900">
                    <code>server/middleware/authMiddleware.js</code> → <code>requireAuth</code>
                  </div>
                  <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                    Parse the <code>Authorization: Bearer &lt;token&gt;</code> header, verify it with <code>jwt.verify(token, process.env.JWT_SECRET)</code>, set <code>req.user</code>, and swap <code>optionalAuth</code> for <code>requireAuth</code> in <code>server/routes/boards.js</code>.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="text-xs font-bold uppercase text-indigo-600">
                    Step 4 · Client Token Persistence
                  </div>
                  <div className="mt-1 font-semibold text-sm text-slate-900">
                    <code>client/src/components/AuthModal.jsx</code> & <code>client.js</code>
                  </div>
                  <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                    The React modal already sends credentials to <code>/api/auth/login</code> and <code>/api/auth/register</code> and attaches <code>localStorage.getItem('monday_lite_token')</code> to every board request.
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Column Stages / Available Values Editor Modal */}
      {activeOptionsColumn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-indigo-600" />
                  <h3 className="text-base font-bold text-slate-900">
                    Edit Stages / Options: {activeOptionsColumn.title}
                  </h3>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Stored in <code className="font-mono text-indigo-600">board_columns.settings.options</code> (JSONB)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOptionsModalColId(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Existing options list */}
            <div className="mt-4 space-y-2 max-h-60 overflow-y-auto pr-1">
              {getColumnOptions(activeOptionsColumn).map((opt) => {
                const preset = COLOR_PRESETS[opt.color] || COLOR_PRESETS.slate;
                return (
                  <div
                    key={opt.id}
                    className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/70 p-2"
                  >
                    <span className={`h-4 w-4 rounded-full shrink-0 ${preset.dot}`} />
                    <input
                      type="text"
                      value={opt.label}
                      onChange={(e) =>
                        handleUpdateStageOption(opt.id, 'label', e.target.value)
                      }
                      className="flex-1 rounded border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-800 focus:border-indigo-500 focus:outline-none"
                    />
                    <select
                      value={opt.color}
                      onChange={(e) =>
                        handleUpdateStageOption(opt.id, 'color', e.target.value)
                      }
                      className="rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 focus:border-indigo-500 focus:outline-none"
                    >
                      {Object.entries(COLOR_PRESETS).map(([key, cfg]) => (
                        <option key={key} value={key}>
                          {cfg.label}
                        </option>
                      ))}
                    </select>
                    {getColumnOptions(activeOptionsColumn).length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteStageOption(opt.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded"
                        title="Remove option"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Add new stage / option form */}
            <form
              onSubmit={handleAddStageOption}
              className="mt-4 pt-4 border-t border-slate-200 flex items-center gap-2"
            >
              <input
                type="text"
                value={newStageLabel}
                onChange={(e) => setNewStageLabel(e.target.value)}
                placeholder="New stage label (e.g. Ready for Prod)..."
                className="flex-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs focus:border-indigo-500 focus:outline-none"
              />
              <select
                value={newStageColor}
                onChange={(e) => setNewStageColor(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-700 focus:border-indigo-500 focus:outline-none"
              >
                {Object.entries(COLOR_PRESETS).map(([key, cfg]) => (
                  <option key={key} value={key}>
                    {cfg.label}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 shrink-0"
              >
                + Add
              </button>
            </form>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setOptionsModalColId(null)}
                className="rounded-lg bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auth Exercise Modal */}
      {authModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">
                  {authMode === 'login' ? 'Sign In (Auth Stub)' : 'Create Account (Auth Stub)'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAuthModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="mt-4 space-y-3.5">
              {authMode === 'register' && (
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                />
              </div>

              {authBanner && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                    <span>501 Not Implemented — Ready for your code!</span>
                  </div>
                  <p className="text-[11px]">
                    Sent <code className="font-mono font-semibold">POST {authBanner.endpoint}</code> with{' '}
                    <code className="font-mono">{JSON.stringify(authBanner.payload)}</code>. Open{' '}
                    <code className="font-mono underline">server/routes/auth.js</code> to complete the handler!
                  </p>
                </div>
              )}

              <button
                type="submit"
                className="w-full rounded-lg bg-indigo-600 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700 transition"
              >
                {authMode === 'login' ? 'Send POST /api/auth/login' : 'Send POST /api/auth/register'}
              </button>
            </form>

            <div className="mt-4 text-center text-xs text-slate-500">
              {authMode === 'login' ? (
                <>
                  Testing registration?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('register');
                      setAuthBanner(null);
                    }}
                    className="font-semibold text-indigo-600 hover:underline"
                  >
                    Switch to Register
                  </button>
                </>
              ) : (
                <>
                  Already registered?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('login');
                      setAuthBanner(null);
                    }}
                    className="font-semibold text-indigo-600 hover:underline"
                  >
                    Switch to Sign In
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
