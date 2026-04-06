import pool from './db';

/**
 * Log an activity to the database.
 * @param {string} userId - ID of the user performing the action.
 * @param {string} action - Descriptive action (e.g., 'Created Task', 'Updated Transaction').
 * @param {string} module - The module affected (e.g., 'Finance', 'Tasks', 'CRM').
 * @param {object} details - Any additional metadata as an object.
 */
export async function logActivity(userId, action, module, details = {}) {
  try {
    const id = 'log_' + Date.now() + Math.random().toString(36).substring(2, 5);
    await pool.query(
      'INSERT INTO activity_log (id, userId, action, module, details) VALUES (?, ?, ?, ?, ?)',
      [id, userId, action, module, JSON.stringify(details)]
    );
  } catch (error) {
    console.error('Activity Log Error:', error);
    // Fail silently so as not to break the main transaction flow
  }
}
