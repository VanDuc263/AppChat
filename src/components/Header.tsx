import {useAuth} from "../contexts/AuthContext";


export default function Header(){
    const {logout} = useAuth()
    return (
        <div>
            <button onClick={() => logout()}>Logout</button>
        </div>
    )
}