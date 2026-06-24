import { useState } from 'react';
import '../../../styles/CharacteristicsFilter.css';

function CharacteristicsFilter({ selectedIds, onToggleCharacteristic }) {
  const [availableChars] = useState(() => {
    const data = localStorage.getItem('vuelafacil_characteristics');
    return data ? JSON.parse(data) : [];
  });

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
              <span>{char.icon}</span> {char.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default CharacteristicsFilter;