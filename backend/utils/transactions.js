const withTransaction = async (pool, handler) => {
  if (!pool || typeof pool.connect !== 'function') {
    throw new Error('Database pool does not support transactions');
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const result = await handler(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      void rollbackError;
    }
    throw error;
  } finally {
    try {
      client.release();
    } catch (releaseError) {
      void releaseError;
    }
  }
};

module.exports = {
  withTransaction
};
