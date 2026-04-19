import './theme/gradient.css';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { AuthProvider, useUser } from './context/AuthContext';
import { VaultProvider } from './context/VaultContext';
import { theme } from './theme/theme';
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
    <ThemeProvider theme={theme}>
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
