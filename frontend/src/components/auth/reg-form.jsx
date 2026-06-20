import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth";

const registerSchema = z
    .object({
        full_name: z.string().trim().min(1, "Tên là bắt buộc"),
        email: z.string().trim().min(1, "Email là bắt buộc").email("Email không hợp lệ"),
        password: z
            .string()
            .min(1, "Mật khẩu là bắt buộc")
            .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
            .max(128, "Mật khẩu tối đa 128 ký tự")
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
                "Mật khẩu phải chứa ít nhất 1 chữ thường, 1 chữ hoa và 1 số"
            ),
        confirmPassword: z.string().min(1, "Xác nhận mật khẩu là bắt buộc"),
    })
    .refine(({ password, confirmPassword }) => password === confirmPassword, {
        message: "Mật khẩu không khớp",
        path: ["confirmPassword"],
    });

export default function RegForm({ onRegistered }) {
    const { register: registerAccount } = useAuth();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            full_name: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    });
    const [serverError, setServerError] = useState("");

    const onSubmit = async ({ full_name, email, password, confirmPassword }) => {
        setServerError("");
        try {
            await registerAccount(full_name, email, password, confirmPassword);
            onRegistered?.();
        } catch (error) {
            setServerError(error.message || "Đăng ký thất bại");
        }
    };

    const handleInvalidSubmit = () => {
        setServerError("");
    };

    return (
        <Card className="w-full max-w-sm">
            <CardHeader>
                <CardTitle>Sign Up</CardTitle>
                <CardDescription>
                    Create an account to access all features.
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit, handleInvalidSubmit)} noValidate>
                <CardContent className="flex flex-col gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="full_name">Full Name</Label>
                        <Input
                            id="full_name"
                            type="text"
                            placeholder="Enter your full name"
                            aria-invalid={!!errors.full_name}
                            {...register("full_name")}
                        />
                        {errors.full_name && (
                            <p className="text-sm text-red-600">
                                {errors.full_name.message}
                            </p>
                        )}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="m@example.com"
                            aria-invalid={!!errors.email}
                            {...register("email")}
                        />
                        {errors.email && (
                            <p className="text-sm text-red-600">{errors.email.message}</p>
                        )}
                    </div>
                    <div className="grid gap-2">
                        <div className="flex items-center">
                            <Label htmlFor="password">Password</Label>
                        </div>
                        <Input
                            id="password"
                            type="password"
                            aria-invalid={!!errors.password}
                            {...register("password")}
                        />
                        {errors.password && (
                            <p className="text-sm text-red-600">{errors.password.message}</p>
                        )}
                    </div>
                    <div className="grid gap-2">
                        <div className="flex items-center">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                        </div>
                        <Input
                            id="confirmPassword"
                            type="password"
                            aria-invalid={!!errors.confirmPassword}
                            {...register("confirmPassword")}
                        />
                        {errors.confirmPassword && (
                            <p className="text-sm text-red-600">
                                {errors.confirmPassword.message}
                            </p>
                        )}
                    </div>
                    {serverError && (
                        <p className="text-sm text-red-600">{serverError}</p>
                    )}
                </CardContent>
                <CardFooter className="flex flex-col gap-2 mt-4">
                    <Button
                        type="submit"
                        className="w-full bg-blue-500 text-white hover:bg-blue-700"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Registering..." : "Register"}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}