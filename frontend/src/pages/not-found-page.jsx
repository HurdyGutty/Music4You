import { Link } from "react-router-dom";

export default function NotFoundPage() {
    return (
        <div className="not-found-page">
        <h1>404</h1>
        <p>Trang bạn tìm kiếm không tồn tại</p>
        <Link to="/login">Quay về trang đăng nhập</Link>
        </div>
    )
}