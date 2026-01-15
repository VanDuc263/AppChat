import {AuthProvider} from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import {useAuthSocketListener} from "./hooks/useAuthSocketListener";
import AppRoutes from "./routes/AppRoutes";
import { connectSocket, disconnectSocket } from "./services/socket";
import {useEffect} from "react";

function AppContext(){

    useEffect(() => {
        connectSocket()

        return () => {
            disconnectSocket()
        }
    }, [])

    connectSocket()
    useAuthSocketListener()
    return <AppRoutes/>
}

function App() {
  return (
      <ThemeProvider>
         <AuthProvider>
            <AppContext/>
         </AuthProvider>
      </ThemeProvider>
  );
}

export default App;
