import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import { hasPermission } from "@/config/permissions";

export async function checkPermission(req, resource, action) {
  try {
    const token = await getToken({ req });
    
    if (!token) {
      return {
        allowed: false,
        error: "Not authenticated"
      };
    }

    const userRole = token.role;
    const isAllowed = hasPermission(userRole, resource, action);

    return {
      allowed: isAllowed,
      error: isAllowed ? null : "Permission denied"
    };
  } catch (error) {
    console.error('Permission check error:', error);
    return {
      allowed: false,
      error: "Error checking permissions"
    };
  }
} 