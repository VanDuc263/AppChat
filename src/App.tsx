import {AuthProvider} from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import {useAuthSocketListener} from "./hooks/useAuthSocketListener";
import AppRoutes from "./routes/AppRoutes";

function AppContext(){
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
