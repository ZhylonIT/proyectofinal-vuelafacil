import { useState, useEffect } from 'react';
import { isDateRangeAvailable } from '../utils/availabilityUtils';
import '../../../styles/AvailabilityCalendar.css';

function AvailabilityCalendar({ destination, onBooking }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [prevDestination, setPrevDestination] = useState(destination);
  const [selectedDeparture, setSelectedDeparture] = useState(null);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [rangeError, setRangeError] = useState('');

  if (destination !== prevDestination) {
    setPrevDestination(destination);
    setLoading(true);
    setError(false);
    setSelectedDeparture(null);
    setSelectedReturn(null);
    setRangeError('');
  }

  useEffect(() => {
    if (!loading) return;
    const timer = setTimeout(() => {
      if (Math.random() < 0.2) {
        setError(true);
      }
      setLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, [loading]);

  const handleRetry = () => {
    setLoading(true);
    setError(false);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    const today = new Date();
    if (currentDate.getFullYear() > today.getFullYear() || 
       (currentDate.getFullYear() === today.getFullYear() && currentDate.getMonth() > today.getMonth())) {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    }
  };

  const isDateUnavailable = (day, monthOffset) => {
    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + monthOffset, day);
    const d = targetDate.getDate();
    return (d % 2 === 0 && d < 15) || d === 22 || d === 23;
  };

  const handleDayClick = (day, monthOffset) => {
    const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + monthOffset, day);
    const iso = selectedDate.toISOString().split('T')[0];
    setRangeError('');

    if (!selectedDeparture) {
      setSelectedDeparture(iso);
      setSelectedReturn(null);
    } else if (!selectedReturn) {
      if (iso > selectedDeparture) {
        setSelectedReturn(iso);
      } else {
        setSelectedDeparture(iso);
        setSelectedReturn(null);
      }
    } else {
      setSelectedDeparture(iso);
      setSelectedReturn(null);
    }
  };

  const isSelected = (day, monthOffset) => {
    const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth() + monthOffset, day).toISOString().split('T')[0];
    return dateStr === selectedDeparture || dateStr === selectedReturn;
  };

  const handleReserve = () => {
    if (!selectedDeparture || !selectedReturn) return;
    if (!isDateRangeAvailable(destination, selectedDeparture, selectedReturn)) {
      setRangeError('El rango seleccionado incluye fechas no disponibles. Por favor, elegí otras fechas.');
      return;
    }
    if (onBooking) {
      onBooking(selectedDeparture, selectedReturn);
    }
  };

  const renderMonth = (dateOffset) => {
    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + dateOffset, 1);
    const month = targetDate.getMonth();
    const year = targetDate.getFullYear();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const monthName = targetDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    const days = [];
    const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const isUnavailable = isDateUnavailable(d, dateOffset);
      const selected = isSelected(d, dateOffset);
      const dayClass = isUnavailable
        ? 'calendar-day unavailable'
        : `calendar-day available ${selected ? 'selected' : ''}`;

      days.push(
        <div
          key={d}
          className={dayClass}
          title={isUnavailable ? 'Sin disponibilidad' : selected ? 'Seleccionado' : 'Disponible'}
          onClick={() => !isUnavailable && handleDayClick(d, dateOffset)}
        >
          {d}
        </div>
      );
    }

    return (
      <div className="calendar-month-block">
        <h4 className="calendar-month-title">{monthName}</h4>
        <div className="calendar-weekdays">
          {weekDays.map(wd => <div key={wd} className="weekday-label">{wd}</div>)}
        </div>
        <div className="calendar-grid">
          {days}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="availability-container status-box">
        <div className="spinner"></div>
        <p>Sincronizando disponibilidad para {destination}...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="availability-container status-box error-box">
        <p className="error-text">⚠️ No se pudo establecer conexión con el sistema de reservas.</p>
        <button className="retry-btn" onClick={handleRetry}>Volver a intentar</button>
      </div>
    );
  }

  return (
    <div className="availability-container">
      <div className="availability-header">
        <h3 className="availability-title">Fechas de Salida Disponibles</h3>
        <div className="calendar-controls">
          <button className="control-btn" onClick={prevMonth}>←</button>
          <button className="control-btn" onClick={nextMonth}>→</button>
        </div>
      </div>
      
      <div className="calendar-wrapper">
        {renderMonth(0)}
        <div className="desktop-only-month">
          {renderMonth(1)}
        </div>
      </div>

      <div className="calendar-legend">
        <div className="legend-item"><span className="legend-color available"></span> Disponible</div>
        <div className="legend-item"><span className="legend-color unavailable"></span> Agotado</div>
        <div className="legend-item"><span className="legend-color selected"></span> Seleccionado</div>
      </div>

      {selectedDeparture && (
        <div className="selected-dates-summary">
          <p>Ida: <strong>{new Date(selectedDeparture + 'T00:00:00').toLocaleDateString('es-AR')}</strong></p>
          {selectedReturn && <p>Vuelta: <strong>{new Date(selectedReturn + 'T00:00:00').toLocaleDateString('es-AR')}</strong></p>}
        </div>
      )}

      {rangeError && (
        <div className="calendar-range-error" role="alert">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="currentColor"/>
          </svg>
          <span>{rangeError}</span>
        </div>
      )}

      <button
        className="reserve-package-btn"
        disabled={!selectedDeparture || !selectedReturn}
        onClick={handleReserve}
      >
        Reservar paquete
      </button>
    </div>
  );
}

export default AvailabilityCalendar;