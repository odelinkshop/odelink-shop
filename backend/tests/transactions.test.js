const { withTransaction } = require('../utils/transactions');

describe('withTransaction', () => {
  test('commits and releases client on success', async () => {
    const query = jest.fn()
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ rows: [{ ok: true }] })
      .mockResolvedValueOnce({});
    const release = jest.fn();
    const connect = jest.fn().mockResolvedValue({ query, release });

    const result = await withTransaction({ connect }, async (client) => client.query('SELECT 1'));

    expect(connect).toHaveBeenCalledTimes(1);
    expect(query).toHaveBeenNthCalledWith(1, 'BEGIN');
    expect(query).toHaveBeenNthCalledWith(2, 'SELECT 1');
    expect(query).toHaveBeenNthCalledWith(3, 'COMMIT');
    expect(release).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ rows: [{ ok: true }] });
  });

  test('rolls back and releases client on failure', async () => {
    const query = jest.fn()
      .mockResolvedValueOnce({})
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValueOnce({});
    const release = jest.fn();
    const connect = jest.fn().mockResolvedValue({ query, release });

    await expect(
      withTransaction({ connect }, async (client) => client.query('DELETE FROM users'))
    ).rejects.toThrow('boom');

    expect(query).toHaveBeenNthCalledWith(1, 'BEGIN');
    expect(query).toHaveBeenNthCalledWith(2, 'DELETE FROM users');
    expect(query).toHaveBeenNthCalledWith(3, 'ROLLBACK');
    expect(release).toHaveBeenCalledTimes(1);
  });
});
