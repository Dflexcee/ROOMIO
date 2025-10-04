import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import AppRoutes from './routes/AppRoutes';
import UserStatusCheck from './components/common/UserStatusCheck';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CurrencyProvider>
          <UserStatusCheck>
            <AppRoutes />
          </UserStatusCheck>
        </CurrencyProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App; 