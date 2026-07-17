import { Routes, Route } from 'react-router-dom';
import Mainlayout from '../layouts/Mainlayout';
import Detail from '../pages/Detail';
import Admin from '../pages/Admin';
import Register from '../pages/Register';
import Login from '../pages/Login';
import Profile from '../pages/Profile';
import Booking from '../pages/Booking';
import ProtectedRoute from './ProtectedRoute';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Mainlayout />} />
      <Route path="/detail/:id" element={<Detail />} />
      <Route path="/reserva" element={<Booking />} />
      <Route path="/reserva/:id" element={<Booking />} />
      <Route path="/administracion" element={<ProtectedRoute requireAdmin><Admin /></ProtectedRoute>} />
      <Route path="/registro" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/perfil" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
    </Routes>
  );
}

export default AppRoutes;