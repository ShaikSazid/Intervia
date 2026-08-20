import { useAuth } from "./features/auth/providers/AuthProvider";

export default function Login() {
    const { login } = useAuth();

    const handleLogin = async () => {
        await login({
            email: "hello@gmail.com",
            password: "hello"
        })
    }

    return (
        <button onClick={handleLogin}>Login</button>
    )
}