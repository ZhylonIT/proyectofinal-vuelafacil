import { useState, useEffect } from 'react';
import '../../../styles/AdminPanel.css';

const TRAVEL_EMOJIS = [
  '✈️', '🌴', '🏖️', '🏔️', '🏙️', '🏕️', '🚢', '🏨', 
  '🍽️', '🏊', '💆', '📶', '👨‍👩‍👧‍👦', '🧗', '🚗', '🚌', 
  '❄️', '☀️', '📸', '🎒', '🧳', '🗺️', '🎟️', '🎭', 
  '🍷', '🐾', '♿', '🔥', '🛏️', '🚲'
];

const INITIAL_CHARACTERISTICS = [
  { id: 'char-1', name: 'Apto Familia', icon: '👨‍👩‍👧‍👦' },
  { id: 'char-2', name: 'Aventura Extrema', icon: '🧗' },
  { id: 'char-3', name: 'Relajación Total', icon: '💆' },
  { id: 'char-4', name: 'Wifi', icon: '📶' }
];

function DestinationManagement({ extractedDestinations = [], flights = [] }) {
  const [characteristics, setCharacteristics] = useState(() => {
    const saved = localStorage.getItem('vuelafacil_characteristics');
    return saved ? JSON.parse(saved) : INITIAL_CHARACTERISTICS;
  });

  const [destinationDetails, setDestinationDetails] = useState(() => {
    const saved = localStorage.getItem('vuelafacil_destination_details');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('vuelafacil_characteristics', JSON.stringify(characteristics));
  }, [characteristics]);

  useEffect(() => {
    localStorage.setItem('vuelafacil_destination_details', JSON.stringify(destinationDetails));
  }, [destinationDetails]);

  const [isCharModalOpen, setIsCharModalOpen] = useState(false);
  const [isDestModalOpen, setIsDestModalOpen] = useState(false);
  const [editingDestName, setEditingDestName] = useState('');  
  const [charForm, setCharForm] = useState({ id: '', name: '', icon: '' });
  const [isEditingChar, setIsEditingChar] = useState(false);    
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Formulario de Edición de Destino
  const [destForm, setDestForm] = useState({ description: '', characteristics: [] });  
  const handleSaveCharacteristic = (e) => {
    e.preventDefault();
    if (!charForm.name.trim() || !charForm.icon.trim()) {
      alert("Por favor, ingrese un nombre y seleccione un ícono.");
      return;
    }

    if (isEditingChar) {
      setCharacteristics(prev => prev.map(c => c.id === charForm.id ? charForm : c));
    } else {
      const newChar = { ...charForm, id: `char-${Date.now()}` };
      setCharacteristics(prev => [...prev, newChar]);
    }
    setCharForm({ id: '', name: '', icon: '' });
    setIsEditingChar(false);
    setShowEmojiPicker(false);
  };

  const handleEditChar = (char) => {
    setCharForm(char);
    setIsEditingChar(true);
    setShowEmojiPicker(false);
  };

  const handleDeleteChar = (charId) => {
    if (window.confirm("¿Eliminar esta característica? Se removerá de los destinos asociados.")) {
      setCharacteristics(prev => prev.filter(c => c.id !== charId));      
      const updatedDestinations = { ...destinationDetails };
      Object.keys(updatedDestinations).forEach(dest => {
        if (updatedDestinations[dest].characteristics) {
          updatedDestinations[dest].characteristics = updatedDestinations[dest].characteristics.filter(id => id !== charId);
        }
      });
      setDestinationDetails(updatedDestinations);
    }
  };

  // Edicion de destinos
  const openDestModal = (destName) => {
    setEditingDestName(destName);
    const existingData = destinationDetails[destName] || { description: '', characteristics: [] };
    setDestForm({
      description: existingData.description || '',
      characteristics: existingData.characteristics || []
    });
    setIsDestModalOpen(true);
  };

  const handleToggleDestChar = (charId) => {
    setDestForm(prev => {
      const isSelected = prev.characteristics.includes(charId);
      if (isSelected) {
        return { ...prev, characteristics: prev.characteristics.filter(id => id !== charId) };
      } else {
        return { ...prev, characteristics: [...prev.characteristics, charId] };
      }
    });
  };

  const handleSaveDestination = (e) => {
    e.preventDefault();
    setDestinationDetails(prev => ({
      ...prev,
      [editingDestName]: {
        description: destForm.description,
        characteristics: destForm.characteristics
      }
    }));
    setIsDestModalOpen(false);
  };

  return (
    <div className="glass-form-panel">
      <div className="admin-header-actions" style={{ marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
        <div>
          <h3 style={{ margin: 0, color: '#8ab4f8' }}>Destinos en Catálogo ({extractedDestinations.length})</h3>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#b0bec5', marginTop: '0.25rem' }}>
            Auditoría de información y características de producto.
          </p>
        </div>
        <button className="btn-secondary" onClick={() => setIsCharModalOpen(true)}>
          ⚙️ Administrar Características Globales
        </button>
      </div>

      <div className="destinations-grid">
        {extractedDestinations.map((dest, idx) => {
          const destData = destinationDetails[dest];
          const isMissingInfo = !destData || !destData.description.trim() || !destData.characteristics || destData.characteristics.length === 0;

          return (
            <div key={idx} className={`destination-card ${isMissingInfo ? 'warning-border' : ''}`}>
              <div className="destination-card-header">
                <strong>{dest}</strong>
                <span className="flight-count-badge">
                  {flights.filter(f => f.destination === dest).length} Paquetes
                </span>
              </div>
              
              <div className="destination-card-body">
                {isMissingInfo ? (
                  <div className="warning-badge">
                    ⚠️ Requiere actualizar información y características.
                  </div>
                ) : (
                  <div className="success-badge">
                    ✅ Información completa ({destData.characteristics.length} características)
                  </div>
                )}
              </div>

              <div className="destination-card-footer">
                <button className="btn-primary btn-sm" onClick={() => openDestModal(dest)} style={{ width: '100%' }}>
                  ✏️ Editar Información
                </button>
              </div>
            </div>
          );
        })}
      </div>

{/* Gestión de Características Globales */}
      {isCharModalOpen && (
        <div className="glass-modal-overlay">
          <div className="glass-modal-content">
            <div className="form-header">
              <h2 style={{ margin: 0, color: '#ffffff', fontSize: '1.4rem' }}>Administrar Características</h2>
              <button className="btn-danger" onClick={() => { setIsCharModalOpen(false); setIsEditingChar(false); setCharForm({ id: '', name: '', icon: '' }); setShowEmojiPicker(false); }}>X</button>
            </div>
            
            {/* Formulario Añadir/Editar */}
            <form onSubmit={handleSaveCharacteristic} className="char-form" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', marginBottom: '2rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Nombre de Característica</label>
                <input 
                  type="text" className="form-input" required placeholder="Ej: Pileta Climatizada"
                  value={charForm.name} onChange={e => setCharForm({...charForm, name: e.target.value})}
                />
              </div>

              {/* SELECTOR DE EMOJIS */}
              <div className="form-group" style={{ width: '120px', position: 'relative' }}>
                <label className="form-label">Ícono</label>
                <button 
                  type="button" 
                  className="form-input" 
                  style={{ height: '48px', fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                >
                  {charForm.icon || '➕'}
                </button>

                {showEmojiPicker && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, marginTop: '0.5rem',
                    background: 'rgba(1, 20, 59, 0.98)', backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px',
                    padding: '0.75rem', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)',
                    gap: '0.4rem', zIndex: 100, boxShadow: '0 8px 32px rgba(0,0,0,0.5)', width: 'max-content'
                  }}>
                    {TRAVEL_EMOJIS.map(emoji => (
                      <span
                        key={emoji}
                        onClick={() => {
                          setCharForm({ ...charForm, icon: emoji });
                          setShowEmojiPicker(false);
                        }}
                        style={{
                          cursor: 'pointer', fontSize: '1.4rem', padding: '0.3rem', 
                          textAlign: 'center', borderRadius: '4px', transition: 'background 0.2s',
                          background: charForm.icon === emoji ? 'rgba(2, 136, 209, 0.4)' : 'transparent'
                        }}
                        onMouseOver={(e) => { if(charForm.icon !== emoji) e.target.style.background = 'rgba(255,255,255,0.1)' }}
                        onMouseOut={(e) => { if(charForm.icon !== emoji) e.target.style.background = 'transparent' }}
                      >
                        {emoji}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <button type="submit" className="btn-primary" style={{ height: '48px' }}>
                {isEditingChar ? 'Actualizar' : '+ Añadir'}
              </button>
              {isEditingChar && (
                <button type="button" className="btn-secondary" onClick={() => { setIsEditingChar(false); setCharForm({ id: '', name: '', icon: '' }); setShowEmojiPicker(false); }} style={{ height: '48px' }}>
                  Cancelar
                </button>
              )}
            </form>

            {/* Listado de Características Registradas */}
            <div className="char-list">
              <h4 style={{ color: '#8ab4f8', marginBottom: '1rem' }}>Listado Registrado ({characteristics.length})</h4>
              {characteristics.length === 0 ? (
                <p style={{ color: '#b0bec5', fontStyle: 'italic' }}>No hay características registradas.</p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {characteristics.map(char => (
                    <li key={char.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '0.75rem 1rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <span style={{ fontSize: '1.1rem', color: '#fff' }}>{char.icon} {char.name}</span>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn-secondary btn-sm" onClick={() => handleEditChar(char)}>Editar</button>
                        <button className="btn-danger btn-sm" onClick={() => handleDeleteChar(char.id)}>Eliminar</button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* EDICIÓN ESPECÍFICA DEL DESTINO --- */}
      {isDestModalOpen && (
        <div className="glass-modal-overlay">
          <div className="glass-modal-content" style={{ maxWidth: '600px' }}>
            <div className="form-header" style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, color: '#ffffff', fontSize: '1.4rem' }}>
                Configurar Destino: <span style={{ color: '#8ab4f8' }}>{editingDestName}</span>
              </h2>
              <button className="btn-danger" onClick={() => setIsDestModalOpen(false)}>X</button>
            </div>

            <form onSubmit={handleSaveDestination}>
              <div className="form-group full-width" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Descripción General del Destino</label>
                <textarea
                  className="form-textarea" rows="3" required
                  placeholder="Ingrese una descripción atractiva para este destino..."
                  value={destForm.description}
                  onChange={e => setDestForm({...destForm, description: e.target.value})}
                />
              </div>

              <div className="form-group full-width" style={{ marginBottom: '2rem' }}>
                <label className="form-label">Asociar Características (Selección Múltiple)</label>
                {characteristics.length === 0 ? (
                  <div className="warning-badge" style={{ marginTop: '0.5rem' }}>
                    No hay características globales creadas. Cierre este panel y créelas primero.
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem', marginTop: '0.75rem' }}>
                    {characteristics.map(char => {
                      const isSelected = destForm.characteristics.includes(char.id);
                      return (
                        <div 
                          key={char.id} 
                          onClick={() => handleToggleDestChar(char.id)}
                          style={{ 
                            background: isSelected ? 'rgba(2, 136, 209, 0.2)' : 'rgba(255,255,255,0.05)', 
                            border: isSelected ? '1px solid #0288d1' : '1px solid rgba(255,255,255,0.1)',
                            padding: '0.75rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s'
                          }}
                        >
                          <input type="checkbox" checked={isSelected} readOnly style={{ cursor: 'pointer' }} />
                          <span style={{ color: isSelected ? '#fff' : '#b0bec5' }}>{char.icon} {char.name}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="form-actions-footer" style={{ marginTop: 0 }}>
                <button type="button" className="btn-secondary" onClick={() => setIsDestModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn-primary">Guardar Información</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DestinationManagement;