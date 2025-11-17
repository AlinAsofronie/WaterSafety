'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getCurrentUser, signIn, signOut, fetchAuthSession } from 'aws-amplify/auth';
import { configureAmplify } from '@/lib/cognito';
import { localAuth, configureLocalAuth } from '@/lib/local-auth';

interface User {
  username: string;
  email?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Check if we should use local auth
const USE_LOCAL_AUTH = typeof window !== 'undefined' &&
  (process.env.NEXT_PUBLIC_USE_LOCAL_AUTH === 'true' ||
   (!process.env.NEXT_PUBLIC_AWS_ENABLED && process.env.NODE_ENV === 'development'));

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (USE_LOCAL_AUTH) {
      configureLocalAuth();
      checkLocalAuthState();
    } else {
      configureAmplify();
      checkAuthState();
    }
  }, []);

  const checkLocalAuthState = async () => {
    try {
      const currentUser = await localAuth.getCurrentUser();
      const userData = {
        username: currentUser.name,
        email: currentUser.email
      };
      setUser(userData);
      localStorage.setItem('currentUser', JSON.stringify(userData));
    } catch (error) {
      console.log('Local auth initialization failed');
    } finally {
      setIsLoading(false);
    }
  };

  const checkAuthState = async () => {
    try {
      const currentUser = await getCurrentUser();
      const session = await fetchAuthSession();

      if (currentUser && session.tokens) {
        const userData = {
          username: currentUser.username,
          email: currentUser.signInDetails?.loginId
        };
        setUser(userData);
        // Store user info in localStorage for getCurrentUser() function
        localStorage.setItem('currentUser', JSON.stringify(userData));
      }
    } catch (error) {
      console.log('No authenticated user');
      // Clear user data from localStorage if not authenticated
      localStorage.removeItem('currentUser');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (email: string, password: string) => {
    try {
      if (USE_LOCAL_AUTH) {
        const currentUser = await localAuth.signIn(email, password);
        const userData = {
          username: currentUser.name,
          email: currentUser.email
        };
        setUser(userData);
        localStorage.setItem('currentUser', JSON.stringify(userData));
      } else {
        const { isSignedIn } = await signIn({ username: email, password });
        if (isSignedIn) {
          await checkAuthState();
        }
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const handleSignOut = async () => {
    try {
      if (USE_LOCAL_AUTH) {
        await localAuth.signOut();
      } else {
        await signOut();
      }
      setUser(null);
      // Clear user data from localStorage on sign out
      localStorage.removeItem('currentUser');
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    signIn: handleSignIn,
    signOut: handleSignOut,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 