"use client"
import React, { useEffect, useState } from 'react';
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import ErrorBoundary from "@/components/ErrorBoundary";
import AdminMenu from "@/app/admin/components/template/adminMenu";

export default function DashboardLayout({ children }) {
    const router = useRouter();
    const { isAuthenticated, isLoading, user } = useAuth();

    // Add debug logs
    console.log('DashboardLayout - Auth State:', { isAuthenticated, isLoading, user });
    console.log('DashboardLayout - Children:', children);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="p-4 bg-white rounded shadow">
                    Loading dashboard...
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        console.log('DashboardLayout - Not authenticated, redirecting...');
        router.replace('/admin/login');
        return null;
    }

    return (
        <ErrorBoundary>
            <AdminMenu>
                <div className="w-full">
                    {children}
                </div>
            </AdminMenu>
        </ErrorBoundary>
    );
}