import { createContext, useContext, useState, ReactNode } from "react";
import { connectSocket } from "../services/socket";
import {loginApi,logoutApi} from "../services/authService";

interface User {
    username: string;
    code : string;
    [key: string]: any;
}

interface AuthContextType {
    user: User | null;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    login: (username: string, password: string) => void;
    logout: () => void;
}

interface AuthProviderProps {
    children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const socket: WebSocket = connectSocket();

    const login = (username: string, password: string) => {
        setUser(
            {
                username : username,
                code : ""
            }
        )

        loginApi(username,password)
    };

    const logout = () => {
        logoutApi()
    };

    return (
        <AuthContext.Provider value={{ user, setUser, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used inside <AuthProvider>");
    }
    return context;
};
