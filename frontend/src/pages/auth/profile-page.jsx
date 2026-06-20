import { Button } from "@/components/ui/button.jsx";
import { 
    Card, 
    CardContent, 
    CardFooter, 
    CardHeader, 
    CardTitle,
} from "@/components/ui/card.jsx";
import { useAuth } from "@/contexts/auth.jsx";
import { useNavigate } from "react-router-dom";

export default function ProfilePage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    async function handleLogout() {
        await logout();
        navigate("/");
    }

    return (
        <Card className="w-full max-w-sm mx-auto">
            <CardHeader>
                <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>Name: {user.full_name}</div>
                <div>Email: {user.email}</div>
            </CardContent>
            <CardFooter>
                <Button variant="destructive" onClick={handleLogout} className="w-full">
                    Logout
                </Button>
            </CardFooter>
        </Card>
    );
}