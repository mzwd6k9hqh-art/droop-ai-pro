import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type PlanType = 'free' | 'starter' | 'pro' | 'premium';

interface User {
  email: string;
  name: string;
  storeUrl: string;
  plan: PlanType;
  dailyAiMessagesUsed: number;
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
  getAiMessagesRemaining: () => number;
  getDailyLimit: () => number;
  isUnlimitedPlan: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'salesbooster_users';
const CURRENT_USER_KEY = 'salesbooster_current_user';

const getTodayDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

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

  const checkAndResetDailyLimit = (userData: User & { password: string }): User & { password: string } => {
    const today = getTodayDate();
    if (userData.lastMessageDate !== today) {
      userData.dailyAiMessagesUsed = 0;
      userData.lastMessageDate = today;
    }
    return userData;
  };

  useEffect(() => {
    const currentUserEmail = localStorage.getItem(CURRENT_USER_KEY);
    if (currentUserEmail) {
      const users = getUsers();
      let userData = users[currentUserEmail];
      if (userData) {
        // Check and reset daily limit on load
        userData = checkAndResetDailyLimit(userData);
        users[currentUserEmail] = userData;
        saveUsers(users);
        
        const { password, ...userWithoutPassword } = userData;
        setUser(userWithoutPassword);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const users = getUsers();
    let userData = users[email.toLowerCase()];
    
    if (userData && userData.password === password) {
      // Check and reset daily limit on login
      userData = checkAndResetDailyLimit(userData);
      users[email.toLowerCase()] = userData;
      saveUsers(users);
      
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
      dailyAiMessagesUsed: 0,
      lastMessageDate: getTodayDate(),
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

  const isUnlimitedPlan = (): boolean => {
    if (!user) return false;
    return user.plan === 'premium';
  };

  const getDailyLimit = (): number => {
    if (!user) return 5;
    switch (user.plan) {
      case 'free': return 5;
      case 'starter': return 25;
      case 'pro': return 100;
      case 'premium': return Infinity;
      default: return 5;
    }
  };

  const getAiMessagesRemaining = (): number => {
    if (!user) return 0;
    
    // Paid plans have unlimited messages
    if (isUnlimitedPlan()) return Infinity;
    
    // Check if we need to reset for a new day
    const today = getTodayDate();
    if (user.lastMessageDate !== today) {
      return getDailyLimit();
    }
    
    return Math.max(0, getDailyLimit() - user.dailyAiMessagesUsed);
  };

  const incrementAiMessages = (): boolean => {
    if (!user) return false;
    
    // Paid plans can always send
    if (isUnlimitedPlan()) return true;
    
    const today = getTodayDate();
    const users = getUsers();
    
    if (!users[user.email]) return false;
    
    // Reset counter if it's a new day
    if (user.lastMessageDate !== today) {
      users[user.email].dailyAiMessagesUsed = 0;
      users[user.email].lastMessageDate = today;
    }
    
    // Check if limit reached
    if (users[user.email].dailyAiMessagesUsed >= getDailyLimit()) {
      return false;
    }
    
    // Increment counter
    users[user.email].dailyAiMessagesUsed += 1;
    users[user.email].lastMessageDate = today;
    saveUsers(users);
    
    setUser({
      ...user,
      dailyAiMessagesUsed: users[user.email].dailyAiMessagesUsed,
      lastMessageDate: today,
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
        getAiMessagesRemaining,
        getDailyLimit,
        isUnlimitedPlan,
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
