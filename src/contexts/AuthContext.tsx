import {createContext, useContext, useState, ReactNode, useEffect} from "react";
import { connectSocket } from "../services/socket";
import {loginApi,logoutApi,reLoginApi} from "../services/authService";
import {getSocket} from "../services/socket";

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

    useEffect(() => {
        const username = localStorage.getItem("username");
        const reLogin = localStorage.getItem("re_login");
        const socket = getSocket();

        if (!username || !reLogin || !socket) return;

        const handleReLogin = async () => {
            try {
                setUser(prev => ({
                    username : username,
                    code : reLogin,
                    ...prev
                    })
                );
            } catch (e) {
                localStorage.removeItem("username");
                localStorage.removeItem("re_login");
            }
        };

        if (socket.readyState === WebSocket.OPEN) {
            handleReLogin();
        } else {
            socket.addEventListener("open", handleReLogin, { once: true });
        }
    }, []);

    const login = (username: string, password: string) => {

        localStorage.setItem("username",username)
        loginApi(username,password)
    };

    const logout = () => {
        logoutApi()
        setUser(null)
        localStorage.removeItem("username");
        localStorage.removeItem("re_login");
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
