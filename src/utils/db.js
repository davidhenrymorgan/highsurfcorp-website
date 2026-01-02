/**
 * Database utilities with safe error handling
 * Never leaks SQL syntax to users
 */

/**
 * Safe database query wrapper - catches D1 errors and returns 503
 */
export async function safeDbQuery(db, sql, params = []) {
  try {
    const stmt = db.prepare(sql);
    if (params.length > 0) {
      return await stmt.bind(...params).all();
    }
    return await stmt.all();
  } catch (err) {
    console.error("D1 Database Error:", { message: err.message, sql });
    const error = new Error("Database unavailable");
    error.status = 503;
    throw error;
  }
}

/**
 * Safe database query for single result
 */
export async function safeDbFirst(db, sql, params = []) {
  try {
    const stmt = db.prepare(sql);
    if (params.length > 0) {
      return await stmt.bind(...params).first();
    }
    return await stmt.first();
  } catch (err) {
    console.error("D1 Database Error:", { message: err.message, sql });
    const error = new Error("Database unavailable");
    error.status = 503;
    throw error;
  }
}
