import { useAuth } from "../contexts/AuthContext";

const Login: React.FC = () => {
    const { login } = useAuth();

    return (
        <div>
            <h1>Login</h1>
            <button
                onClick={() =>
                    login("22130081@st.hcmuaf.edu.vn", "minhhieu")
                }
            >
                Login
            </button>
        </div>
    );
};

export default Login;
