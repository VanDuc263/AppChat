import {AuthProvider} from "./contexts/AuthContext";
import {useAuthSocketListener} from "./hooks/useAuthSocketListener";
import AppRoutes from "./routes/AppRoutes";

function AppContext(){
    useAuthSocketListener()
    return <AppRoutes/>
}

function App() {
  return (
    <AuthProvider>
        <AppContext/>
    </AuthProvider>
  );
}

export default App;
