import z from "zod";

export const signupSchema = z.object({
    full_name: z.string().min(2, 'FullName phải có ít nhất 2 ký tự').max(100, 'FullName tối đa 100 ký tự'),
    email: z.email('Email không hợp lệ').max(255, 'Email tối đa 255 ký tự'),
    password: z.string().min(6, 'Password phải có ít nhất 6 ký tự').max(128, 'Password tối đa 128 ký tự').regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password phải chứa ít nhất 1 chữ thường, 1 chữ hoa và 1 số'
    ),
    passwordConfirm: z.string(),
}).refine(data => data.password === data.passwordConfirm,{
    message: 'Password và Password Confirm không khớp',
    path: ['passwordConfirm'],
});

export const loginSchema = z.object({
    email: z.email('Email không hợp lệ'),
    password: z.string().min(1, 'Password không được để trống'),
})