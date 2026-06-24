import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FlightGallery from '../features/flights/components/FlightGallery';
import '../styles/FlightDetail.css';

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
        console.warn(`Servidor OFF - Extrayendo detalle desde almacenamiento local. Motivo: ${error.message}`);
        const fallback = INITIAL_MOCK_FLIGHTS.find(f => String(f.id) === String(id));
        setFlight(fallback || null);
      } finally {
        setLoading(false);
      }
    };

    fetchFlightDetail();
  }, [id]);

  const destinationData = useMemo(() => {
    if (!flight || !flight.destination) return { chars: [], description: '' };

    const globalCharsRaw = localStorage.getItem('vuelafacil_characteristics');
    const globalChars = globalCharsRaw ? JSON.parse(globalCharsRaw) : [
      { id: 'char-1', name: 'Apto Familia', icon: '👨‍👩‍👧‍👦' },
      { id: 'char-2', name: 'Aventura Externa', icon: '🧗' },
      { id: 'char-3', name: 'Relajación Total', icon: '💆' },
      { id: 'char-4', name: 'Wifi Alta Velocidad', icon: '📶' }
    ];

    const destDetailsRaw = localStorage.getItem('vuelafacil_destination_details');
    const destDetails = destDetailsRaw ? JSON.parse(destDetailsRaw) : {};

    const destData = destDetails[flight.destination];
    let matchedChars = [];
    let destDescription = '';

    if (destData) {
      destDescription = destData.description || '';
      if (destData.characteristics) {
        matchedChars = destData.characteristics
          .map(charId => globalChars.find(c => c.id === charId))
          .filter(Boolean);
      }
    }
    
    return { chars: matchedChars, description: destDescription };
  }, [flight]);

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
          
          {/* Descripción del paquete/vuelo */}
          <p className="detail-description" style={{ marginBottom: '1.5rem' }}>
            <strong>Sobre el paquete:</strong> {flight.description || flight.descripcion}
          </p>

          <div className="detail-pricing">
            <span className="pricing-label">Tarifa Preferencial:</span>
            <span className="pricing-value">Desde {flight.currency} ${flight.price}</span>
          </div>

          <div className="detail-characteristics-section">
            {/* Descripción General del Destino */}
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
                    <span className="characteristic-icon">{char.icon}</span>
                    <span className="characteristic-name">{char.name}</span>
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

      <section className="detail-gallery-section">
        <h2 className="detail-gallery-title">Galería de Exploración</h2>
        <FlightGallery images={flight.images} destination={flight.destination} />
      </section>
    </main>
  );
}

export default Detail;