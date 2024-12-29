"use client";
import { useSession } from "next-auth/react";
import { hasPermission } from "@/config/permissions";

export function usePermission() {
  const { data: session } = useSession();

  const checkPermission = (resource, action) => {
    if (!session?.user?.role) return false;
    return hasPermission(session.user.role, resource, action);
  };

  return {
    checkPermission,
    userRole: session?.user?.role
  };
} 