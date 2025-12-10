import {useAuth} from "../contexts/AuthContext";

export default function Login(){
    const {login} = useAuth()

    return (
        <div>
            <h1>Login</h1>
            <button onClick={() => login("22130081@st.hcmuaf.edu.vn","minhhieu")}>
                Login
            </button>
        </div>
    )
}