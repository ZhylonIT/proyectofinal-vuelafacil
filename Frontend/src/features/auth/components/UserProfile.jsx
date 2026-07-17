import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { favoritoService } from '../../../services/favoritoService';
import { reservaService } from '../../../services/reservaService';
import '../../../styles/Profile.css';

function UserProfile() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [optionalData, setOptionalData] = useState(() => {
    if (!user?.email) return { address: '', phone: '', city: '' };
    try {
      return JSON.parse(localStorage.getItem(`vuelafacil_perfil_extra_${user.email}`) || 'null')
        || { address: '', phone: '', city: '' };
    } catch {
      return { address: '', phone: '', city: '' };
    }
  });
  const [editMode, setEditMode] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const [favorites, setFavorites] = useState([]);
  const [favoritesLoading, setFavoritesLoading] = useState(true);
  const [favoritesError, setFavoritesError] = useState('');

  const [bookingHistory, setBookingHistory] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/login');
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    if (!isAuthenticated) return;

    favoritoService.misFavoritos()
      .then(setFavorites)
      .catch(err => setFavoritesError(err.message || 'No pudimos cargar tus favoritos. Intenta nuevamente.'))
      .finally(() => setFavoritesLoading(false));

    reservaService.misReservas()
      .then(reservas => {
        const ordenadas = [...reservas].sort((a, b) => new Date(b.fechaReserva) - new Date(a.fechaReserva));
        setBookingHistory(ordenadas);
      })
      .catch(err => console.error('Error cargando reservas:', err))
      .finally(() => setBookingsLoading(false));
  }, [isAuthenticated]);

  const removeFavorite = async (e, flightId) => {
    e.stopPropagation();
    try {
      await favoritoService.quitar(flightId);
      setFavorites(prev => prev.filter(f => f.flightId !== flightId));
    } catch (error) {
      console.error('Error quitando favorito:', error);
    }
  };

  const handleSaveOptionalData = () => {
    if (user?.email) {
      localStorage.setItem(`vuelafacil_perfil_extra_${user.email}`, JSON.stringify(optionalData));
    }
    setEditMode(false);
    setSaveMessage('Datos guardados correctamente.');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handleOptionalChange = (e) => {
    const { name, value } = e.target;
    setOptionalData(prev => ({ ...prev, [name]: value }));
  };

  if (!isAuthenticated || !user) return null;

  const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div className="profile-card">
      <div className="profile-header">
        <div className="profile-avatar-large">
          {user.firstName?.[0]?.toUpperCase()}
          {user.lastName?.[0]?.toUpperCase()}
        </div>
        <h2 className="profile-title">Mi Perfil</h2>
      </div>

      <div className="profile-data-section">
        <div className="profile-data-group">
          <label>Nombre</label>
          <div className="profile-data-value">{user.firstName} {user.lastName}</div>
        </div>
        <div className="profile-data-group">
          <label>Email</label>
          <div className="profile-data-value">{user.email}</div>
        </div>
      </div>

      <div className="profile-optional-section">
        <h3 className="profile-section-title">Datos adicionales (opcionales)</h3>
        {saveMessage && <p className="profile-save-message">{saveMessage}</p>}
        {editMode ? (
          <div className="optional-form">
            <div className="profile-data-group full-width">
              <label>Dirección</label>
              <input
                type="text"
                name="address"
                value={optionalData.address}
                onChange={handleOptionalChange}
                className="profile-data-value profile-input"
                placeholder="Tu dirección"
              />
            </div>
            <div className="profile-data-group">
              <label>Teléfono</label>
              <input
                type="tel"
                name="phone"
                value={optionalData.phone}
                onChange={handleOptionalChange}
                className="profile-data-value profile-input"
                placeholder="Tu teléfono"
              />
            </div>
            <div className="profile-data-group">
              <label>Localidad</label>
              <input
                type="text"
                name="city"
                value={optionalData.city}
                onChange={handleOptionalChange}
                className="profile-data-value profile-input"
                placeholder="Tu localidad"
              />
            </div>
            <div className="profile-data-group full-width" style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleSaveOptionalData} className="profile-save-btn">Guardar</button>
              <button onClick={() => setEditMode(false)} className="profile-cancel-btn">Cancelar</button>
            </div>
          </div>
        ) : (
          <div className="optional-display">
            <div className="profile-data-group full-width">
              <label>Dirección</label>
              <div className="profile-data-value">{optionalData.address || '—'}</div>
            </div>
            <div className="profile-data-group">
              <label>Teléfono</label>
              <div className="profile-data-value">{optionalData.phone || '—'}</div>
            </div>
            <div className="profile-data-group">
              <label>Localidad</label>
              <div className="profile-data-value">{optionalData.city || '—'}</div>
            </div>
            <button onClick={() => setEditMode(true)} className="profile-edit-btn">Editar datos opcionales</button>
          </div>
        )}
      </div>

      <div className="profile-history-section">
        <h3 className="profile-section-title">Historial de Reservas</h3>
        {bookingsLoading ? (
          <p>Cargando...</p>
        ) : bookingHistory.length === 0 ? (
          <p className="empty-message">Aún no has realizado ninguna reserva.</p>
        ) : (
          <div className="history-table">
            {bookingHistory.map((booking) => (
              <div key={booking.id} className="history-row">
                <div className="history-row-main">
                  <h4>{booking.destino}</h4>
                  <p className="history-package-desc">{booking.nombreVuelo}</p>
                  <div className="history-dates">
                    <span><strong>Reservado:</strong> {formatDate(booking.fechaReserva)}</span>
                    <span><strong>Ida:</strong> {formatDate(booking.fechaIda)}</span>
                    {booking.fechaVuelta && <span><strong>Vuelta:</strong> {formatDate(booking.fechaVuelta)}</span>}
                    <span><strong>Estado:</strong> {booking.estado === 'CONFIRMADA' ? 'Confirmada' : 'Cancelada'}</span>
                  </div>
                </div>
                <div className="history-row-price">
                  {booking.monedaAlMomento} ${booking.precioAlMomento?.toLocaleString('es-AR')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="profile-favorites-section">
        <h3 className="favorites-title">Mis Vuelos Favoritos</h3>
        {favoritesLoading ? (
          <p>Cargando...</p>
        ) : favoritesError ? (
          <p className="error-message">{favoritesError}</p>
        ) : favorites.length === 0 ? (
          <p className="empty-message">Aún no tienes vuelos favoritos.</p>
        ) : (
          <div className="favorites-table">
            {favorites.map(flight => (
              <div
                key={flight.id}
                className="favorite-row"
                onClick={() => navigate(`/detail/${flight.flightId}`)}
                style={{ cursor: 'pointer' }}
              >
                <img
                  src={flight.imagen || ''}
                  alt={flight.destino}
                  className="row-image"
                />
                <div className="row-info">
                  <h4>{flight.destino}</h4>
                  <p>
                    {new Intl.NumberFormat('es-AR', {
                      style: 'currency',
                      currency: flight.moneda || 'ARS',
                    }).format(flight.precio)}
                  </p>
                </div>
                <button
                  className="favorite-remove-btn"
                  onClick={(e) => removeFavorite(e, flight.flightId)}
                  aria-label={`Eliminar ${flight.destino} de favoritos`}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default UserProfile;