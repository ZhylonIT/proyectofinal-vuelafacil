import ReviewSection from './ReviewSection';
import '../../../styles/BookingConfirmationModal.css'

function BookingConfirmationModal({ flight, departureDate, returnDate, onClose }) {
    if (!flight) return null;

    const formatDate = (isoString) => {
        if (!isoString) return '';
    const date = new Date(isoString);
        return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
    };

return (
    <div className="booking-modal-overlay" onClick={onClose}>
      <div className="booking-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="booking-modal-close" onClick={onClose} aria-label="Cerrar">
          ✕
        </button>

        <div className="booking-success-header">
          <span className="booking-success-icon">✅</span>
          <h2 className="booking-success-title">¡Paquete reservado con éxito!</h2>
          <p className="booking-success-details">
            Destino: <strong>{flight.destination}</strong>
            {departureDate && (
              <>
                <br />
                Fecha de ida: {formatDate(departureDate)}
              </>
            )}
            {returnDate && (
              <>
                <br />
                Fecha de vuelta: {formatDate(returnDate)}
              </>
            )}
          </p>
        </div>

        <div className="booking-review-wrapper">
          <ReviewSection productId={flight.id} destination={flight.destination} />
        </div>
      </div>
    </div>
  );
}

export default BookingConfirmationModal;