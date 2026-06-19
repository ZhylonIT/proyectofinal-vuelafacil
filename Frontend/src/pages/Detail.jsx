import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FlightGallery from '../features/flights/components/FlightGallery';
import '../styles/FlightDetail.css';

// Base de datos de contingencia idéntica para resolución offline/mock
const INITIAL_MOCK_FLIGHTS = [
  { id: 'mock-1', destination: 'San Carlos de Bariloche', description: 'Disfruta de la nieve, los lagos andinos y los mejores chocolates de la Patagonia.', category: 'montaña', price: 120000, currency: 'ARS', images: ['https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=1200&auto=format&fit=crop'] },
  { id: 'mock-2', destination: 'Río de Janeiro', description: 'Playas paradisíacas, el Cristo Redentor y una cultura vibrante todo el año.', category: 'playa', price: 380000, currency: 'ARS', images: [] },
  { id: 'mock-3', destination: 'Madrid', description: 'Arte, cultura, gastronomía e historia en el corazón de España.', category: 'ciudad', price: 950000, currency: 'ARS', images: [] },
  { id: 'mock-4', destination: 'Cancún', description: 'Aguas turquesas, arena blanca y la mística de la cultura Maya.', category: 'playa', price: 520000, currency: 'ARS', images: [] },
  { id: 'mock-5', destination: 'Mendoza', description: 'Recorridos por las mejores bodegas al pie de la imponente cordillera.', category: 'montaña', price: 140000, currency: 'ARS', images: [] },
  { id: 'mock-6', destination: 'Nueva York', description: 'La ciudad que nunca duerme: rascacielos imponentes, Broadway y Central Park.', category: 'ciudad', price: 890000, currency: 'ARS', images: [] },
  { id: 'mock-7', destination: 'Ushuaia', description: 'Explorá el Fin del Mundo con sus glaciares majestuosos y paisajes de película.', category: 'montaña', price: 160000, currency: 'ARS', images: [] },
  { id: 'mock-8', destination: 'Miami', description: 'Compras, playas de diseño vanguardista y una vida nocturna inigualable.', category: 'playa', price: 720000, currency: 'ARS', images: [] },
  { id: 'mock-9', destination: 'Roma', description: 'Un viaje al pasado a través del Coliseo, el Vaticano y la gastronomía italiana.', category: 'ciudad', price: 980000, currency: 'ARS', images: [] },
  { id: 'mock-10', destination: 'Cataratas del Iguazú', description: 'Siente la fuerza indomable de una de las maravillas naturales del mundo.', category: 'naturaleza', price: 110000, currency: 'ARS', images: [] }
];

function Detail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [flight, setFlight] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFlightDetail = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/vuelos/${id}`);
        if (response.ok) {
          const data = await response.json();
          setFlight(data);
        } else {
          const fallback = INITIAL_MOCK_FLIGHTS.find(f => String(f.id) === String(id));
          setFlight(fallback || null);
        }
      } catch (error) {
        // FIX: Se inyecta la variable 'error' en el log para cumplir la pureza del Linter
        console.warn(`Servidor OFF - Extrayendo detalle desde almacenamiento local. Motivo: ${error.message}`);
        const fallback = INITIAL_MOCK_FLIGHTS.find(f => String(f.id) === String(id));
        setFlight(fallback || null);
      } finally {
        setLoading(false);
      }
    };

    fetchFlightDetail();
  }, [id]);

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
        <button 
          className="back-arrow-btn" 
          onClick={() => navigate(-1)} 
          aria-label="Volver a la página anterior"
        >
          Volver Atrás ➔
        </button>
      </header>

      <section className="detail-body">
        <div className="detail-info-card">
          <span className="detail-badge">{flight.category}</span>
          <p className="detail-description">{flight.description || flight.descripcion}</p>
          <div className="detail-pricing">
            <span className="pricing-label">Tarifa Preferencial:</span>
            <span className="pricing-value">Desde {flight.currency} ${flight.price}</span>
          </div>
        </div>
      </section>

      <section className="detail-gallery-section">
        <h2 className="detail-gallery-title">Galería de Exploración</h2>
        <FlightGallery images={flight.images} destination={flight.destination} />
      </section>
    </main>
  );
}

export default Detail;