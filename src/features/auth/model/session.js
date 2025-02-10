// features/auth/model/session.js

export function setSession(user) {
    localStorage.setItem("currentUser", JSON.stringify(user));
}

export function getSession() {
    const userData = localStorage.getItem("currentUser");
    return userData ? JSON.parse(userData) : null;
}

export function clearSession() {
    localStorage.removeItem("currentUser");
}
