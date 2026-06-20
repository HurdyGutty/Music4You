import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuth } from "@/contexts/auth";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardFooter,
    CardAction,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "../ui/label.jsx";

const loginSchema = z.object({
    email: z.string().trim().min(1, "Email is required").email("Email is invalid"),
    password: z.string().min(1, "Password is required"),
});

export default function LoginForm({ onLoggedIn, onGoToRegister }) {
    const { login } = useAuth();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });
    const [error, setError] = useState("");
    const onSubmit = async ({ email, password }) => {
        setError("");
        try {
            await login(email, password);
            onLoggedIn?.();
        } catch (error) {
            setError(error.message || "An error occurred while logging in");
        }
    };

    const handleInvalidSubmit = () => {
        setError("");
    };

    return (
        <Card className="w-full max-w-sm">
            <CardHeader>
                <CardTitle className="text-lg font-semibold">Login</CardTitle>
                <CardAction>
                    <Button variant="link" onClick={() => onGoToRegister?.()}>
                        Sign Up
                    </Button>
                </CardAction>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit, handleInvalidSubmit)} noValidate>
                <CardContent className="space-y-4 mb-4">
                    <div>
                        <Label htmlFor="email" className="block mb-1 font-medium">
                            Email
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            aria-invalid={!!errors.email}
                            {...register("email")}
                        />
                        {errors.email && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.email.message}
                            </p>
                        )}
                    </div>
                    <div>
                        <label htmlFor="password" className="block mb-1 font-medium">
                            Password
                        </label>
                    <Input
                        id="password"
                        type="password"
                        aria-invalid={!!errors.password}
                        {...register("password")}
                    />
                    {errors.password && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.password.message}
                        </p>
                    )}
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
            </CardContent>
            <CardFooter>
                <Button
                    type="submit"
                    className="w-full bg-blue-500 text-white hover:bg-blue-700"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Logging in..." : "Login"}
                </Button>
            </CardFooter>
        </form>
    </Card>
);
}