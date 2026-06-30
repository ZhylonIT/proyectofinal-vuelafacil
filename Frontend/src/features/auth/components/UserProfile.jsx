import { useEffect, useState, useCallback, useReducer, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../../styles/Profile.css';
import RioImage from '../../../assets/images/rio.jpg';
import MadridImage from '../../../assets/images/madrid.jpg';
import CancunImage from '../../../assets/images/cancun.jpg';
import MendozaImage from '../../../assets/images/mendoza.jpg';
import NewYorkImage from '../../../assets/images/ny.jpg';
import UshuaiaImage from '../../../assets/images/ushuaia.jpg';
import MiamiImage from '../../../assets/images/miami.jpg';
import IguazuImage from '../../../assets/images/iguazu.jpg';
import MOCK_PACKAGES from '../../flights/utils/mockPackages';

const INITIAL_MOCK_FLIGHTS = [
  { id: 'mock-2', destination: 'Río de Janeiro', description: 'Playas paradisíacas, el Cristo Redentor y una cultura vibrante todo el año.', category: 'playa', price: 380000, currency: 'ARS', images: [RioImage] },
  { id: 'mock-3', destination: 'Madrid', description: 'Arte, cultura, gastronomía e historia en el corazón de España.', category: 'ciudad', price: 950000, currency: 'ARS', images: [MadridImage] },
  { id: 'mock-4', destination: 'Cancún', description: 'Aguas turquesas, arena blanca y la mística de la cultura Maya.', category: 'playa', price: 520000, currency: 'ARS', images: [CancunImage] },
  { id: 'mock-5', destination: 'Mendoza', description: 'Recorridos por las mejores bodegas al pie de la imponente cordillera.', category: 'montaña', price: 140000, currency: 'ARS', images: [MendozaImage] },
  { id: 'mock-6', destination: 'Nueva York', description: 'La ciudad que nunca duerme: rascacielos imponentes, Broadway y Central Park.', category: 'ciudad', price: 890000, currency: 'ARS', images: [NewYorkImage] },
  { id: 'mock-7', destination: 'Ushuaia', description: 'Explorá el Fin del Mundo con sus glaciares majestuosos y paisajes de película.', category: 'montaña', price: 160000, currency: 'ARS', images: [UshuaiaImage] },
  { id: 'mock-8', destination: 'Miami', description: 'Compras, playas de diseño vanguardista y una vida nocturna inigualable.', category: 'playa', price: 720000, currency: 'ARS', images: [MiamiImage] },
  { id: 'mock-10', destination: 'Cataratas del Iguazú', description: 'Siente la fuerza indomable de una de las maravillas naturales del mundo.', category: 'naturaleza', price: 110000, currency: 'ARS', images: [IguazuImage] }
];

const favReducer = (state, action) => {
  switch (action.type) {
    case 'RESET':
      return { status: 'idle', flights: [], error: null };
    case 'LOADING':
      return { ...state, status: 'loading', error: null };
    case 'SUCCESS':
      return { status: 'success', flights: action.flights, error: null };
    case 'ERROR':
      return { status: 'error', flights: [], error: action.error };
    case 'REMOVE':
      return { ...state, flights: state.flights.filter(f => f.id !== action.id) };
    default:
      return state;
  }
};

function UserProfile() {
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('isLoggedIn') === 'true');
  const [userData, setUserData] = useState(() => JSON.parse(localStorage.getItem('currentUser') || 'null'));

  const [optionalData, setOptionalData] = useState(() => ({
    address: userData?.address || '',
    phone: userData?.phone || '',
    city: userData?.city || ''
  }));

  const [editMode, setEditMode] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const [favState, dispatch] = useReducer(favReducer, {
    status: 'idle',
    flights: [],
    error: null,
  });

  const bookingHistory = useMemo(() => {
    if (!userData?.email) return [];
    try {
      const allBookings = JSON.parse(localStorage.getItem('vuelafacil_bookings') || '{}');
      const userBookings = allBookings[userData.email] || [];
      return userBookings.sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));
    } catch {
      return [];
    }
  }, [userData]);

  const loadFavorites = useCallback(async (email) => {
    const allFavorites = JSON.parse(localStorage.getItem('vuelafacil_favorites') || '{}');
    const userFavIds = new Set(allFavorites[email] || []);

    if (userFavIds.size === 0) return [];

    let combinedData = [...INITIAL_MOCK_FLIGHTS];

    try {
      const response = await fetch('/api/vuelos');
      if (response.ok) {
        const apiData = await response.json();
        combinedData = [...apiData, ...INITIAL_MOCK_FLIGHTS, ...MOCK_PACKAGES];
      } else {
        combinedData = [...combinedData, ...MOCK_PACKAGES];
      }
    } catch (err) {
      console.warn('API no disponible, usando mock:', err);
      combinedData = [...combinedData, ...MOCK_PACKAGES];
    }

    const hydrated = combinedData.filter(flight => {
      const flightId = flight?.id;
      return flightId && userFavIds.has(flightId);
    });

    return Array.from(new Map(hydrated.map(i => [i.id, i])).values());
  }, []);

  const loadFavoritesRef = useRef(loadFavorites);
  useEffect(() => {
    loadFavoritesRef.current = loadFavorites;
  }, [loadFavorites]);

  useEffect(() => {
    if (!isLoggedIn || !userData?.email) {
      dispatch({ type: 'RESET' });
      return;
    }

    const email = userData.email;
    let cancelled = false;

    dispatch({ type: 'LOADING' });

    loadFavorites(email)
      .then(flights => {
        if (!cancelled) dispatch({ type: 'SUCCESS', flights });
      })
      .catch(err => {
        console.error('Error cargando favoritos:', err);
        if (!cancelled) dispatch({ type: 'ERROR', error: 'No pudimos cargar tus favoritos. Intenta nuevamente.' });
      });

    return () => { cancelled = true; };
  }, [isLoggedIn, userData, loadFavorites]);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'vuelafacil_favorites' && userData?.email) {
        loadFavoritesRef.current(userData.email)
          .then(flights => dispatch({ type: 'SUCCESS', flights }))
          .catch(() => {});
      }
      if (e.key === 'isLoggedIn') setIsLoggedIn(e.newValue === 'true');
      if (e.key === 'currentUser') setUserData(JSON.parse(e.newValue || 'null'));
      if (e.key === 'vuelafacil_bookings' && userData?.email) {
        setUserData(prev => ({ ...prev }));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [userData]);

  useEffect(() => {
    if (!isLoggedIn || !userData) navigate('/login');
  }, [isLoggedIn, userData, navigate]);

  const removeFavorite = (e, flightId) => {
    e.stopPropagation();
    if (!userData?.email) return;

    dispatch({ type: 'REMOVE', id: flightId });

    const all = JSON.parse(localStorage.getItem('vuelafacil_favorites') || '{}');
    all[userData.email] = (all[userData.email] || []).filter(id => id !== flightId);
    localStorage.setItem('vuelafacil_favorites', JSON.stringify(all));

    window.dispatchEvent(new Event('storage'));
  };

  const handleSaveOptionalData = () => {
    const updatedUser = {
      ...userData,
      address: optionalData.address,
      phone: optionalData.phone,
      city: optionalData.city
    };
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    setUserData(updatedUser);
    setEditMode(false);
    setSaveMessage('Datos guardados correctamente.');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handleOptionalChange = (e) => {
    const { name, value } = e.target;
    setOptionalData(prev => ({ ...prev, [name]: value }));
  };

  if (!isLoggedIn || !userData) return null;

  const { status, flights, error } = favState;

  const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div className="profile-card">
      <div className="profile-header">
        <div className="profile-avatar-large">
          {userData.firstName?.[0]?.toUpperCase()}
          {userData.lastName?.[0]?.toUpperCase()}
        </div>
        <h2 className="profile-title">Mi Perfil</h2>
      </div>

      {/* Datos personales básicos */}
      <div className="profile-data-section">
        <div className="profile-data-group">
          <label>Nombre</label>
          <div className="profile-data-value">{userData.firstName} {userData.lastName}</div>
        </div>
        <div className="profile-data-group">
          <label>Email</label>
          <div className="profile-data-value">{userData.email}</div>
        </div>
      </div>

      {/* Datos opcionales */}
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

      {/* Historial de Reservas */}
      <div className="profile-history-section">
        <h3 className="profile-section-title">Historial de Reservas</h3>
        {bookingHistory.length === 0 ? (
          <p className="empty-message">Aún no has realizado ninguna reserva.</p>
        ) : (
          <div className="history-table">
            {bookingHistory.map((booking, index) => (
              <div key={index} className="history-row">
                <div className="history-row-main">
                  <h4>{booking.destination}</h4>
                  <p className="history-package-desc">{booking.packageDescription}</p>
                  <div className="history-dates">
                    <span><strong>Reservado:</strong> {formatDate(booking.bookingDate)}</span>
                    <span><strong>Ida:</strong> {formatDate(booking.departureDate)}</span>
                    <span><strong>Vuelta:</strong> {formatDate(booking.returnDate)}</span>
                  </div>
                </div>
                <div className="history-row-price">
                  {booking.currency} ${booking.price?.toLocaleString('es-AR')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sección de favoritos */}
      <div className="profile-favorites-section">
        <h3 className="favorites-title">Mis Vuelos Favoritos</h3>
        {status === 'loading' ? (
          <p>Cargando...</p>
        ) : status === 'error' ? (
          <p className="error-message">{error}</p>
        ) : flights.length === 0 ? (
          <p className="empty-message">Aún no tienes vuelos favoritos.</p>
        ) : (
          <div className="favorites-table">
            {flights.map(flight => (
              <div 
                key={flight.id} 
                className="favorite-row"
                onClick={() => navigate(`/detail/${flight.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <img
                  src={flight.images?.[0] || ''}
                  alt={flight.destination}
                  className="row-image"
                />
                <div className="row-info">
                  <h4>{flight.destination}</h4>
                  <p>
                    {new Intl.NumberFormat('es-AR', {
                      style: 'currency',
                      currency: flight.currency || 'ARS',
                    }).format(flight.price)}
                  </p>
                </div>
                <button
                  className="favorite-remove-btn"
                  onClick={(e) => removeFavorite(e, flight.id)}
                  aria-label={`Eliminar ${flight.destination} de favoritos`}
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