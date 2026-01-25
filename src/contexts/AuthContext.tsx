import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type PlanType = 'free' | 'starter' | 'pro' | 'premium';

interface User {
  email: string;
  name: string;
  storeUrl: string;
  plan: PlanType;
  aiMessagesUsedToday: number;
  lastMessageDate: string;
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
  getAiMessagesUsedToday: () => number;
  getDailyLimit: () => number;
  isUnlimited: () => boolean;
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

    const today = new Date().toISOString().split('T')[0];
    const newUser: User & { password: string } = {
      email: emailLower,
      name,
      storeUrl,
      password,
      plan: 'free',
      aiMessagesUsedToday: 0,
      lastMessageDate: today,
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
      saveUsers(users);
      setUser({ ...user, plan });
    }
  };

  const isUnlimited = (): boolean => {
    if (!user) return false;
    return user.plan !== 'free';
  };

  const getDailyLimit = (): number => {
    return 5; // Free plan daily limit
  };

  const getTodayDate = (): string => {
    return new Date().toISOString().split('T')[0];
  };

  const getAiMessagesUsedToday = (): number => {
    if (!user) return 0;
    
    const today = getTodayDate();
    
    // If it's a new day, the count should be 0
    if (user.lastMessageDate !== today) {
      return 0;
    }
    
    return user.aiMessagesUsedToday;
  };

  const incrementAiMessages = (): boolean => {
    if (!user) return false;
    
    // Paid plans have unlimited access
    if (isUnlimited()) {
      return true;
    }
    
    const today = getTodayDate();
    const users = getUsers();
    
    if (!users[user.email]) return false;
    
    // Reset counter if it's a new day
    if (user.lastMessageDate !== today) {
      users[user.email].aiMessagesUsedToday = 0;
      users[user.email].lastMessageDate = today;
    }
    
    // Check if limit reached
    if (users[user.email].aiMessagesUsedToday >= getDailyLimit()) {
      return false;
    }

    // Increment counter
    users[user.email].aiMessagesUsedToday += 1;
    users[user.email].lastMessageDate = today;
    saveUsers(users);
    
    setUser({ 
      ...user, 
      aiMessagesUsedToday: users[user.email].aiMessagesUsedToday,
      lastMessageDate: today 
    });
    
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
        getAiMessagesUsedToday,
        getDailyLimit,
        isUnlimited,
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
