import {AuthProvider} from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import {useAuthSocketListener} from "./hooks/useAuthSocketListener";
import AppRoutes from "./routes/AppRoutes";
import SocketOverlay from "./components/SocketOverlay";

function AppContext(){
    useAuthSocketListener()


    return (
        <>
            <AppRoutes />
        </>
    );
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
