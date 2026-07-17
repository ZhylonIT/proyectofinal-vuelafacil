import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { flightService } from '../../../services/flightService';
import { favoritoService } from '../../../services/favoritoService';
import { resenaService } from '../../../services/resenaService';
import '../../../styles/FlightRecommendations.css';

function FlightRecommendations({ activeCategory, searchCriteria, onClearSearch, activeCharacteristics }) {
  const { isAuthenticated } = useAuth();
  const [realFlights, setRealFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [prevCategory, setPrevCategory] = useState(activeCategory);
  const [prevSearchCriteria, setPrevSearchCriteria] = useState(searchCriteria);
  const [favorites, setFavorites] = useState(new Set());
  const [reviewsMap, setReviewsMap] = useState({});

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
        const data = await flightService.obtenerTodos();
        setRealFlights(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error consumiendo la API de vuelos:', error);
        setRealFlights([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFlights();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    favoritoService.misFavoritos()
      .then(favs => setFavorites(new Set(favs.map(f => f.flightId))))
      .catch(err => console.error('Error cargando favoritos:', err));
  }, [isAuthenticated]);

  const toggleFavorite = useCallback(async (e, flightId) => {
    e.stopPropagation();
    if (!isAuthenticated) return;

    const yaEsFavorito = favorites.has(flightId);
    try {
      if (yaEsFavorito) {
        await favoritoService.quitar(flightId);
      } else {
        await favoritoService.agregar(flightId);
      }
      setFavorites(prev => {
        const next = new Set(prev);
        if (yaEsFavorito) next.delete(flightId); else next.add(flightId);
        return next;
      });
    } catch (error) {
      console.error('Error actualizando favorito:', error);
    }
  }, [isAuthenticated, favorites]);

  const processedFlights = useMemo(() => {
    let details = {};
    try {
      details = JSON.parse(localStorage.getItem('vuelafacil_destination_details') || '{}');
    } catch (error) {
      console.error('Error parseando detalles de destino en recomendaciones:', error);
    }

    const baseItems = (searchCriteria && searchCriteria.destination)
      ? realFlights.filter(flight => flight?.destination?.toLowerCase().includes(searchCriteria.destination.trim().toLowerCase()))
      : realFlights;

    const afterCategoryFilter = (!searchCriteria && activeCategory !== 'todos')
      ? baseItems.filter(item => item?.category?.toLowerCase() === activeCategory.toLowerCase())
      : baseItems;

    const afterCharFilter = (activeCharacteristics && activeCharacteristics.length > 0)
      ? afterCategoryFilter.filter(item => {
          const destData = details[item.destination];
          return destData && activeCharacteristics.every(charId => destData.characteristics?.includes(charId));
        })
      : afterCategoryFilter;

    return afterCharFilter;
  }, [realFlights, activeCategory, searchCriteria, activeCharacteristics]);

  const paginatedItems = useMemo(() => {
    const startIndex = searchCriteria ? (currentPage - 1) * 10 : 0;
    const endIndex = searchCriteria ? startIndex + 10 : 10;
    const sliced = processedFlights.slice(startIndex, endIndex);

    return sliced.map(item => ({
      ...item,
      reviewData: reviewsMap[item.id] || { average: '0.0', total: 0 }
    }));
  }, [processedFlights, searchCriteria, currentPage, reviewsMap]);

  useEffect(() => {
    const ids = paginatedItems.map(item => item.id).filter(id => !(id in reviewsMap));
    if (ids.length === 0) return;

    Promise.all(ids.map(id => resenaService.listarPorVuelo(id).then(data => [id, data]).catch(() => [id, null])))
      .then(results => {
        setReviewsMap(prev => {
          const next = { ...prev };
          results.forEach(([id, data]) => {
            if (data) {
              next[id] = { average: data.promedio.toFixed(1), total: data.cantidad };
            }
          });
          return next;
        });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paginatedItems]);

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', width: '100%' }}>
        <h2 className="recommendations-title" style={{ flexGrow: 1 }}>
          {searchCriteria
            ? `Paquetes disponibles hacia ${searchCriteria.destination}`
            : activeCategory === 'todos'
              ? 'Destinos destacados para vos'
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

      {paginatedItems.length === 0 ? (
        <p className="no-results">No hay paquetes disponibles para los criterios seleccionados.</p>
      ) : (
        <>
          <div className="recommendations-grid">
            {paginatedItems.map((item) => (
              <article key={item.id} className="flight-card">
                <div className="flight-image-wrapper">
                  <img
                    src={item.images && item.images.length > 0 ? item.images[0] : 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=600&auto=format&fit=crop'}
                    alt={`Paquete a ${item.destination}`}
                    className="flight-image"
                    loading="lazy"
                  />

                  <span className="flight-category-badge">{capitalize(item.category)}</span>

                  {isAuthenticated && (
                    <button
                      className={`favorite-btn ${favorites.has(item.id) ? 'active' : ''}`}
                      onClick={(e) => toggleFavorite(e, item.id)}
                      aria-label={favorites.has(item.id) ? "Quitar de favoritos" : "Marcar como favorito"}
                      title={favorites.has(item.id) ? "Quitar de favoritos" : "Añadir a favoritos"}
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
                  <h3 className="flight-destination">{item.destination}</h3>

                  <div className="flight-reviews-summary">
                    <span className="flight-stars" aria-label={`${item.reviewData.average} estrellas`}>
                      {[1,2,3,4,5].map(star => (
                        <span key={star} className={star <= Math.round(Number(item.reviewData.average)) ? 'star-filled' : 'star-empty'}>★</span>
                      ))}
                    </span>
                    <span className="flight-reviews-count">
                      {item.reviewData.total > 0
                        ? `(${item.reviewData.total} valoracione${item.reviewData.total === 1 ? '' : 's'})`
                        : 'Sin valoraciones'}
                    </span>
                  </div>

                  <p className="flight-description">{item.description}</p>
                  <div className="flight-footer">
                    <span className="flight-price">Desde <strong>${item.price.toLocaleString('es-AR')}</strong> {item.currency}</span>
                    <div className="flight-actions">
                      <button className="flight-btn" onClick={() => navigate(`/detail/${item.id}`)}>Ver Detalle</button>
                      <button className="flight-btn reserve-btn" onClick={() => navigate(`/detail/${item.id}#availability`)}>Reservar</button>
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
