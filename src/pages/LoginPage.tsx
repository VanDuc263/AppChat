import { useAuth } from "../contexts/AuthContext";
import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import "../styles/LoginPage.css";

const LoginPage: React.FC = () => {
    const { user, login } = useAuth();
    const [username, setUsername] = useState("");
    const [pass, setPass] = useState("");

    if (user) return <Navigate to="/chat" replace />;

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h1>Chào mừng trở lại!</h1>
                    <p>Vui lòng đăng nhập vào tài khoản của bạn</p>
                </div>

                <form className="login-form" onSubmit={(e) => e.preventDefault()}>
                    <div className="input-group">
                        <label htmlFor="username">Tên đăng nhập</label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Nhập tên đăng nhập"
                            autoComplete="username"
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="password">Mật khẩu</label>
                        <input
                            id="password"
                            type="password"
                            value={pass}
                            onChange={(e) => setPass(e.target.value)}
                            placeholder="Nhập mật khẩu"
                            autoComplete="current-password"
                        />
                    </div>

                    <button
                        type="button"
                        className="login-button"
                        onClick={() => login(username, pass)}
                    >
                        Đăng nhập
                    </button>
                </form>

                <div className="login-link">
                    <p>
                        Chưa có tài khoản?{" "}
                        <Link to="/register">Đăng ký ngay</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;