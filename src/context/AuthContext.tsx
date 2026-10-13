import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { supabase, isSupabaseConfigured } from '../services/supabase';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, role?: UserRole) => Promise<void>;
  signUp: (email: string, fullName: string, role?: UserRole) => Promise<void>;
  signInCustomer: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signUpCustomer: (email: string, fullName: string, password?: string, phone?: string) => Promise<{ success: boolean; error?: string }>;
  signInMerchant: (email: string, password?: string) => Promise<{ success: boolean; error?: string; isPending?: boolean }>;
  resetPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  signOut: () => Promise<void>;
  switchDemoRole: (role: UserRole) => void;
  switchDemoUser: (customUser: UserProfile) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
}

const DEFAULT_DEMO_USERS: Record<UserRole, UserProfile> = {
  customer: {
    id: 'user-cust-1',
    email: 'ade.bello@example.ng',
    full_name: 'Adekunle Bello',
    phone: '+234 802 345 6789',
    role: 'customer',
    created_at: '2025-01-12T10:00:00Z',
  },
  seller: {
    id: 'user-seller-1',
    email: 'chidi.apex@example.ng',
    full_name: 'Chidi Okonkwo (Apex Gadgets)',
    phone: '+234 803 291 4482',
    role: 'seller',
    created_at: '2025-01-10T08:00:00Z',
  },
  store_manager: {
    id: 'user-mgr-1',
    email: 'manager@kumaji.ng',
    full_name: 'Fatima Garba',
    phone: '+234 809 111 2233',
    role: 'store_manager',
    created_at: '2025-01-05T09:00:00Z',
  },
  support: {
    id: 'user-supp-1',
    email: 'support@kumaji.ng',
    full_name: 'Zainab Mohammed',
    phone: '+234 807 444 5566',
    role: 'support',
    created_at: '2025-01-05T09:00:00Z',
  },
  super_admin: {
    id: 'user-admin-1',
    email: 'admin@kumaji.ng',
    full_name: 'Oluwaseun Vance (Super Admin)',
    phone: '+234 801 999 8877',
    role: 'super_admin',
    created_at: '2025-01-01T00:00:00Z',
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('kumaji_user_session');
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    // Default to active customer for instant high-frictionless testing
    return DEFAULT_DEMO_USERS.customer;
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('kumaji_user_session', JSON.stringify(user));
    } else {
      localStorage.removeItem('kumaji_user_session');
    }
  }, [user]);

  const signIn = async (email: string, role: UserRole = 'customer') => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 300));
    const demoUser = DEFAULT_DEMO_USERS[role] || {
      id: `usr-${Date.now()}`,
      email,
      full_name: email.split('@')[0],
      role,
      created_at: new Date().toISOString(),
    };
    setUser(demoUser);
    setIsLoading(false);
  };

  const signUp = async (email: string, fullName: string, role: UserRole = 'customer') => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 300));
    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      email,
      full_name: fullName,
      role,
      created_at: new Date().toISOString(),
    };
    setUser(newUser);
    setIsLoading(false);
  };

  const signInCustomer = async (email: string, password = ''): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      if (!email || !email.includes('@')) {
        return { success: false, error: 'Please enter a valid email address.' };
      }
      if (password && password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters long.' };
      }

      // If Supabase is configured with live credentials, authenticate through Supabase
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          return { success: false, error: error.message };
        }
        if (data.user) {
          const profile: UserProfile = {
            id: data.user.id,
            email: data.user.email || email,
            full_name: data.user.user_metadata?.full_name || email.split('@')[0],
            role: 'customer',
            created_at: data.user.created_at || new Date().toISOString(),
          };
          setUser(profile);
          return { success: true };
        }
      }

      // Safe local / demo flow
      await new Promise((r) => setTimeout(r, 350));
      const customerUser: UserProfile = {
        id: `cust-${Date.now()}`,
        email: email.trim(),
        full_name: email.split('@')[0].replace('.', ' '),
        role: 'customer',
        created_at: new Date().toISOString(),
      };
      setUser(customerUser);
      return { success: true };
    } finally {
      setIsLoading(false);
    }
  };

  const signUpCustomer = async (
    email: string,
    fullName: string,
    password = '',
    phone = ''
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      if (!fullName.trim()) {
        return { success: false, error: 'Please enter your full name.' };
      }
      if (!email || !email.includes('@')) {
        return { success: false, error: 'Please enter a valid email address.' };
      }
      if (password && password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters long.' };
      }

      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName, phone, role: 'customer' } },
        });
        if (error) {
          return { success: false, error: error.message };
        }
        if (data.user) {
          const profile: UserProfile = {
            id: data.user.id,
            email: data.user.email || email,
            full_name: fullName,
            phone,
            role: 'customer',
            created_at: new Date().toISOString(),
          };
          setUser(profile);
          return { success: true };
        }
      }

      await new Promise((r) => setTimeout(r, 350));
      const newUser: UserProfile = {
        id: `cust-${Date.now()}`,
        email: email.trim(),
        full_name: fullName.trim(),
        phone: phone.trim() || undefined,
        role: 'customer',
        created_at: new Date().toISOString(),
      };
      setUser(newUser);
      return { success: true };
    } finally {
      setIsLoading(false);
    }
  };

  const signInMerchant = async (
    email: string,
    password = ''
  ): Promise<{ success: boolean; error?: string; isPending?: boolean }> => {
    setIsLoading(true);
    try {
      if (!email || !email.includes('@')) {
        return { success: false, error: 'Please enter a valid merchant email address.' };
      }
      if (password && password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters long.' };
      }

      await new Promise((r) => setTimeout(r, 400));

      // Check if email matches recognized seller or admin
      const isKnownMerchant = email.toLowerCase().includes('apex') || email.toLowerCase().includes('seller') || email.toLowerCase().includes('chidi');
      const isPendingEmail = email.toLowerCase().includes('pending');

      if (isPendingEmail) {
        return {
          success: false,
          isPending: true,
          error: 'Your merchant application is currently pending admin verification. You will receive an SMS and email notification upon approval.',
        };
      }

      const merchantUser: UserProfile = isKnownMerchant
        ? DEFAULT_DEMO_USERS.seller
        : {
            id: `seller-${Date.now()}`,
            email: email.trim(),
            full_name: `${email.split('@')[0]} (Verified Merchant)`,
            role: 'seller',
            created_at: new Date().toISOString(),
          };

      setUser(merchantUser);
      return { success: true };
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true);
    try {
      if (!email || !email.includes('@')) {
        return { success: false, message: 'Please enter a valid email address.' };
      }

      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) {
          return { success: false, message: error.message };
        }
      }

      await new Promise((r) => setTimeout(r, 400));
      return {
        success: true,
        message: `Password reset instructions have been dispatched to ${email}. Please check your inbox.`,
      };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    await new Promise((r) => setTimeout(r, 150));
    setUser(null);
    setIsLoading(false);
  };

  const switchDemoRole = (role: UserRole) => {
    setUser(DEFAULT_DEMO_USERS[role]);
  };

  const switchDemoUser = (customUser: UserProfile) => {
    setUser(customUser);
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (user) {
      setUser({ ...user, ...updates });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'customer',
        isAuthenticated: !!user,
        isLoading,
        signIn,
        signUp,
        signInCustomer,
        signUpCustomer,
        signInMerchant,
        resetPassword,
        signOut,
        switchDemoRole,
        switchDemoUser,
        updateProfile,
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
