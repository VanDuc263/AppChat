import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import ChatPage from "../pages/ChatPage";
import {MessageProvider} from "../contexts/MessageContext";
import React from "react";


// function ProtectedRoute({ children }: { children: React.ReactNode }) {
//     const { user } = useAuth();
//     return user ? children : <Navigate to="/login" replace />;
// }
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user,logout } = useAuth();
    return user ? <>{children}</> : <Navigate to="/login" replace />;
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