import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ReviewSection from '../features/flights/components/ReviewSection';
import { flightService } from '../services/flightService';
import { reservaService } from '../services/reservaService';
import { useAuth } from '../context/AuthContext';
import '../styles/Booking.css';

function Booking() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const destination = searchParams.get('destination');
  const departureDate = searchParams.get('departure');
  const returnDate = searchParams.get('return');
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      const currentUrl = `/reserva?destination=${encodeURIComponent(destination || '')}&departure=${departureDate || ''}&return=${returnDate || ''}`;
      navigate(`/login?redirect=${encodeURIComponent(currentUrl)}`);
    }
  }, [isAuthenticated, destination, departureDate, returnDate, navigate]);

  useEffect(() => {
    if (!destination) return;

    const fetchPackages = async () => {
      setLoading(true);
      setBookingError('');
      try {
        const realFlights = await flightService.obtenerTodos();
        const query = destination.trim().toLowerCase();
        const matched = realFlights.filter(flight => flight?.destination?.toLowerCase().includes(query));

        if (matched.length === 0) {
          setBookingError('No se encontraron paquetes disponibles para el destino seleccionado.');
        }

        setPackages(matched);
      } catch {
        setBookingError('Ocurrió un error al cargar los paquetes. Verificá tu conexión e intentá de nuevo.');
        setPackages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, [destination]);

  const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString + 'T00:00:00');
    return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const handleSelectPackage = (pkg) => {
    setSelectedPackage(pkg);
  };

  const handleConfirmBooking = async () => {
    if (!selectedPackage) {
      setBookingError('Debés seleccionar un paquete antes de confirmar.');
      return;
    }

    const today = new Date();
    const todayISO = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    if (!departureDate || departureDate < todayISO) {
      setBookingError('La fecha de ida no puede ser anterior al día de hoy. Volvé atrás y elegí una fecha válida.');
      return;
    }

    setIsSubmitting(true);
    setBookingError('');

    try {
      await reservaService.crear({
        flightId: selectedPackage.id,
        fechaIda: departureDate,
        fechaVuelta: returnDate || null,
      });
      setBookingConfirmed(true);
    } catch (error) {
      setBookingError(error.message || 'No pudimos confirmar tu reserva. Intentá nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="booking-page-container">
        <p className="booking-loading">Cargando paquetes disponibles...</p>
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="booking-page-container">
        <p className="booking-error">No se especificó un destino para reservar.</p>
        <button className="booking-back-btn" onClick={() => navigate(-1)}>← Volver</button>
      </div>
    );
  }

  return (
    <main className="booking-page-container">
      <div className="booking-card">
        <h1 className="booking-title">Reservar Paquete en {destination}</h1>

        {departureDate && (
          <div className="booking-dates">
            <p><span className="booking-date-label">Fecha de ida:</span> {formatDate(departureDate)}</p>
            {returnDate && <p><span className="booking-date-label">Fecha de vuelta:</span> {formatDate(returnDate)}</p>}
          </div>
        )}

        {bookingError && (
          <div className="booking-error-alert" role="alert">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="currentColor"/>
            </svg>
            <span>{bookingError}</span>
          </div>
        )}

        {packages.length === 0 && !bookingError ? (
          <p className="booking-error">No hay paquetes disponibles para {destination}.</p>
        ) : !selectedPackage ? (
          <>
            <h2 className="booking-subtitle">Seleccioná un paquete:</h2>
            <div className="package-list">
              {packages.map((pkg) => {
                const sinCupos = pkg.available === false;
                return (
                  <div
                    key={pkg.id}
                    className={`package-option ${selectedPackage?.id === pkg.id ? 'selected' : ''}`}
                    style={sinCupos ? { opacity: 0.55, cursor: 'not-allowed' } : undefined}
                    onClick={() => !sinCupos && handleSelectPackage(pkg)}
                  >
                    <h3>{pkg.destination}</h3>
                    <p>{pkg.description}</p>
                    <span className="package-price">{pkg.currency} ${pkg.price}</span>
                    {typeof pkg.availableSeats === 'number' && !sinCupos && (
                      <p style={{ fontSize: '0.85rem', color: '#81c784', margin: '0.25rem 0' }}>
                        Cupos disponibles: {pkg.availableSeats}
                      </p>
                    )}
                    <button className="select-package-btn" disabled={sinCupos}>
                      {sinCupos ? 'Sin cupos' : 'Seleccionar'}
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        ) : !bookingConfirmed ? (
          <div className="booking-summary">
            <h2 className="booking-subtitle">Confirmar reserva</h2>

            {user && (
              <div className="booking-user-info">
                <h3 className="booking-subtitle">Tus datos</h3>
                <p><strong>Nombre:</strong> {user.firstName} {user.lastName}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <button
                  className="booking-back-btn"
                  onClick={() => navigate('/perfil')}
                  style={{ marginTop: '0.5rem' }}
                >
                  Ampliar / Editar perfil
                </button>
              </div>
            )}

            <p><strong>Paquete:</strong> {selectedPackage.description}</p>
            <p><strong>Precio:</strong> {selectedPackage.currency} ${selectedPackage.price}</p>
            <button
              className="booking-confirm-btn"
              onClick={handleConfirmBooking}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Confirmando...' : 'Confirmar reserva'}
            </button>
            <button
              className="booking-back-btn"
              onClick={() => setSelectedPackage(null)}
              style={{ marginTop: '0.5rem' }}
              disabled={isSubmitting}
            >
              Cambiar paquete
            </button>
          </div>
        ) : (
          <div className="booking-success-section">
            <div className="booking-success-header">
              <span className="booking-success-icon">✅</span>
              <h2 className="booking-success-title">¡Paquete reservado con éxito!</h2>
              <p className="booking-success-details">
                Destino: <strong>{selectedPackage.destination}</strong>
                <br />
                Paquete: {selectedPackage.description}
                <br />
                Fecha de ida: {formatDate(departureDate)}
                {returnDate && (
                  <>
                    <br />
                    Fecha de vuelta: {formatDate(returnDate)}
                  </>
                )}
              </p>
            </div>

            <div className="booking-review-wrapper">
              <ReviewSection productId={selectedPackage.id} destination={selectedPackage.destination} />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default Booking;
