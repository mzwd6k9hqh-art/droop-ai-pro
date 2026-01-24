import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type PlanType = 'free' | 'starter' | 'pro' | 'premium';

interface User {
  email: string;
  name: string;
  storeUrl: string;
  plan: PlanType;
  aiMessagesUsed: number;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, name: string, password: string, storeUrl: string) => Promise<boolean>;
  logout: () => void;
  updatePlan: (plan: PlanType) => void;
  incrementAiMessages: () => boolean;
  getAiMessagesRemaining: () => number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'salesbooster_users';
const CURRENT_USER_KEY = 'salesbooster_current_user';

const getUsers = (): Record<string, User & { password: string }> => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : {};
};

const saveUsers = (users: Record<string, User & { password: string }>) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const currentUserEmail = localStorage.getItem(CURRENT_USER_KEY);
    if (currentUserEmail) {
      const users = getUsers();
      const userData = users[currentUserEmail];
      if (userData) {
        const { password, ...userWithoutPassword } = userData;
        setUser(userWithoutPassword);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const users = getUsers();
    const userData = users[email.toLowerCase()];
    
    if (userData && userData.password === password) {
      const { password: _, ...userWithoutPassword } = userData;
      setUser(userWithoutPassword);
      localStorage.setItem(CURRENT_USER_KEY, email.toLowerCase());
      return true;
    }
    return false;
  };

  const register = async (email: string, name: string, password: string, storeUrl: string): Promise<boolean> => {
    const users = getUsers();
    const emailLower = email.toLowerCase();
    
    if (users[emailLower]) {
      return false;
    }

    const newUser: User & { password: string } = {
      email: emailLower,
      name,
      storeUrl,
      password,
      plan: 'free',
      aiMessagesUsed: 0,
      createdAt: new Date().toISOString(),
    };

    users[emailLower] = newUser;
    saveUsers(users);

    const { password: _, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);
    localStorage.setItem(CURRENT_USER_KEY, emailLower);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
  };

  const updatePlan = (plan: PlanType) => {
    if (!user) return;
    
    const users = getUsers();
    if (users[user.email]) {
      users[user.email].plan = plan;
      users[user.email].aiMessagesUsed = 0; // Reset on upgrade
      saveUsers(users);
      setUser({ ...user, plan, aiMessagesUsed: 0 });
    }
  };

  const getAiMessagesRemaining = (): number => {
    if (!user) return 0;
    
    const limits: Record<PlanType, number> = {
      free: 5,
      starter: 50,
      pro: 200,
      premium: Infinity,
    };
    
    return Math.max(0, limits[user.plan] - user.aiMessagesUsed);
  };

  const incrementAiMessages = (): boolean => {
    if (!user) return false;
    
    const remaining = getAiMessagesRemaining();
    if (remaining <= 0) return false;

    const users = getUsers();
    if (users[user.email]) {
      users[user.email].aiMessagesUsed += 1;
      saveUsers(users);
      setUser({ ...user, aiMessagesUsed: user.aiMessagesUsed + 1 });
    }
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updatePlan,
        incrementAiMessages,
        getAiMessagesRemaining,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
