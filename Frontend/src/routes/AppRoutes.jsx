import { Routes, Route } from 'react-router-dom';
import Mainlayout from '../layouts/Mainlayout';
import Detail from '../pages/Detail';
import Admin from '../pages/Admin';
import Register from '../pages/Register';
import Login from '../pages/Login';
import Profile from '../pages/Profile';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Mainlayout />} />      
      <Route path="/detail/:id" element={<Detail />} />      
      <Route path="/administracion" element={<Admin />} />
      <Route path="/registro" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/perfil" element={<Profile />} />
    </Routes>
  );
}

export default AppRoutes;