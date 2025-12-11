import {AuthProvider} from "./contexts/AuthContext";
import {useAuthSocketListener} from "./hooks/useAuthSocketListener";
import Login from "./pages/Login";

function AppContext(){
    useAuthSocketListener()
    return <Login/>
}

function App() {
  return (
    <AuthProvider>
        <AppContext/>
    </AuthProvider>
  );
}

export default App;
