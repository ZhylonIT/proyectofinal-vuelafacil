import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FlightGallery from '../features/flights/components/FlightGallery';
import AvailabilityCalendar from '../features/flights/components/AvailabilityCalendar';
import FlightPolicies from '../features/flights/components/FlightPolicies';
import ShareModal from '../features/flights/components/ShareModal';
import ReviewSection from '../features/flights/components/ReviewSection';
import { flightService } from '../services/flightService';
import { destinoService } from '../services/destinoService';
import { useAuth } from '../context/AuthContext';
import '../styles/FlightDetail.css';

function Detail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [flight, setFlight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isShareOpen, setIsShareOpen] = useState(false);

  useEffect(() => {
    const fetchFlightDetail = async () => {
      try {
        setLoading(true);
        const data = await flightService.obtenerPorId(id);
        setFlight(data);
      } catch (error) {
        console.warn('No se pudo obtener el vuelo:', error);
        setFlight(null);
      } finally {
        setLoading(false);
      }
    };

    fetchFlightDetail();
  }, [id]);

  useEffect(() => {
    if (window.location.hash === '#availability' && !loading && flight) {
      const timer = setTimeout(() => {
        const el = document.getElementById('availability');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [loading, flight]);

  const [destinationData, setDestinationData] = useState({ chars: [], description: '' });

  useEffect(() => {
    if (!flight || !flight.destination) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDestinationData({ chars: [], description: '' });
      return;
    }

    destinoService.listar()
      .then(destinos => {
        const destData = (Array.isArray(destinos) ? destinos : [])
          .find(d => d.nombreDestino?.toLowerCase() === flight.destination.toLowerCase());
        setDestinationData({
          chars: destData?.caracteristicas || [],
          description: destData?.descripcion || ''
        });
      })
      .catch(error => {
        console.warn('No se pudo obtener la información del destino:', error);
        setDestinationData({ chars: [], description: '' });
      });
  }, [flight]);

  const handleBooking = (departure, returnDate) => {
    const bookingUrl = `/reserva?destination=${encodeURIComponent(flight.destination)}&departure=${departure}&return=${returnDate}`;
    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(bookingUrl)}`);
    } else {
      navigate(bookingUrl);
    }
  };

  if (loading) {
    return (
      <div className="detail-status-container">
        <p className="detail-loading">Cargando la bitácora completa del destino...</p>
      </div>
    );
  }

  if (!flight) {
    return (
      <div className="detail-status-container">
        <p className="detail-error">El destino solicitado no figura en los registros de la aerolínea.</p>
        <button className="back-arrow-btn" onClick={() => navigate(-1)}>← Volver al Home</button>
      </div>
    );
  }

  return (
    <main className="detail-container">
      <header className="detail-header">
        <h1 className="detail-title">{flight.destination}</h1>
        <div className="detail-header-actions">
          <button
            className="share-trigger-btn"
            onClick={() => setIsShareOpen(true)}
            aria-label="Compartir este destino"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
            Compartir
          </button>
          <button
            className="back-arrow-btn"
            onClick={() => navigate(-1)}
            aria-label="Volver a la página anterior"
          >
            Volver Atrás ➔
          </button>
        </div>
      </header>

      <section className="detail-body">
        <div className="detail-info-card">
          <span className="detail-badge">{flight.category}</span>

          <p className="detail-description" style={{ marginBottom: '1.5rem' }}>
            <strong>Sobre el paquete:</strong> {flight.description}
          </p>

          <div className="detail-pricing">
            <span className="pricing-label">Tarifa Preferencial:</span>
            <span className="pricing-value">Desde {flight.currency} ${flight.price}</span>
          </div>

          <div className="detail-characteristics-section">
            {destinationData.description && (
              <div style={{ marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px dashed rgba(255,255,255,0.1)' }}>
                <h3 className="characteristics-title" style={{ fontSize: '1.2rem', marginBottom: '0.8rem', color: '#8ab4f8' }}>
                  Conoce {flight.destination}
                </h3>
                <p className="detail-description" style={{ fontSize: '0.95rem', color: '#b0bec5', margin: 0 }}>
                  {destinationData.description}
                </p>
              </div>
            )}

            <h3 className="characteristics-title">Características</h3>
            {destinationData.chars.length > 0 ? (
              <div className="characteristics-grid">
                {destinationData.chars.map(char => (
                  <div key={char.id} className="characteristic-item">
                    <span className="characteristic-icon">{char.icono}</span>
                    <span className="characteristic-name">{char.nombre}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-characteristics-msg">
                Este destino aún no tiene características adicionales registradas en el catálogo.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="detail-availability-section" id="availability">
        <AvailabilityCalendar destination={flight.destination} onBooking={handleBooking} />
      </section>

      <section className="detail-gallery-section">
        <h2 className="detail-gallery-title">Galería de Exploración</h2>
        <FlightGallery images={flight.images} destination={flight.destination} />
      </section>

      <section className="detail-reviews-section">
        <ReviewSection productId={flight.id} destination={flight.destination} />
      </section>

      <section className="detail-policies-section">
        <FlightPolicies />
      </section>

      {isShareOpen && (
        <ShareModal 
          flight={flight}
          onClose={() => setIsShareOpen(false)}
        />
      )}
    </main>
  );
}

export default Detail;