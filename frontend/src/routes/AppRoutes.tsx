import { Routes, Route } from "react-router-dom";
import LoginPage from "@/features/auth/pages/LoginPage";
import SignupPage from "@/features/auth/pages/SignupPage";
import ProtectedRoute from "./ProtectedRoute";
import DashboardPage from "@/features/auth/pages/DashboardPage";

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage/>}/>
            <Route path="/signup" element={<SignupPage/>}/>
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage/></ProtectedRoute>}/>
        </Routes>
    )
}