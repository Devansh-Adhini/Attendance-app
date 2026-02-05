import { useState } from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import Index from './pages/Index';
import Login from './pages/Login';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  return (
    <TooltipProvider>
      {isAuthenticated ? (
        <Index onLogout={handleLogout} />
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </TooltipProvider>
  );
};

export default App;
