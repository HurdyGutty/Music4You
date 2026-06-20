import RegForm from "@/components/auth/reg-form.jsx";
import { useNavigate } from "react-router-dom";

export default function RegisterPage() {
    const navigate = useNavigate();
    function handleRegistered() {
        navigate("/profile");
    }
    return <RegForm onRegistered={handleRegistered} />;
}