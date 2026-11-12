import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface AuthUser {
  username: string;
  role: 'admin';
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAdminOpen: boolean;
  openAdmin: () => void;
  closeAdmin: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'bemgarota_admin_token';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);

  const verifyToken = useCallback(async (tokenToVerify: string) => {
    try {
      const res = await fetch('/api/auth/verify', {
        headers: { Authorization: `Bearer ${tokenToVerify}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
      }
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      verifyToken(token);
    } else {
      setIsLoading(false);
    }
  }, [token, verifyToken]);

  const login = async (username: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem(TOKEN_KEY, data.token);
        setToken(data.token);
        setUser(data.user);
        return { success: true };
      }
      return { success: false, error: data.error || 'Credenciais inválidas' };
    } catch {
      return { success: false, error: 'Erro de conexão com o servidor' };
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    setIsAdminOpen(false);
  };

  const openAdmin = () => setIsAdminOpen(true);
  const closeAdmin = () => setIsAdminOpen(false);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        isAdminOpen,
        openAdmin,
        closeAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
