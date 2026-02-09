import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { VaultProvider } from './context/VaultContext';
import { ThemeProvider } from './theme';
import { LoginView } from './views/auth';
import { MainView } from './views/MainView';

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
        <VaultProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </VaultProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
