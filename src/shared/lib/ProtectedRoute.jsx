// shared/lib/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { getSession } from "../../features/auth/model/session";

export const ProtectedRoute = ({ children }) => {
    const user = getSession();
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    return children;
};
