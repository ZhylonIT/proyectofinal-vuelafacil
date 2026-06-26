import { useEffect, useState, useCallback, useReducer, useRef } from 'react';
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

  const [favState, dispatch] = useReducer(favReducer, {
    status: 'idle',
    flights: [],
    error: null,
  });

  const loadFavorites = useCallback(async (email) => {
    const allFavorites = JSON.parse(localStorage.getItem('vuelafacil_favorites') || '{}');
    const userFavIds = new Set(allFavorites[email] || []);

    if (userFavIds.size === 0) return [];

    let combinedData = INITIAL_MOCK_FLIGHTS;
    try {
      const response = await fetch('/api/vuelos');
      if (response.ok) {
        const apiData = await response.json();
        combinedData = [...apiData, ...INITIAL_MOCK_FLIGHTS];
      }
    } catch (err) {
      console.warn('API no disponible, usando mock:', err);
    }

    const hydrated = combinedData.filter(flight => userFavIds.has(flight.id));
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

  if (!isLoggedIn || !userData) return null;

  const { status, flights, error } = favState;

  return (
    <div className="profile-card">
      <div className="profile-header">
        <div className="profile-avatar-large">
          {userData.firstName?.[0]?.toUpperCase()}
          {userData.lastName?.[0]?.toUpperCase()}
        </div>
        <h2 className="profile-title">Mi Perfil</h2>
      </div>

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