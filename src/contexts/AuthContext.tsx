import { createContext, useContext, useState, ReactNode } from "react";
import { connectSocket } from "../services/socket";

// ---- Types -----
interface User {
    username: string;
    [key: string]: any;
}

interface AuthContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    login: (username: string, password: string) => void;
    logout: () => void;
}

interface AuthProviderProps {
    children: ReactNode;
}

// ---- Context -----
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ---- Provider -----
export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const socket: WebSocket = connectSocket();

    const login = (username: string, password: string) => {
        socket.send(
            JSON.stringify({
                action: "onchat",
                data: {
                    event: "LOGIN",
                    data: { user: username, pass: password },
                },
            })
        );
    };

    const logout = () => {
        socket.send(
            JSON.stringify({
                action: "onchat",
                data: {
                    event: "LOGOUT",
                },
            })
        );

        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, setUser, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

// ---- Hook ----
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used inside <AuthProvider>");
    }
    return context;
};
