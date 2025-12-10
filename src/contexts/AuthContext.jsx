import {createContext,useContext,useState} from "react";
import {connectSocket} from "../services/socket";

const AuthContext = createContext()

export function AuthProvider({children}){
    const [user,setUser] = useState(null)
    const socket = connectSocket()

    const login = (username,password) => {
        socket.send(JSON.stringify({
            action : "onchat",
            data : {
                event : "LOGIN",
                data : { user : username,pass : password}
            }
        }))
    }

    const logout = () => {
        socket.send(JSON.stringify({
            action : "onchat",
            data : {
                event : "LOGOUT"
            }
        }))
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user,setUser,login,logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)