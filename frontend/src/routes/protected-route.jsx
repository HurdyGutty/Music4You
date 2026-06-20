import { useAuth } from "@/contexts/auth.jsx";
import { Navigate, Outlet, useLocation } from "react-router-dom";


export default function ProtectedRoute() {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading)
        return <div>Đang kiểm tra đăng nhập...</div>;

    if (!isAuthenticated) {
        return (
            <Navigate to="/login" replace state={{from: location,}} />
        );
    }
    return <Outlet />
}