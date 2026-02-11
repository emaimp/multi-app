import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, useUser } from './context/AuthContext';
import { VaultProvider } from './context/VaultContext';
import { ThemeProvider } from './theme';
import { LoginView } from './views/auth';
import { MainView } from './views/MainView';

function AppContent() {
  const { isAuthenticated } = useUser();

  if (!isAuthenticated) {
    return <LoginView />;
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
