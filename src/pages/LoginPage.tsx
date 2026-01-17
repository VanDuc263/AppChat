import { useAuth } from "../contexts/AuthContext";
import {useEffect, useState} from "react";
import { Link, Navigate } from "react-router-dom";
import "../styles/LoginPage.css";
import LoadingSpinner from "../components/LoadingSpinner";
import {keyboardKey} from "@testing-library/user-event";

const LoginPage: React.FC = () => {
    const { authStatus, login } = useAuth();
    const [username, setUsername] = useState("");
    const [pass, setPass] = useState("");


    // đã đăng nhập → đi chat
    if (authStatus === "authenticated") {
        return <Navigate to="/chat" replace />;
    }
    return (
        <>
            <div className="login-container">
                <div className="login-card">
                    <div className="login-header">
                        <h1>Chào mừng trở lại!</h1>
                        <p>Vui lòng đăng nhập vào tài khoản của bạn</p>
                    </div>

                    <form
                        className="login-form"
                        onSubmit={(e) =>
                            {
                                e.preventDefault()
                                if (authStatus !== "checking") {
                                    login(username, pass);
                                }
                            }
                        }
                    >
                        <div className="input-group">
                            <label htmlFor="username">Tên đăng nhập</label>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Nhập tên đăng nhập"
                                autoComplete="username"
                                disabled={authStatus === "checking"}
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
                                disabled={authStatus === "checking"}
                            />
                        </div>

                        <button
                            type="submit"
                            className="login-button"
                            onClick={() => login(username, pass)}
                            disabled={authStatus === "checking"}
                        >
                            {authStatus === "checking"
                                ? "Đang đăng nhập..."
                                : "Đăng nhập"}
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

            {/* OVERLAY LOADING */}
            {authStatus === "checking" && (
                <LoadingSpinner
                    text="Đang đăng nhập..."
                    fullScreen
                />
            )}
        </>
    );
};

export default LoginPage;
