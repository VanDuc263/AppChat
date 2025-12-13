import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import LoginPage from "../pages/LoginPage";
import ChatPage from "../pages/ChatPage";
import {MessageProvider} from "../contexts/MessageContext";


function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    return user ? children : <Navigate to="/login" replace />;
}

export default function AppRoutes(){
    return  (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />}/>

                <Route
                    path="/chat"
                    element={
                        <ProtectedRoute>
                            <MessageProvider>
                                <ChatPage/>
                            </MessageProvider>
                        </ProtectedRoute>

                    }
                />

                <Route path="/" element={<Navigate to="/chat" replace />} />

                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    )
}