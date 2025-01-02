'use client';
import React, { createContext, useContext, useState, useEffect, useRef, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const AuthContext = createContext(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const checkingRef = useRef(false);
    const initialCheckDone = useRef(false);
    const authCheckTimeout = useRef(null);

    const checkAuth = async (force = false) => {
        // Prevent multiple simultaneous checks and unnecessary rechecks
        if ((checkingRef.current || initialCheckDone.current) && !force) {
            return;
        }

        // Clear any pending timeout
        if (authCheckTimeout.current) {
            clearTimeout(authCheckTimeout.current);
        }

        checkingRef.current = true;
        
        try {
            const response = await fetch('/api/admin/auth/check', {
                credentials: 'include'
            });
            const data = await response.json();

            setIsAuthenticated(data.isAuthenticated);
            if (data.isAuthenticated && !user) {
                const profileRes = await fetch('/api/admin/users/profile', {
                    credentials: 'include'
                });
                if (profileRes.ok) {
                    const profileData = await profileRes.json();
                    setUser(profileData.user);
                }
            } else if (!data.isAuthenticated) {
                setUser(null);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            setIsAuthenticated(false);
            setUser(null);
        } finally {
            setIsLoading(false);
            checkingRef.current = false;
            initialCheckDone.current = true;
        }
    };

    // Initial auth check
    useEffect(() => {
        checkAuth(true);
        return () => {
            if (authCheckTimeout.current) {
                clearTimeout(authCheckTimeout.current);
            }
        };
    }, []);

    const value = useMemo(() => ({
        isAuthenticated,
        user,
        isLoading,
        checkAuth: () => {
            // Debounce checkAuth calls
            if (authCheckTimeout.current) {
                clearTimeout(authCheckTimeout.current);
            }
            authCheckTimeout.current = setTimeout(() => checkAuth(true), 300);
        }
    }), [isAuthenticated, user, isLoading]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}