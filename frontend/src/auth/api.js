import { config } from "@/config.js";
import { clearAllTokens, getAccessToken } from "./token-service.js";
const BASE_URL = config.apiUrl;

export async function apiFetch(endpoint, options = {}) {
    const accessToken = getAccessToken();
    const headers = new Headers(options.headers || {});

    if (accessToken)
        headers.set("Authorization", `Bearer ${accessToken}`);

    let response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
    })

    if (response.status !== 401)
        return response;

    clearAllTokens();
    return response;
}


async function parseJson(response) {
    const text = await response.text();
    if (!text)
        return {};

    try {
        return JSON.parse(text);
    } catch (error) {
        return {}
    }
}

function getErrorMessage(data, fallback) {
    if (typeof data?.error === "string") 
        return data.error;

    return data?.error?.message || data?.message || fallback;
}

export async function loginApi({ email, password }) {
    const response = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
    })

    const data = await parseJson(response);
    if (!response.ok)
        throw new Error(getErrorMessage(data, "Login failed"));

    return data;
    
}

export async function regApi({ full_name, email, password, passwordConfirm }) {
    const response = await fetch(`${BASE_URL}/auth/signup`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ full_name, email, password, passwordConfirm }),
    });

    const data = await parseJson(response);

    if (!response.ok)
        throw new Error(getErrorMessage(data, "Registration failed"));

    return data;
}

export async function logoutApi() {
    const accessToken = getAccessToken();
    const response = await fetch(`${BASE_URL}/auth/logout`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authoriztion: `Bearer ${accessToken}`,
        },
    });

    const data = await parseJson(response);
    if (!response.ok)
        throw new Error(getErrorMessage(data, "Logout failed"));

    return data;

}

export async function getMeApi(accessToken = getAccessToken()) {
    const response = await fetch(`${BASE_URL}/auth/me`, {
        method: "GET",
        headers: {
            Authoriztion: `Bearer ${accessToken}`,
        },
    });
    
    const data = await parseJson(response);
    if (!response.ok)
        throw new Error(getErrorMessage(data, "Failed to fetch user information"));

    return data;
}