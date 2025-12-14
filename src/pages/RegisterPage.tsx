// RegisterPage.tsx
import { useState } from "react";
import "../styles/RegisterPage.css";

const RegisterPage = () => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();

        console.log({
            username,
            email,
            password
        });

        alert("Đăng ký thành công!");
    };

    return (
        <div className="register-container">
            <div className="register-card">
                <div className="register-header">
                    <h1>Tạo tài khoản</h1>
                    <p>Đăng ký để bắt đầu trò chuyện</p>
                </div>

                <div className="register-form">
                    <div className="form-group">
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

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="example@email.com"
                            autoComplete="email"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Mật khẩu</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Nhập mật khẩu"
                            autoComplete="new-password"
                        />
                    </div>

                    <button onClick={handleSubmit} className="btn-register">
                        Đăng ký
                    </button>
                </div>

                <div className="login-link">
                    <p>
                        Đã có tài khoản?{" "}
                        <a href="/login">Đăng nhập ngay</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;