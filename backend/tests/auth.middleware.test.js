jest.mock('jsonwebtoken', () => ({
  verify: jest.fn()
}));

const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/auth');

const createRes = () => {
  const res = {
    status: jest.fn(() => res),
    json: jest.fn(() => res)
  };
  return res;
};

describe('auth middleware', () => {
  const originalSecret = process.env.JWT_SECRET;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
  });

  afterAll(() => {
    process.env.JWT_SECRET = originalSecret;
  });

  test('extractBearerToken parses bearer header case-insensitively', () => {
    expect(authMiddleware.extractBearerToken('Bearer abc')).toBe('abc');
    expect(authMiddleware.extractBearerToken('bearer xyz')).toBe('xyz');
    expect(authMiddleware.extractBearerToken('Token abc')).toBe('');
  });

  test('rejects malformed authorization header', () => {
    const req = {
      header: jest.fn().mockReturnValue('Token abc')
    };
    const res = createRes();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('attaches authenticated user id', () => {
    jwt.verify.mockReturnValue({ userId: 'user-1' });
    const req = {
      header: jest.fn().mockReturnValue('Bearer token-1')
    };
    const res = createRes();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(req.userId).toBe('user-1');
    expect(next).toHaveBeenCalledTimes(1);
  });

  test('falls back to access cookie when authorization header is missing', () => {
    jwt.verify.mockReturnValue({ userId: 'user-2' });
    const req = {
      header: jest.fn().mockReturnValue(''),
      headers: {
        cookie: 'odelink_access=cookie-token'
      }
    };
    const res = createRes();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(req.userId).toBe('user-2');
    expect(req.authSource).toBe('cookie');
    expect(next).toHaveBeenCalledTimes(1);
  });
});
