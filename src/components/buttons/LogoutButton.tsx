import { useAuth } from "../../contexts/AuthContext";

const Logout : React.FC = () => {
    const { logout } = useAuth()
    return (
        <div>
            <button
                onClick={
                    () => logout()
                }>
                Logout
            </button>
        </div>
    )
}


export default Logout;