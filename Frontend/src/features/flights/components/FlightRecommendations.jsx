import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../../styles/FlightRecommendations.css';
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

function FlightRecommendations({ activeCategory, searchCriteria, onClearSearch, activeCharacteristics }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [prevCategory, setPrevCategory] = useState(activeCategory);
  const [prevSearchCriteria, setPrevSearchCriteria] = useState(searchCriteria);

  const [userSession] = useState(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (isLoggedIn && currentUser && currentUser.email) {
      return { isLoggedIn: true, email: currentUser.email };
    }
    return { isLoggedIn: false, email: null };
  });

  const [favorites, setFavorites] = useState(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (isLoggedIn && currentUser && currentUser.email) {
      const allFavorites = JSON.parse(localStorage.getItem('vuelafacil_favorites') || '{}');
      return new Set(allFavorites[currentUser.email] || []);
    }
    return new Set();
  });

  if (activeCategory !== prevCategory || searchCriteria !== prevSearchCriteria) {
    setPrevCategory(activeCategory);
    setPrevSearchCriteria(searchCriteria);
    setCurrentPage(1);
  }  

  const navigate = useNavigate();

  useEffect(() => {
    const fetchFlights = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/vuelos');
        let combinedData = [];

        if (response.ok) {
          const data = await response.json();          
          combinedData = [...data, ...INITIAL_MOCK_FLIGHTS];
        } else {
          combinedData = INITIAL_MOCK_FLIGHTS;
        }

        const uniqueFlights = [];
        const seenDestinations = new Set();

        combinedData.forEach(flight => {
          if (flight && flight.destination) {
            const normalizedDest = flight.destination.trim().toLowerCase();
            if (!seenDestinations.has(normalizedDest)) {
              seenDestinations.add(normalizedDest);
              uniqueFlights.push(flight);
            }
          }
        });

        const randomized = [...uniqueFlights].sort(() => Math.random() - 0.5);
        setRecommendations(randomized);

      } catch (error) {
        console.error("Error consumiendo la API de vuelos, activando datos de respaldo locales:", error);
        const randomizedMock = [...INITIAL_MOCK_FLIGHTS].sort(() => Math.random() - 0.5);
        setRecommendations(randomizedMock);
      } finally {
        setLoading(false);
      }
    };

    fetchFlights();
  }, []);

  const toggleFavorite = useCallback((e, flightId) => {
    e.stopPropagation();
    
    if (!userSession.isLoggedIn || !userSession.email) return;

    setFavorites(prevFavorites => {
      const newFavorites = new Set(prevFavorites);
      if (newFavorites.has(flightId)) {
        newFavorites.delete(flightId);
      } else {
        newFavorites.add(flightId);
      }

      const allFavorites = JSON.parse(localStorage.getItem('vuelafacil_favorites') || '{}');
      allFavorites[userSession.email] = Array.from(newFavorites);
      localStorage.setItem('vuelafacil_favorites', JSON.stringify(allFavorites));

      return newFavorites;
    });
  }, [userSession]);

  const targetDestinationProfile = useMemo(() => {
    if (!searchCriteria) return null;
    const query = searchCriteria.destination.trim().toLowerCase();
    
    const matched = recommendations.find(f => f.destination?.toLowerCase().includes(query)) ||
                    INITIAL_MOCK_FLIGHTS.find(f => f.destination?.toLowerCase().includes(query));
    
    if (matched) return matched;

    return {
      id: 'mock-custom-fallback',
      destination: searchCriteria.destination,
      category: 'exótico',
      price: 450000,
      currency: 'ARS',
      images: ['https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=600&auto=format&fit=crop'],
      description: `Ruta especial hacia ${searchCriteria.destination}. Descubrí paisajes inigualables.`
    };
  }, [searchCriteria, recommendations]);

  const generatedSearchResults = useMemo(() => {
    if (!searchCriteria || !targetDestinationProfile) return [];

    const airlines = [
      'Aerolíneas Argentinas', 'LATAM Airlines', 'Flybondi', 
      'JetSMART', 'Iberia', 'American Airlines', 'Copa Airlines', 'Avianca'
    ];
    
    const passengerCount = parseInt(searchCriteria.passengers, 10) || 1;
    const items = [];

    for (let i = 1; i <= 24; i++) {
      const airline = airlines[i % airlines.length];
      const stopType = i % 3 === 0 ? 'Directo' : (i % 3 === 1 ? '1 Escala' : '2 Escalas');
      const hour = String(6 + (i * 2) % 17).padStart(2, '0');
      const minute = i % 2 === 0 ? '30' : '00';
      
      const basePrice = targetDestinationProfile.price;
      const mutatedPrice = Math.round((basePrice + (i * 15000) - (i % 2 * 9000)));

      items.push({
        id: `search-res-${targetDestinationProfile.id}-${i}`,
        destination: targetDestinationProfile.destination,
        description: `${stopType} • Operado por ${airline}. Salida: ${hour}:${minute} hs desde ${searchCriteria.origin}. Equipaje de cabina incluido.`,
        category: targetDestinationProfile.category,
        price: mutatedPrice * passengerCount,
        currency: targetDestinationProfile.currency,
        images: targetDestinationProfile.images
      });
    }

    return items;
  }, [searchCriteria, targetDestinationProfile]);

  const reviewsMap = useMemo(() => {
    try {
      const allReviews = JSON.parse(localStorage.getItem('vuelafacil_reviews') || '{}');
      const map = {};
      Object.keys(allReviews).forEach(productId => {
        const productReviews = allReviews[productId];
        if (productReviews.length > 0) {
          const sum = productReviews.reduce((acc, r) => acc + r.rating, 0);
          map[productId] = {
            average: (sum / productReviews.length).toFixed(1),
            total: productReviews.length
          };
        }
      });
      return map;
    } catch {
      return {};
    }
  }, []);

  const processedFlights = useMemo(() => {
    const details = JSON.parse(localStorage.getItem('vuelafacil_destination_details') || '{}');
    
    let filtered = searchCriteria 
      ? generatedSearchResults 
      : (activeCategory === 'todos' ? recommendations : recommendations.filter(flight => flight.category?.toLowerCase() === activeCategory.toLowerCase()));
    if (activeCharacteristics && activeCharacteristics.length > 0) {
      filtered = filtered.filter(flight => {
        const destData = details[flight.destination];
        return destData && activeCharacteristics.every(charId => destData.characteristics?.includes(charId));
      });
    }

    return filtered;
  }, [recommendations, activeCategory, searchCriteria, generatedSearchResults, activeCharacteristics]);

  const paginatedFlightsWithReviews = useMemo(() => {
    const startIndex = searchCriteria ? (currentPage - 1) * 10 : 0;
    const endIndex = searchCriteria ? startIndex + 10 : 10;
    const sliced = processedFlights.slice(startIndex, endIndex);
    
    return sliced.map(flight => ({
      ...flight,
      reviewData: reviewsMap[flight.id] || { average: '0.0', total: 0 }
    }));
  }, [processedFlights, searchCriteria, currentPage, reviewsMap]);

  const totalItems = processedFlights.length;
  const totalPages = Math.ceil(totalItems / 10);
  
  const capitalize = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';

  if (loading) {
    return (
      <section className="recommendations-container">
        <p className="no-results">Cargando ofertas exclusivas del catálogo...</p>
      </section>
    );
  }

  return (
    <section className="recommendations-container">
      <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', flexWrap: 'wrap', width: '100%' }}>
        <h2 className="recommendations-title" style={{ flexGrow: 1 }}>
          {searchCriteria 
            ? `Vuelos encontrados desde ${searchCriteria.origin} hacia ${targetDestinationProfile?.destination}`
            : activeCategory === 'todos' 
              ? 'Destinos destacados para vos ' 
              : `Ofertas exclusivas en ${capitalize(activeCategory)}`}
        </h2>
        {searchCriteria && (
          <button 
            onClick={onClearSearch}
            className="flight-btn"
            style={{ marginBottom: '1.5rem', background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)' }}
          >
            Volver a Destacados
          </button>
        )}
      </div>
      
      {paginatedFlightsWithReviews.length === 0 ? (
        <p className="no-results">No hay vuelos disponibles para los criterios seleccionados por el momento.</p>
      ) : (
        <>
          <div className="recommendations-grid">
            {paginatedFlightsWithReviews.map((flight) => (
              <article key={flight.id} className="flight-card">
                <div className="flight-image-wrapper">
                  <img 
                    src={flight.images && flight.images.length > 0 ? flight.images[0] : 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=600&auto=format&fit=crop'} 
                    alt={`Vuelo a ${flight.destination}`} 
                    className="flight-image" 
                    loading="lazy"
                  />
                  
                  <span className="flight-category-badge">{capitalize(flight.category)}</span>

                  {userSession.isLoggedIn && (
                    <button 
                      className={`favorite-btn ${favorites.has(flight.id) ? 'active' : ''}`}
                      onClick={(e) => toggleFavorite(e, flight.id)}
                      aria-label={favorites.has(flight.id) ? "Quitar de favoritos" : "Marcar como favorito"}
                      title={favorites.has(flight.id) ? "Quitar de favoritos" : "Añadir a favoritos"}
                    >
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path 
                          d="M12.62 20.81C12.28 20.93 11.72 20.93 11.38 20.81C8.48 19.82 2 15.69 2 8.68998C2 5.59998 4.49 3.09998 7.56 3.09998C9.38 3.09998 10.99 3.97998 12 5.33998C13.01 3.97998 14.63 3.09998 16.44 3.09998C19.51 3.09998 22 5.59998 22 8.68998C22 15.69 15.52 19.82 12.62 20.81Z" 
                          stroke="currentColor" 
                          strokeWidth="1.5" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                          className="heart-path"
                        />
                      </svg>
                    </button>
                  )}
                </div>
                <div className="flight-info">
                  <h3 className="flight-destination">{flight.destination}</h3>
                  
                  <div className="flight-reviews-summary">
                    <span className="flight-stars" aria-label={`${flight.reviewData.average} estrellas`}>
                      {[1,2,3,4,5].map(star => (
                        <span key={star} className={star <= Math.round(Number(flight.reviewData.average)) ? 'star-filled' : 'star-empty'}>★</span>
                      ))}
                    </span>
                    <span className="flight-reviews-count">
                      {flight.reviewData.total > 0 
                        ? `(${flight.reviewData.total} valoracione${flight.reviewData.total === 1 ? '' : 's'})`
                        : 'Sin valoraciones'}
                    </span>
                  </div>

                  <p className="flight-description">{flight.description || flight.descripcion}</p>
                  <div className="flight-footer">
                    <span className="flight-price">Desde <strong>${flight.price.toLocaleString('es-AR')}</strong> {flight.currency}</span>
                    <div className="flight-actions">
                      <button className="flight-btn" onClick={() => navigate(`/detail/${flight.id}`)}>Ver Detalle</button>
                      <button className="flight-btn reserve-btn" onClick={() => navigate(`/detail/${flight.id}#availability`)}>Reservar</button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {searchCriteria && totalPages > 1 && (
            <div 
              className="pagination-container" 
              style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                gap: '0.75rem', 
                marginTop: '3rem', 
                paddingBottom: '2rem' 
              }}
            >
              <button
                className="flight-btn"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                style={{ 
                  opacity: currentPage === 1 ? 0.4 : 1, 
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  padding: '6px 12px',
                  fontSize: '0.85rem'
                }}
              >
                Primera Pág.
              </button>
              <button
                className="flight-btn"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                style={{ 
                  opacity: currentPage === 1 ? 0.4 : 1, 
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  padding: '6px 12px',
                  fontSize: '0.85rem'
                }}
              >
                Anterior
              </button>
              <span 
                style={{ 
                  color: '#ffffff', 
                  fontFamily: 'Montserrat, sans-serif', 
                  fontSize: '0.95rem', 
                  margin: '0 12px' 
                }}
              >
                Página <strong>{currentPage}</strong> de {totalPages}
              </span>
              <button
                className="flight-btn"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                style={{ 
                  opacity: currentPage === totalPages ? 0.4 : 1, 
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  padding: '6px 12px',
                  fontSize: '0.85rem'
                }}
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default FlightRecommendations;