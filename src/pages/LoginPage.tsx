import { useAuth } from "../contexts/AuthContext";
import {useState} from "react";
import {Navigate} from "react-router-dom";

const LoginPage: React.FC = () => {
    const { user,login } = useAuth();
    const [username,setUsername] = useState("")
    const [pass,setPass] = useState("")

    if(user) return <Navigate to="/chat" replace/>
    return (
        <div>
            <h1>Login</h1>
            <input value={username} onChange={e => setUsername(e.target.value)}/>
            <input value={pass} onChange={e => setPass(e.target.value)}/>
            <button
                onClick={() =>
                    login(username,pass)
                }
                >
                Login
            </button>
        </div>
    );
};

export default LoginPage;
