export async function apiRequest(path, options = {}) {
  let token = null;
  try {
    token = localStorage.getItem('monday_lite_token');
  } catch (_e) {}

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(path, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || data.message || `Request failed (${res.status})`);
  }
  return data;
}

export const BoardsAPI = {
  listBoards: () => apiRequest('/api/boards'),
  getBoard: (boardId) => apiRequest(`/api/boards/${boardId}`),
  createBoard: (payload) =>
    apiRequest('/api/boards', { method: 'POST', body: JSON.stringify(payload) }),
  deleteBoard: (boardId) =>
    apiRequest(`/api/boards/${boardId}`, { method: 'DELETE' }),
  addColumn: (boardId, payload) =>
    apiRequest(`/api/boards/${boardId}/columns`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  renameColumn: (boardId, columnId, title) =>
    apiRequest(`/api/boards/${boardId}/columns/${columnId}`, {
      method: 'PATCH',
      body: JSON.stringify({ title }),
    }),
  deleteColumn: (boardId, columnId) =>
    apiRequest(`/api/boards/${boardId}/columns/${columnId}`, {
      method: 'DELETE',
    }),
  addTask: (boardId, payload) =>
    apiRequest(`/api/boards/${boardId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateTask: (boardId, taskId, payload) =>
    apiRequest(`/api/boards/${boardId}/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  deleteTask: (boardId, taskId) =>
    apiRequest(`/api/boards/${boardId}/tasks/${taskId}`, {
      method: 'DELETE',
    }),
};
