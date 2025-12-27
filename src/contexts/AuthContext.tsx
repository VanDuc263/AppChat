import {createContext, useContext, useState, ReactNode, useEffect} from "react";
import { connectSocket, disconnectSocket } from "../services/socket";
import {loginApi,logoutApi,reLoginApi} from "../services/authService";

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
    connectSocket()

    useEffect(() => {
        const hasReLogin = localStorage.getItem("re_login")
        const hasUser = localStorage.getItem("username")

        if(hasUser && hasReLogin){
            setAuthStatus("checking")
        }else{
            setAuthStatus("unauthenticated")
        }
    }, []);

    const login = (username: string, password: string) => {
        setAuthStatus("checking");
        localStorage.setItem("username",username)
        loginApi(username,password)
    };

    const logout = () => {
        setAuthStatus("unauthenticated")
        logoutApi()
        setUser(null)
        localStorage.removeItem("username");
        localStorage.removeItem("re_login");
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
