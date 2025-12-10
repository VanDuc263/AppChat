import {AuthProvider} from "./contexts/AuthContext";
import {useSocketListenner} from "./hooks/useSocketListenner";
import Login from "./pages/Login";

function AppContext(){
    useSocketListenner()
    return <Login/>
}

function App
() {
  return (
      <AuthProvider>
          <AppContext/>
      </AuthProvider>
  );
}

export default App;
