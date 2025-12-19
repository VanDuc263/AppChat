// RegisterPage.tsx
import { useEffect,useState } from "react";
import "../styles/RegisterPage.css";
import { Link, useNavigate } from "react-router-dom"
import { registerApi } from "../services/authService";

const RegisterPage = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const handler = (e: any) => {
            setLoading(false);

            if (e.detail.status === "success") {
                alert("Đăng ký thành công ");
                navigate("/login");
            } else {
                alert(e.detail.data || "Đăng ký thất bại");
            }
        };

        window.addEventListener("REGISTER_RESULT", handler);
        return () => window.removeEventListener("REGISTER_RESULT", handler);
    }, [navigate]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!username || !password) {
            alert("Vui lòng nhập đầy đủ thông tin");
            return;
        }

        setLoading(true);
        registerApi(username, password);
    };


    return (
        <div className="register-container">
            <div className="register-card">
                <div className="register-header">
                    <h1>Tạo tài khoản</h1>
                    <p>Đăng ký để bắt đầu trò chuyện</p>
                </div>

                <form className="register-form" onSubmit={handleSubmit}>
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

                    {/*<div className="form-group">*/}
                    {/*    <label htmlFor="email">Email</label>*/}
                    {/*    <input*/}
                    {/*        id="email"*/}
                    {/*        type="email"*/}
                    {/*        value={email}*/}
                    {/*        onChange={(e) => setEmail(e.target.value)}*/}
                    {/*        placeholder="example@email.com"*/}
                    {/*        autoComplete="email"*/}
                    {/*    />*/}
                    {/*</div>*/}

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

                    <button type="submit" className="btn-register">
                        Đăng ký
                    </button>
                </form>

                <div className="login-link">
                    <p>
                        Đã có tài khoản?{" "}
                        <Link to="/login">Đăng nhập ngay</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;