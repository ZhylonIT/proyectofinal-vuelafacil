import { useState } from 'react';
import '../../../styles/FlightSearch.css';
import bannerImage from '../../../assets/images/banner.png';

const passengerOptions = [1, 2, 3, 4, 5, 6, 7, 8];

function FlightSearch({ onSearch }) {
  const [searchParams, setSearchParams] = useState({
    origin: '',
    destination: '',
    departureDate: '',
    returnDate: '',
    passengers: 1,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Ejecutando búsqueda con:', searchParams);
    if (typeof onSearch === 'function') {
      onSearch(searchParams);
    }
  };

  return (
    <section 
      className="flight-search-section"
      style={{
        backgroundImage: `url(${bannerImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        borderRadius: '12px',
        padding: '2rem 0'
      }}
    >
      <div className="flight-search-paper">
        <h2 className="flight-search-title">Busca tu próximo viaje</h2>
        <h2 className="flight-search-subtitle">¡Así de fácil!</h2>

        <form onSubmit={handleSearch}>
          <div className="flight-search-grid">

            <div className="flight-search-field-wrapper">
              <label className="flight-search-label">Origen *</label>
              <input
                className="flight-input flight-search-input"
                name="origin"
                value={searchParams.origin}
                onChange={handleChange}
                placeholder="Ej. Buenos Aires"
                required
              />
            </div>

            <div className="flight-search-field-wrapper">
              <label className="flight-search-label">Destino *</label>
              <input
                className="flight-input flight-search-input"
                name="destination"
                value={searchParams.destination}
                onChange={handleChange}
                placeholder="Ej. Madrid"
                required
              />
            </div>

            <div className="flight-search-field-wrapper">
              <label className="flight-search-label">Fecha de Ida *</label>
              <input
                className="flight-input flight-search-input"
                type="date"
                name="departureDate"
                value={searchParams.departureDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="flight-search-field-wrapper">
              <label className="flight-search-label">Fecha de Vuelta</label>
              <input
                className="flight-input flight-search-input"
                type="date"
                name="returnDate"
                value={searchParams.returnDate}
                onChange={handleChange}
              />
            </div>

            <div className="flight-search-field-wrapper">
              <label className="flight-search-label">Pasajeros *</label>
              <select
                className="flight-input flight-search-input"
                name="passengers"
                value={searchParams.passengers}
                onChange={handleChange}
              >
                {passengerOptions.map((option) => (
                  <option key={option} value={option}>
                    {option} {option === 1 ? 'Pasajero' : 'Pasajeros'}
                  </option>
                ))}
              </select>
            </div>

          </div>

          <div className="flight-search-button-row">
            <button type="submit" className="flight-search-button">
              Buscar Vuelos
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default FlightSearch;