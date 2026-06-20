import { useAuth } from "@/contexts/auth.jsx";
import { Navigate, Outlet } from "react-router-dom";

export default function GuestRoute() {
    const { isAuthenticated, isLoading } = useAuth();
    if (isLoading)
        return <div>Đang kiểm tra đăng nhập...</div>;

    if (isAuthenticated)
        return <Navigate to="/profile" replace />;

    return <Outlet />;
}