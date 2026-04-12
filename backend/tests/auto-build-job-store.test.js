jest.mock('../config/database', () => ({
  query: jest.fn()
}));

const pool = require('../config/database');
const AutoBuildJobStore = require('../models/AutoBuildJobStore');
const STATIC_THEME_ID = 'represent';

describe('AutoBuildJobStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('save persists trimmed logs and result site id', async () => {
    pool.query.mockImplementation((queryText) => {
      const sql = String(queryText || '');
      if (sql.includes('INSERT INTO auto_build_jobs')) {
        return Promise.resolve({ rows: [{ job_id: 'job-1' }] });
      }
      return Promise.resolve({ rows: [] });
    });

    const logs = Array.from({ length: 240 }, (_, index) => ({
      timestamp: `2026-03-07T00:00:${String(index).padStart(2, '0')}Z`,
      message: `log-${index}`
    }));

    const jobId = await AutoBuildJobStore.save({
      jobId: 'job-1',
      userId: 'user-1',
      shopierUrl: 'https://shopier.com/store',
      siteName: 'Store',
      subdomain: 'store',
      theme: STATIC_THEME_ID,
      status: 'running',
      progress: 42,
      message: 'Processing',
      logs,
      result: {
        site: {
          id: 'site-1'
        }
      }
    });

    expect(jobId).toBe('job-1');
    const insertCall = pool.query.mock.calls.find(([sql]) => String(sql).includes('INSERT INTO auto_build_jobs'));
    expect(insertCall).toBeTruthy();
    expect(insertCall[1][10]).toBe('site-1');
    expect(JSON.parse(insertCall[1][9])).toHaveLength(200);
  });

  test('findById normalizes stored row payload', async () => {
    pool.query.mockImplementation((queryText) => {
      const sql = String(queryText || '');
      if (sql.includes('SELECT') && sql.includes('FROM auto_build_jobs')) {
        return Promise.resolve({
          rows: [{
            job_id: 'job-1',
            user_id: 'user-1',
            shopier_url: 'https://shopier.com/store',
            site_name: 'Store',
            subdomain: 'store',
            theme: STATIC_THEME_ID,
            status: 'completed',
            progress: 100,
            message: 'Done',
            logs: [{ message: 'done' }],
            result_site_id: 'site-1',
            result_site: { id: 'site-1', subdomain: 'store' },
            created_at: '2026-03-07T10:00:00.000Z',
            updated_at: '2026-03-07T10:01:00.000Z',
            completed_at: '2026-03-07T10:01:00.000Z',
            cancelled_at: null
          }]
        });
      }
      return Promise.resolve({ rows: [] });
    });

    const job = await AutoBuildJobStore.findById('job-1');

    expect(job).toEqual(expect.objectContaining({
      jobId: 'job-1',
      userId: 'user-1',
      status: 'completed',
      progress: 100,
      resultSiteId: 'site-1'
    }));
    expect(job.result).toEqual({
      site: {
        id: 'site-1',
        subdomain: 'store'
      }
    });
  });

  test('listQueued returns normalized queued jobs in order', async () => {
    pool.query.mockImplementation((queryText) => {
      const sql = String(queryText || '');
      if (sql.includes("WHERE j.status = 'queued'")) {
        return Promise.resolve({
          rows: [{
            job_id: 'job-queued-1',
            user_id: 'user-1',
            shopier_url: 'https://shopier.com/store',
            site_name: 'Store',
            subdomain: 'store',
            theme: STATIC_THEME_ID,
            status: 'queued',
            progress: 0,
            message: 'Queued',
            logs: [],
            result_site_id: null,
            result_site: null,
            created_at: '2026-03-07T10:00:00.000Z',
            updated_at: '2026-03-07T10:00:00.000Z',
            completed_at: null,
            cancelled_at: null
          }]
        });
      }
      return Promise.resolve({ rows: [] });
    });

    const jobs = await AutoBuildJobStore.listQueued(10);

    expect(jobs).toHaveLength(1);
    expect(jobs[0]).toEqual(expect.objectContaining({
      jobId: 'job-queued-1',
      status: 'queued',
      subdomain: 'store'
    }));
  });
});
