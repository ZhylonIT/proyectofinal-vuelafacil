import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ReviewSection from '../features/flights/components/ReviewSection';
import MOCK_PACKAGES from '../features/flights/utils/mockPackages';
import { isDateRangeAvailable } from '../features/flights/utils/availabilityUtils';
import '../styles/Booking.css';

function Booking() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const destination = searchParams.get('destination');
  const departureDate = searchParams.get('departure');
  const returnDate = searchParams.get('return');
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingError, setBookingError] = useState('');

  // Simulación de envío de correo
  const [emailSent, setEmailSent] = useState(false);
  const [emailData, setEmailData] = useState(null);

  const [currentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('currentUser') || 'null');
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
      const currentUrl = `/reserva?destination=${encodeURIComponent(destination || '')}&departure=${departureDate || ''}&return=${returnDate || ''}`;
      navigate(`/login?redirect=${encodeURIComponent(currentUrl)}`);
    }
  }, [destination, departureDate, returnDate, navigate]);

  useEffect(() => {
    if (!destination) {
      return;
    }

    const fetchPackages = async () => {
      setLoading(true);
      setBookingError('');
      try {
        let realFlights = [];
        try {
          const response = await fetch('/api/vuelos');
          if (response.ok) {
            const data = await response.json();
            realFlights = Array.isArray(data) ? data : [];
          }
        } catch {
          console.warn('API no disponible, usando solo datos locales');
        }

        const query = destination.trim().toLowerCase();
        const matchedMock = MOCK_PACKAGES.filter(pkg =>
          pkg.destination?.toLowerCase().includes(query)
        );
        const matchedReal = realFlights.filter(flight =>
          flight?.destination?.toLowerCase().includes(query)
        );

        const realDestinations = new Set(matchedReal.map(f => f.destination?.toLowerCase()));
        const filteredMock = matchedMock.filter(pkg => !realDestinations.has(pkg.destination?.toLowerCase()));
        let allPackages = [...matchedReal, ...filteredMock];

        if (departureDate && returnDate) {
          allPackages = allPackages.filter(pkg =>
            isDateRangeAvailable(pkg.destination, departureDate, returnDate)
          );
        }

        if (allPackages.length === 0) {
          setBookingError('No se encontraron paquetes disponibles para las fechas seleccionadas. Intentá con otras fechas o destino.');
        }

        setPackages(allPackages);
      } catch {
        setBookingError('Ocurrió un error al cargar los paquetes. Verificá tu conexión e intentá de nuevo.');
        setPackages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, [destination, departureDate, returnDate]);

  const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString + 'T00:00:00');
    return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const formatDateTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString('es-AR', { 
      day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const handleSelectPackage = (pkg) => {
    setSelectedPackage(pkg);
  };

  const handleConfirmBooking = () => {
    if (!selectedPackage) {
      setBookingError('Debés seleccionar un paquete antes de confirmar.');
      return;
    }

    if (Math.random() < 0.1) {
      setBookingError('Error al procesar la reserva: conflicto de disponibilidad. Por favor, intentá con otras fechas o seleccioná otro paquete.');
      return;
    }

    // Guardar en historial
    const bookingDateTime = new Date().toISOString();
    if (currentUser?.email) {
      const allBookings = JSON.parse(localStorage.getItem('vuelafacil_bookings') || '{}');
      const userBookings = allBookings[currentUser.email] || [];
      userBookings.push({
        destination: selectedPackage.destination,
        packageDescription: selectedPackage.description,
        price: selectedPackage.price,
        currency: selectedPackage.currency,
        departureDate,
        returnDate,
        bookingDate: bookingDateTime
      });
      allBookings[currentUser.email] = userBookings;
      localStorage.setItem('vuelafacil_bookings', JSON.stringify(allBookings));
    }

    const emailContent = {
      to: currentUser?.email || 'usuario@vuelafacil.com',
      subject: `Confirmación de reserva - ${selectedPackage.destination}`,
      bookingDate: bookingDateTime,
      destination: selectedPackage.destination,
      packageDescription: selectedPackage.description,
      price: selectedPackage.price,
      currency: selectedPackage.currency,
      departureDate,
      returnDate,
      userName: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Usuario',
      contactInfo: 'VuelaFácil - Atención al cliente: +54 11 2345-6789 - info@vuelafacil.com'
    };

    setBookingConfirmed(true);
    setBookingError('');
    
    setTimeout(() => {
      setEmailData(emailContent);
      setEmailSent(true);
      
      const sentEmails = JSON.parse(localStorage.getItem('vuelafacil_emails_sent') || '[]');
      sentEmails.push({
        ...emailContent,
        sentAt: new Date().toISOString()
      });
      localStorage.setItem('vuelafacil_emails_sent', JSON.stringify(sentEmails));
    }, 1500);
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
          <p className="booking-error">No hay paquetes disponibles para {destination} en las fechas seleccionadas.</p>
        ) : !selectedPackage ? (
          <>
            <h2 className="booking-subtitle">Seleccioná un paquete:</h2>
            <div className="package-list">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`package-option ${selectedPackage?.id === pkg.id ? 'selected' : ''}`}
                  onClick={() => handleSelectPackage(pkg)}
                >
                  <h3>{pkg.destination}</h3>
                  <p>{pkg.description}</p>
                  <span className="package-price">{pkg.currency} ${pkg.price}</span>
                  <button className="select-package-btn">Seleccionar</button>
                </div>
              ))}
            </div>
          </>
        ) : !bookingConfirmed ? (
          <div className="booking-summary">
            <h2 className="booking-subtitle">Confirmar reserva</h2>

            {currentUser && (
              <div className="booking-user-info">
                <h3 className="booking-subtitle">Tus datos</h3>
                <p><strong>Nombre:</strong> {currentUser.firstName} {currentUser.lastName}</p>
                <p><strong>Email:</strong> {currentUser.email}</p>
                {currentUser.address && <p><strong>Dirección:</strong> {currentUser.address}</p>}
                {currentUser.phone && <p><strong>Teléfono:</strong> {currentUser.phone}</p>}
                {currentUser.city && <p><strong>Localidad:</strong> {currentUser.city}</p>}
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
            >
              Confirmar reserva
            </button>
            <button
              className="booking-back-btn"
              onClick={() => setSelectedPackage(null)}
              style={{ marginTop: '0.5rem' }}
            >
              Cambiar paquete
            </button>
          </div>
        ) : !emailSent ? (
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
                <br />
                Fecha de vuelta: {formatDate(returnDate)}
              </p>
              <div className="email-sending-indicator">
                <div className="spinner-small"></div>
                <p>Enviando confirmación por correo electrónico...</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="booking-success-section">
            <div className="booking-success-header">
              <span className="booking-success-icon">📧</span>
              <h2 className="booking-success-title">¡Correo enviado!</h2>
              <p className="booking-success-details">
                Se envió un correo electrónico a <strong>{emailData?.to}</strong> con todos los detalles de tu reserva.
              </p>
            </div>

            {/* Vista previa del correo enviado */}
            <div className="email-preview">
              <div className="email-preview-header">
                <h3>📨 Vista previa del correo enviado</h3>
              </div>
              <div className="email-preview-content">
                <p><strong>Para:</strong> {emailData?.to}</p>
                <p><strong>Asunto:</strong> {emailData?.subject}</p>
                <hr />
                <p>Hola <strong>{emailData?.userName}</strong>,</p>
                <p>Tu reserva ha sido confirmada exitosamente. A continuación, los detalles:</p>
                
                <div className="email-booking-details">
                  <p><strong>Destino:</strong> {emailData?.destination}</p>
                  <p><strong>Paquete:</strong> {emailData?.packageDescription}</p>
                  <p><strong>Precio:</strong> {emailData?.currency} ${emailData?.price?.toLocaleString('es-AR')}</p>
                  <p><strong>Fecha de ida:</strong> {formatDate(emailData?.departureDate)}</p>
                  <p><strong>Fecha de vuelta:</strong> {formatDate(emailData?.returnDate)}</p>
                  <p><strong>Fecha de reserva:</strong> {formatDateTime(emailData?.bookingDate)}</p>
                </div>

                <hr />
                <p className="email-contact-info">{emailData?.contactInfo}</p>
              </div>
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