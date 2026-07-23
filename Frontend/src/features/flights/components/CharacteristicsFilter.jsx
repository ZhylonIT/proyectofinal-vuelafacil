import { useState, useEffect } from 'react';
import { caracteristicaService } from '../../../services/caracteristicaService';
import '../../../styles/CharacteristicsFilter.css';

function CharacteristicsFilter({ selectedIds, onToggleCharacteristic }) {
  const [availableChars, setAvailableChars] = useState([]);

  useEffect(() => {
    caracteristicaService.listar()
      .then(data => setAvailableChars(Array.isArray(data) ? data : []))
      .catch(error => {
        console.error('Error cargando las características desde la API:', error);
        setAvailableChars([]);
      });
  }, []);

  if (availableChars.length === 0) return null;

  return (
    <div className="filter-container">
      <h4 className="filter-title">Filtrar por Características:</h4>
      <div className="filter-grid">
        {availableChars.map(char => {
          const isActive = selectedIds.includes(char.id);
          return (
            <button
              key={char.id}
              onClick={() => onToggleCharacteristic(char.id)}
              className={`filter-chip ${isActive ? 'active' : ''}`}
            >
              <span>{char.icono}</span> {char.nombre}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default CharacteristicsFilter;
