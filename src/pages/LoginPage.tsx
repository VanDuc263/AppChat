import { useAuth } from "../contexts/AuthContext";
import { useState } from "react";
import { Navigate } from "react-router-dom";
import "../LoginPage.css";

const LoginPage: React.FC = () => {
    const { user, login } = useAuth();
    const [username, setUsername] = useState("");
    const [pass, setPass] = useState("");

    if (user) return <Navigate to="/chat" replace />;
    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h1>Welcome Back</h1>
                    <p>Please login to your account</p>
                </div>

                <form className="login-form" onSubmit={(e) => e.preventDefault()}>
                    <div className="input-group">
                        <label htmlFor="username">Username</label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter your username"
                            autoComplete="username"
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={pass}
                            onChange={(e) => setPass(e.target.value)}
                            placeholder="Enter your password"
                            autoComplete="current-password"
                        />
                    </div>

                    <button
                        type="button"
                        className="login-button"
                        onClick={() => login(username, pass)}
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
