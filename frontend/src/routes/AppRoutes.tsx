import {
    Routes,
    Route,
} from "react-router-dom";

import LoginPage from "@/features/auth/pages/LoginPage";
import SignupPage from "@/features/auth/pages/SignupPage";
import DashboardPage from "@/features/auth/pages/DashboardPage";
import InterviewPage from "@/features/interview/pages/InterviewPage";

import ProtectedRoute from "./ProtectedRoute";


export default function AppRoutes() {

    return (

        <Routes>

            <Route
                path="/login"
                element={
                    <LoginPage />
                }
            />


            <Route
                path="/signup"
                element={
                    <SignupPage />
                }
            />


            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <DashboardPage />
                    </ProtectedRoute>
                }
            />


            <Route
                path="/interview/:sessionId"
                element={
                    <ProtectedRoute>
                        <InterviewPage />
                    </ProtectedRoute>
                }
            />

        </Routes>
    );
}