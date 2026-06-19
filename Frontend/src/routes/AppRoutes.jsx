import { Routes, Route } from 'react-router-dom';
import Mainlayout from '../layouts/Mainlayout';
import Detail from '../pages/Detail';
import Admin from '../pages/Admin';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Mainlayout />} />      
      <Route path="/detail/:id" element={<Detail />} />      
      <Route path="/administracion" element={<Admin />} />
    </Routes>
  );
}

export default AppRoutes;