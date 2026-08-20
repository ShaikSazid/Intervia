import { useAuth } from "../providers/AuthProvider"

export default function DashboardPage() {

    const { user } = useAuth();
    return (
        <div>
            <h1>Dashboard</h1>
            <p>Welcome to the dashboard{user?.username}</p>
        </div>
    )
}