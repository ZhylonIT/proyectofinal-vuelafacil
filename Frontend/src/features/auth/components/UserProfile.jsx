import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../../styles/Profile.css';

function UserProfile() {
  const navigate = useNavigate();
  
  const [userData] = useState(() => {
    const storedUser = localStorage.getItem('currentUser');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // Redirección de seguridad si no hay sesión
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn || !userData) {
      navigate('/login');
    }
  }, [navigate, userData]);

  if (!userData) return null;

  const getInitials = () => {
    return `${userData.firstName.charAt(0).toUpperCase()}${userData.lastName ? userData.lastName.charAt(0).toUpperCase() : ''}`;
  };

  return (
    <div className="profile-card">
      <div className="profile-header">
        <div className="profile-avatar-large">
          {getInitials()}
        </div>
        <h2 className="profile-title">Mi Perfil</h2>
        <p className="profile-subtitle">Gestioná tu información personal y credenciales de acceso.</p>
      </div>

      <div className="profile-data-section">
        <div className="profile-data-group">
          <label>Nombre</label>
          <div className="profile-data-value">{userData.firstName}</div>
        </div>

        <div className="profile-data-group">
          <label>Apellido</label>
          <div className="profile-data-value">{userData.lastName}</div>
        </div>

        <div className="profile-data-group full-width">
          <label>Correo Electrónico</label>
          <div className="profile-data-value">{userData.email}</div>
        </div>
      </div>
      
      <div className="profile-footer">
        <p>Tu información se encuentra protegida bajo nuestras políticas de privacidad.</p>
      </div>
    </div>
  );
}

export default UserProfile;