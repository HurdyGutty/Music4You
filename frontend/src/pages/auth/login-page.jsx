import { Button } from "@/components/ui/button.jsx";
import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import { Input } from "@/components/ui/input.jsx";
import { useAuth } from "@/contexts/auth.jsx";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [ form, setForm ] = useState({
        email: "",
        password: "",
    });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));

    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsSubmitting(true);
        try {
            await login(form.email, form.password);
            navigate('/profile');

        } catch (error) {
            setError(error.message || "An error occured while logging in");
        } finally {
            setIsSubmitting(false);

        }
    };

    return (
        <Card className="w-full max-w-sm">
            <CardHeader>
                <CardTitle className="text-lg font-semibold">Login</CardTitle>
                <CardAction>
                    <Button variant="link" onClick={() => navigate("/register")}>
                        Sign Up
                    </Button>
                </CardAction>
            </CardHeader>
            <form action="" onSubmit={handleSubmit}>
                <CardContent className="space-y-4 mb-4">
                    <div>
                        <label className="block mb-1 font-medium">Email</label>
                        <Input 
                            type="email"
                            value={form.email}
                            onChange={handleChange} 
                            name="email" 
                            required 
                        />
                    </div>
                    <div>
                        <label className="block mb-1 font-medium">Password</label>
                        <Input 
                            type="password"
                            value={form.password}
                            onChange={handleChange} 
                            name="password" 
                            required 
                        />
                    </div>
                    {error && <p className="text-sm text-red-600">{error}</p>}
                </CardContent>
                <CardFooter>
                    <Button 
                        type="submit" 
                        disabled={isSubmitting} 
                        className="w-full bg-blue-500 text-white hover:bg-blue-700"
                    >
                        {isSubmitting ? "Logging in..." : "Login"}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    )
}