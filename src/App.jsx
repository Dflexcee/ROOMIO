import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import AppRoutes from './routes/AppRoutes';
import UserStatusCheck from './components/common/UserStatusCheck';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <UserStatusCheck>
          <AppRoutes />
        </UserStatusCheck>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App; 