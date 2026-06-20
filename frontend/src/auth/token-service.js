const ACCESS_TOKEN_KEY = "accessToken";

let accessTokenMemory = readToken(ACCESS_TOKEN_KEY);

function readToken(key) {
    return sessionStorage.getItem(key); 
}

function writeToken(key, token) {
    if (token) {
        sessionStorage.setItem(key, token);
        return;
    }
    sessionStorage.removeItem(key);
}

export function setAccessToken(token) { 
    accessTokenMemory = token || null;
    writeToken(ACCESS_TOKEN_KEY, token);
 }

export function getAccessToken() {
    return accessTokenMemory || readToken(ACCESS_TOKEN_KEY);
}

export function clearAccessToken() {
    accessTokenMemory = null;
    writeToken(ACCESS_TOKEN_KEY, null);
}

export function clearAllTokens() {
    clearAccessToken();
}