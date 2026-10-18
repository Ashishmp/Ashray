import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PropertyProvider } from './context/PropertyContext';
import { ToastProvider } from './context/ToastContext';
import { AppLayout } from './components/layout/AppLayout';
import { LoginScreen } from './features/auth/LoginScreen';

const AppContent: React.FC = () => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <LoginScreen />;
  }

  return <AppLayout />;
};

function App() {
  return (
    <AuthProvider>
      <PropertyProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </PropertyProvider>
    </AuthProvider>
  );
}

export default App;
