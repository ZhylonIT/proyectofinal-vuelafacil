import { useState, useEffect } from "react";
import "../../../styles/AvailabilityCalendar.css";

function AvailabilityCalendar({ destination, onBooking }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [prevDestination, setPrevDestination] = useState(destination);
  const [selectedDeparture, setSelectedDeparture] = useState(null);
  const [selectedReturn, setSelectedReturn] = useState(null);

  if (destination !== prevDestination) {
    setPrevDestination(destination);
    setLoading(true);
    setError(false);
    setSelectedDeparture(null);
    setSelectedReturn(null);
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
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
    );
  };

  const prevMonth = () => {
    const today = new Date();
    if (
      currentDate.getFullYear() > today.getFullYear() ||
      (currentDate.getFullYear() === today.getFullYear() &&
        currentDate.getMonth() > today.getMonth())
    ) {
      setCurrentDate(
        new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
      );
    }
  };

  const handleDayClick = (day, monthOffset) => {
    const selectedDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + monthOffset,
      day,
    );
    const iso = selectedDate.toISOString().split("T")[0];
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
    const dateStr = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + monthOffset,
      day,
    )
      .toISOString()
      .split("T")[0];
    return dateStr === selectedDeparture || dateStr === selectedReturn;
  };

  const handleReserve = () => {
    if (selectedDeparture && selectedReturn && onBooking) {
      onBooking(selectedDeparture, selectedReturn);
    }
  };

  const renderMonth = (dateOffset) => {
    const targetDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + dateOffset,
      1,
    );
    const month = targetDate.getMonth();
    const year = targetDate.getFullYear();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const monthName = targetDate.toLocaleDateString("es-ES", {
      month: "long",
      year: "numeric",
    });
    const days = [];
    const weekDays = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const isUnavailable = (d % 2 === 0 && d < 15) || d === 22 || d === 23;
      const selected = isSelected(d, dateOffset);
      const dayClass = isUnavailable
        ? "calendar-day unavailable"
        : `calendar-day available ${selected ? "selected" : ""}`;

      days.push(
        <div
          key={d}
          className={dayClass}
          title={
            isUnavailable
              ? "Sin disponibilidad"
              : selected
                ? "Seleccionado"
                : "Disponible"
          }
          onClick={() => !isUnavailable && handleDayClick(d, dateOffset)}
        >
          {d}
        </div>,
      );
    }

    return (
      <div className="calendar-month-block">
        <h4 className="calendar-month-title">{monthName}</h4>
        <div className="calendar-weekdays">
          {weekDays.map((wd) => (
            <div key={wd} className="weekday-label">
              {wd}
            </div>
          ))}
        </div>
        <div className="calendar-grid">{days}</div>
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
        <p className="error-text">
          ⚠️ No se pudo establecer conexión con el sistema de reservas.
        </p>
        <button className="retry-btn" onClick={handleRetry}>
          Volver a intentar
        </button>
      </div>
    );
  }

  return (
    <div className="availability-container">
      <div className="availability-header">
        <h3 className="availability-title">Fechas de Salida Disponibles</h3>
        <div className="calendar-controls">
          <button className="control-btn" onClick={prevMonth}>
            ←
          </button>
          <button className="control-btn" onClick={nextMonth}>
            →
          </button>
        </div>
      </div>

      <div className="calendar-wrapper">
        {renderMonth(0)}
        <div className="desktop-only-month">{renderMonth(1)}</div>
      </div>

      <div className="calendar-legend">
        <div className="legend-item">
          <span className="legend-color available"></span> Disponible
        </div>
        <div className="legend-item">
          <span className="legend-color unavailable"></span> Agotado
        </div>
        <div className="legend-item">
          <span className="legend-color selected"></span> Seleccionado
        </div>
      </div>

      {selectedDeparture && (
        <div className="selected-dates-summary">
          <p>
            Ida:{" "}
            <strong>
              {new Date(selectedDeparture + "T00:00:00").toLocaleDateString(
                "es-AR",
              )}
            </strong>
          </p>
          {selectedReturn && (
            <p>
              Vuelta:{" "}
              <strong>
                {new Date(selectedReturn + "T00:00:00").toLocaleDateString(
                  "es-AR",
                )}
              </strong>
            </p>
          )}
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
