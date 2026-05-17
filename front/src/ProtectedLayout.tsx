import { Outlet } from 'react-router-dom';
import { AuthProvider } from './AuthContext.tsx';

const ProtectedLayout = () => {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
};

export default ProtectedLayout