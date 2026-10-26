-- ============================================================================
-- Monday-Lite PostgreSQL Schema (Relational Core + JSONB Dynamic Cell Values)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Users table (Ready for your Auth implementation!)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(120) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Boards table
CREATE TABLE IF NOT EXISTS boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(160) NOT NULL,
  description TEXT DEFAULT '',
  owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Dynamic Columns definition per Board
CREATE TABLE IF NOT EXISTS board_columns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  title VARCHAR(100) NOT NULL,
  type VARCHAR(32) NOT NULL CHECK (type IN ('status', 'dropdown', 'text', 'date', 'person', 'number')),
  position INTEGER NOT NULL DEFAULT 0,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_board_columns_board_pos ON board_columns(board_id, position);

-- 4. Tasks (Rows) per Board
-- `values` stores a JSONB object mapping `board_columns.id::text` -> cell value
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  values JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tasks_board_pos ON tasks(board_id, position);
CREATE INDEX IF NOT EXISTS idx_tasks_values_gin ON tasks USING GIN (values);
