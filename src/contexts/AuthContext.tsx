import {createContext, useContext, useState, ReactNode, useEffect} from "react";
import { connectSocket, disconnectSocket } from "../services/socket";
import {loginApi,logoutApi,reLoginApi} from "../services/authService";

interface User {
    id: string;
    username: string;
    code : string;
    [key: string]: any;
}

interface AuthContextType {
    user: User | null;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    login: (username: string, password: string) => void;
    logout: () => void;
    authStatus : AuthStatus;
    setAuthStatus : React.Dispatch<React.SetStateAction<AuthStatus>>
}

interface AuthProviderProps {
    children: ReactNode;
}

type AuthStatus = "checking" | "authenticated" | "unauthenticated";
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [authStatus,setAuthStatus] = useState<AuthStatus>("checking")

    const login = (username: string, password: string) => {
        setAuthStatus("checking");
        localStorage.setItem("username",username)
        loginApi(username,password)
    };

    const logout = () => {
        logoutApi()
        setUser(null)
        localStorage.removeItem("username");
        localStorage.removeItem("re_login");
        setAuthStatus("unauthenticated")
    };

    return (
        <AuthContext.Provider value={{ user, setUser, login, logout,authStatus,setAuthStatus}}>
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
