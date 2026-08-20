import { useAuth } from "@/features/auth/providers/AuthProvider";
import type React from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export default function ProtectedRoute({children,}: ProtectedRouteProps) {
    const { isAuthenticated, isLoading } = useAuth();
    if(isLoading) return <p>Loading...</p>
    if(!isAuthenticated) {
        return <Navigate to="/login" replace/>
    }
    return children;
}