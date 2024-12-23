"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export function withRoleCheck(WrappedComponent, allowedRoles = ['admin']) {
  return function ProtectedRoute(props) {
    const router = useRouter();
    const auth = useAuth();
    const userRole = auth.user?.role;

    useEffect(() => {
      if (auth.authChecked && !allowedRoles.includes(userRole)) {
        router.replace('/admin/access-denied');
      }
    }, [userRole, auth.authChecked]);

    // Don't render anything while checking auth
    if (!auth.authChecked) {
      return null;
    }

    // If user doesn't have permission, don't render the component
    if (!allowedRoles.includes(userRole)) {
      return null;
    }

    // User has permission, render the component
    return <WrappedComponent {...props} />;
  };
}