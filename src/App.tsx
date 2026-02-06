import { AuthProvider, useAuth } from "./context/AuthContext";
import { NoteProvider } from "./context/NoteContext";
import { ThemeProvider } from "./theme";
import { LoginView } from "./views/auth";
import { MainView } from "./views/MainView";

function AppContent() {
  const { isAuthenticated, login } = useAuth();

  if (!isAuthenticated) {
    return <LoginView onLogin={login} />;
  }

  return <MainView />;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NoteProvider>
          <AppContent />
        </NoteProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
