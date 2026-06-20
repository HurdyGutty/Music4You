import { useContext, createContext, useState, useEffect } from "react";
import { getMeApi, loginApi, logoutApi, regApi } from "@/auth/api.js";
import { clearAllTokens, getAccessToken, setAccessToken } from "@/auth/token-service.js";

const AuthContext = createContext(null);
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    async function login(email, password) {
        const { data } = await loginApi({ email, password });
        setAccessToken(data.accessToken);
        setUser(data.user);
    }

    async function register(full_name, email, password, passwordConfirm) {
        const { data } = await regApi({full_name, email, password, passwordConfirm});
        setAccessToken(data.accessToken);
        setUser(data.user);
    }
    
    async function logout() {
        try {
            const accessToken = getAccessToken();
            if (accessToken)
                await logoutApi();
            
        } finally {
            clearAllTokens();
            setUser(null);
        }
    }    

    useEffect(() => {
        async function bootstrapAuth() {
            try {
                const accessToken = getAccessToken();
                if (!accessToken) {
                    setUser(null);
                    return;
                }
                const { data } = await getMeApi(accessToken);
                setUser(data.user);
                    
            } catch {
                clearAllTokens();
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        }

        bootstrapAuth();
    }, []);

    const value = {
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
    };
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context)
        throw new Error("useAuth must be used with an AuthProvider");
    return context;
}