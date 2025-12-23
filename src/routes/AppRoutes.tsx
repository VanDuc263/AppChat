import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import ChatPage from "../pages/ChatPage";
import React from "react";
import LoadingSpinner from "../components/LoadingSpinner";


const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user,logout,authStatus } = useAuth();
    if(authStatus === "unauthenticated")
        return <Navigate to="/login" replace />;
    return (
        <>
            {children}
            {authStatus === "checking" && (
                <LoadingSpinner
                    text="Đang kết nối lại..."
                    fullScreen
                />
            )}
        </>
    );
};


export default function AppRoutes(){
    return  (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />}/>
                <Route path="/register" element={<RegisterPage />} />
                <Route
                    path="/chat"
                    element={
                        <ProtectedRoute>
                            <ChatPage/>
                        </ProtectedRoute>
                    }
                />

                <Route path="/" element={<Navigate to="/chat" replace />} />

                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    )
}