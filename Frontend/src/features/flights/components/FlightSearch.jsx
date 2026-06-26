import { useState } from 'react';
import '../../../styles/FlightSearch.css';
import bannerImage from '../../../assets/images/banner.png';
import { MOCK_CITIES } from '../utils/mockCities';

const passengerOptions = [1, 2, 3, 4, 5, 6, 7, 8];

function FlightSearch({ onSearch }) {
  const [searchParams, setSearchParams] = useState({
    origin: '',
    destination: '',
    departureDate: '',
    returnDate: '',
    passengers: 1,
  });

  const [activeField, setActiveField] = useState(null);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({ ...prev, [name]: value }));
    setHighlightedIndex(-1);

    if (name === 'origin' || name === 'destination') {
      if (value.length >= 2) {
        const filtered = MOCK_CITIES.filter(city => 
          city.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredOptions(filtered);
        setActiveField(name);
      } else {
        setFilteredOptions([]);
        setActiveField(null);
      }
    }
  };

  const handleSelectSuggestion = (name, value) => {
    setSearchParams((prev) => ({ ...prev, [name]: value }));
    setFilteredOptions([]);
    setActiveField(null);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e, fieldName) => {
    if (activeField === fieldName && filteredOptions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedIndex((prev) => 
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex((prev) => 
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
      } else if (e.key === 'Enter') {
        if (highlightedIndex >= 0) {
          e.preventDefault();
          handleSelectSuggestion(fieldName, filteredOptions[highlightedIndex]);
        }
      } else if (e.key === 'Tab') {
        if (highlightedIndex >= 0) {
          handleSelectSuggestion(fieldName, filteredOptions[highlightedIndex]);
        }
      } else if (e.key === 'Escape') {
        setActiveField(null);
        setHighlightedIndex(-1);
      }
    }
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
                onKeyDown={(e) => handleKeyDown(e, 'origin')}
                onBlur={() => setTimeout(() => setActiveField(null), 200)}
                placeholder="Ej. Buenos Aires"
                autoComplete="off"
                required
              />
              {activeField === 'origin' && filteredOptions.length > 0 && (
                <ul className="suggestions-list">
                  {filteredOptions.map((city, index) => (
                    <li 
                      key={index} 
                      className={`suggestion-item ${index === highlightedIndex ? 'suggestion-item--highlighted' : ''}`}
                      onClick={() => handleSelectSuggestion('origin', city)}
                    >
                      {city}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flight-search-field-wrapper">
              <label className="flight-search-label">Destino *</label>
              <input
                className="flight-input flight-search-input"
                name="destination"
                value={searchParams.destination}
                onChange={handleChange}
                onKeyDown={(e) => handleKeyDown(e, 'destination')}
                onBlur={() => setTimeout(() => setActiveField(null), 200)}
                placeholder="Ej. Madrid"
                autoComplete="off"
                required
              />
              {activeField === 'destination' && filteredOptions.length > 0 && (
                <ul className="suggestions-list">
                  {filteredOptions.map((city, index) => (
                    <li 
                      key={index} 
                      className={`suggestion-item ${index === highlightedIndex ? 'suggestion-item--highlighted' : ''}`}
                      onClick={() => handleSelectSuggestion('destination', city)}
                    >
                      {city}
                    </li>
                  ))}
                </ul>
              )}
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