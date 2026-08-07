/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { apiClient } from '../services/Api';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  roles: string[];
  permissions: string[];
}

export interface AuthResponse {
  accessToken: string;
  expiresIn: number;
  user: User;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (data: AuthResponse) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Module-level token — persists across React re-renders and HMR
let inMemoryToken: string | null = null;

// Module-level refresh state — so only one token refresh happens at a time
// even if interceptors are re-registered
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: unknown) => void; reject: (reason?: unknown) => void }> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Register interceptors once at module level so they are ALWAYS active,
// regardless of React component lifecycle (StrictMode double-invoke, HMR, etc.)
let _setUser: ((user: User | null) => void) | null = null;

const requestInterceptorId = apiClient.interceptors.request.use(
  (config) => {
    if (inMemoryToken && config.headers) {
      config.headers.set('Authorization', `Bearer ${inMemoryToken}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const responseInterceptorId = apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== '/auth/login' &&
      originalRequest.url !== '/auth/refresh' &&
      originalRequest.url !== '/auth/logout'
    ) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            if (originalRequest.headers.set) {
              originalRequest.headers.set('Authorization', 'Bearer ' + token);
            } else {
              originalRequest.headers.Authorization = 'Bearer ' + token;
            }
            return apiClient.request(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await apiClient.post<AuthResponse>('/auth/refresh');
        inMemoryToken = data.accessToken;
        if (_setUser) _setUser(data.user);
        processQueue(null, data.accessToken);
        if (originalRequest.headers.set) {
          originalRequest.headers.set('Authorization', 'Bearer ' + data.accessToken);
        } else {
          originalRequest.headers.Authorization = 'Bearer ' + data.accessToken;
        }
        return apiClient.request(originalRequest);
      } catch (err) {
        processQueue(err, null);
        inMemoryToken = null;
        if (_setUser) _setUser(null);
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

// Suppress unused variable warnings — interceptors are registered for their side effects
void requestInterceptorId;
void responseInterceptorId;

let authInitialized = false;

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Keep module-level setter in sync with the current component instance
  useEffect(() => {
    _setUser = setUser;
    return () => {
      // Don't null out on cleanup — the interceptor should still be able to call setUser
      // if a request completes after unmount (edge case, but safer to keep it)
    };
  }, [setUser]);

  const login = (data: AuthResponse) => {
    inMemoryToken = data.accessToken;
    setUser(data.user);
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (e) {
      console.error('Logout failed', e);
    } finally {
      inMemoryToken = null;
      setUser(null);
    }
  };

  useEffect(() => {

    let isRefreshing = false;
    let failedQueue: Array<{ resolve: (value?: unknown) => void, reject: (reason?: unknown) => void }> = [];

    const processQueue = (error: unknown, token: string | null = null) => {
      failedQueue.forEach(prom => {
        if (error) {
          prom.reject(error);
        } else {
          prom.resolve(token);
        }
      });
      failedQueue = [];
    };

    const requestInterceptor = apiClient.interceptors.request.use(
      (config) => {
        if (inMemoryToken && config.headers) {
          if (config.headers.set) {
            config.headers.set('Authorization', `Bearer ${inMemoryToken}`);
          } else {
            config.headers.Authorization = `Bearer ${inMemoryToken}`;
          }
        } else if (!inMemoryToken && config.headers) {
          if (config.headers.delete) {
            config.headers.delete('Authorization');
          } else {
            delete config.headers.Authorization;
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = apiClient.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry &&
          originalRequest.url !== '/auth/login' &&
          originalRequest.url !== '/auth/refresh' &&
          originalRequest.url !== '/auth/logout') {
          if (isRefreshing) {
            return new Promise(function (resolve, reject) {
              failedQueue.push({ resolve, reject });
            }).then(token => {
              if (originalRequest.headers.set) {
                originalRequest.headers.set('Authorization', 'Bearer ' + token);
              } else {
                originalRequest.headers.Authorization = 'Bearer ' + token;
              }
              return apiClient.request(originalRequest);
            }).catch(err => {
              return Promise.reject(err);
            });
          }

          originalRequest._retry = true;
          isRefreshing = true;

          try {
            const { data } = await apiClient.post<AuthResponse>('/auth/refresh');
            inMemoryToken = data.accessToken;
            setUser(data.user);
            processQueue(null, data.accessToken);
            if (originalRequest.headers.set) {
              originalRequest.headers.set('Authorization', 'Bearer ' + data.accessToken);
            } else {
              originalRequest.headers.Authorization = 'Bearer ' + data.accessToken;
            }
            return apiClient.request(originalRequest);
          } catch (err) {
            processQueue(err, null);
            inMemoryToken = null;
            setUser(null);
            window.location.href = '/login';
            return Promise.reject(err);
          } finally {
            isRefreshing = false;
          }
        }
        return Promise.reject(error);
      }
    );

    const initializeAuth = async () => {
      try {
        const response = await apiClient.post<AuthResponse>('/auth/refresh', null, {
          timeout: 5000,
          validateStatus: (status) => (status >= 200 && status < 300) || status === 401,
        });

        if (response.status === 401) {
          inMemoryToken = null;
        } else {
          inMemoryToken = response.data.accessToken;
          setUser(response.data.user);
        }
      } catch {
        inMemoryToken = null;
      } finally {
        setIsLoading(false);
      }
    };

    if (!authInitialized) {
      authInitialized = true;
      initializeAuth();
    } else {
      // Already initialized (e.g. StrictMode second mount) — no need to re-fetch
      setIsLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
