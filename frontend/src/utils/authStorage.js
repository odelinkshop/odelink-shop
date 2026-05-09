import { getApiBase } from './apiBase';

export const AUTH_TOKEN_KEY = 'odelink_token';
export const AUTH_USER_KEY = 'odelink_user';
export const ADMIN_UI_KEY = 'odelink_admin_ui';
export const ADMIN_EMAIL_KEY = 'odelink_admin_email';

const AUTH_CHANGE_EVENT = 'odelink:auth-changed';
const SESSION_ENDPOINT = '/api/auth/session';
const REFRESH_ENDPOINT = '/api/auth/refresh';

function getStorage() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
  } catch (error) {
    void error;
  }
  return null;
}

function emitAuthChange() {
  try {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
    }
  } catch (error) {
    void error;
  }
}

export function getAuthToken() {
  const storage = getStorage();
  return (storage?.getItem(AUTH_TOKEN_KEY) || '').toString();
}

export function hasAuthToken() {
  return Boolean(getAuthToken());
}

export function getStoredUser() {
  const storage = getStorage();
  const raw = storage?.getItem(AUTH_USER_KEY) || '';
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
}

export function getStoredUserEmail() {
  return (getStoredUser()?.email || '').toString().trim().toLowerCase();
}

export function setAuthSession({ token, user } = {}) {
  const storage = getStorage();
  if (!storage) return;

  try {
    if (token) {
      storage.setItem(AUTH_TOKEN_KEY, token.toString());
    }
    if (user && typeof user === 'object') {
      storage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    }
  } catch (error) {
    void error;
  }

  emitAuthChange();
}

export function setAdminUiEnabled(enabled, email) {
  const storage = getStorage();
  if (!storage) return;

  try {
    if (enabled) {
      storage.setItem(ADMIN_UI_KEY, '1');
      const normalizedEmail = (email || getStoredUserEmail()).toString().trim().toLowerCase();
      if (normalizedEmail) {
        storage.setItem(ADMIN_EMAIL_KEY, normalizedEmail);
      }
    } else {
      storage.removeItem(ADMIN_UI_KEY);
      storage.removeItem(ADMIN_EMAIL_KEY);
    }
  } catch (error) {
    void error;
  }

  emitAuthChange();
}

export function isAdminUiEnabled(allowedEmail) {
  const storage = getStorage();
  const adminUiFlag = storage?.getItem(ADMIN_UI_KEY) === '1';
  const currentEmail = getStoredUserEmail();
  const targetEmail = (allowedEmail || '').toString().trim().toLowerCase();
  if (!adminUiFlag || !currentEmail || !targetEmail) return false;
  return currentEmail === targetEmail;
}

export function clearAuthSession({ preserveAdminUi = false } = {}) {
  const storage = getStorage();
  if (!storage) return;

  try {
    storage.removeItem(AUTH_TOKEN_KEY);
    storage.removeItem(AUTH_USER_KEY);
    if (!preserveAdminUi) {
      storage.removeItem(ADMIN_UI_KEY);
      storage.removeItem(ADMIN_EMAIL_KEY);
    }
  } catch (error) {
    void error;
  }

  emitAuthChange();
}

export function buildCookieFetchOptions(baseOptions = {}) {
  return {
    ...baseOptions,
    credentials: 'include'
  };
}

export function getAuthHeaders(baseHeaders = {}) {
  const token = getAuthToken();
  if (!token) return { ...baseHeaders };
  return {
    ...baseHeaders,
    Authorization: `Bearer ${token}`
  };
}

export function getAuthSnapshot() {
  const token = getAuthToken();
  const user = getStoredUser();
  return {
    token,
    user,
    isLoggedIn: Boolean(token)
  };
}

const syncAuthSessionFromResponse = (data, { clearOnMissing = false } = {}) => {
  const token = (data?.token || '').toString();
  const user = data?.user && typeof data.user === 'object' ? data.user : null;

  if (token && user) {
    setAuthSession({ token, user });
    return getAuthSnapshot();
  }

  if (clearOnMissing) {
    clearAuthSession({ preserveAdminUi: true });
  }

  return null;
};

export async function hydrateAuthSessionFromServer() {
  try {
    const response = await fetch(`${getApiBase()}${SESSION_ENDPOINT}`, buildCookieFetchOptions({
      method: 'GET',
      headers: getAuthHeaders()
    }));
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (response.status === 401) {
        clearAuthSession({ preserveAdminUi: true });
      }
      return null;
    }

    return syncAuthSessionFromResponse(data, { clearOnMissing: true });
  } catch (error) {
    return null;
  }
}

export async function refreshAuthSessionFromServer() {
  try {
    const response = await fetch(`${getApiBase()}${REFRESH_ENDPOINT}`, buildCookieFetchOptions({
      method: 'POST',
      headers: getAuthHeaders()
    }));
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (response.status === 401) {
        clearAuthSession({ preserveAdminUi: true });
      }
      return null;
    }

    return syncAuthSessionFromResponse(data, { clearOnMissing: true });
  } catch (error) {
    return null;
  }
}

export function subscribeToAuthChanges(onChange) {
  if (typeof window === 'undefined' || typeof onChange !== 'function') {
    return () => {};
  }

  const listener = () => {
    onChange(getAuthSnapshot());
  };

  const storageListener = (event) => {
    const key = (event?.key || '').toString();
    if (!key || [AUTH_TOKEN_KEY, AUTH_USER_KEY, ADMIN_UI_KEY, ADMIN_EMAIL_KEY].includes(key)) {
      listener();
    }
  };

  window.addEventListener(AUTH_CHANGE_EVENT, listener);
  window.addEventListener('storage', storageListener);

  return () => {
    window.removeEventListener(AUTH_CHANGE_EVENT, listener);
    window.removeEventListener('storage', storageListener);
  };
}

export async function logoutAuthSession() {
  try {
    await fetch(`${getApiBase()}/api/auth/logout`, buildCookieFetchOptions({
      method: 'POST',
      headers: getAuthHeaders()
    }));
  } catch (error) {
    void error;
  }

  clearAuthSession();
}
