import { Box, Typography, Paper } from '@mui/material';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FlightForm from '../features/admin/components/FlightForm';
import UserManagement from '../features/admin/components/UserManagement';
import DestinationManagement from '../features/admin/components/DestinationManagement';
import '../styles/AdminPanel.css';
import RioImage from '../assets/images/rio.jpg';
import MadridImage from '../assets/images/madrid.jpg';
import CancunImage from '../assets/images/cancun.jpg';
import MendozaImage from '../assets/images/mendoza.jpg';
import NewYorkImage from '../assets/images/ny.jpg';
import UshuaiaImage from '../assets/images/ushuaia.jpg';
import MiamiImage from '../assets/images/miami.jpg';
import IguazuImage from '../assets/images/iguazu.jpg';

const INITIAL_MOCK_FLIGHTS = [
  { id: 'mock-2', destination: 'Río de Janeiro', description: 'Playas paradisíacas, el Cristo Redentor y una cultura vibrante todo el año.', category: 'playa', price: 380000, currency: 'ARS', images: [RioImage] },
  { id: 'mock-3', destination: 'Madrid', description: 'Arte, cultura, gastronomía e historia en el corazón de España.', category: 'ciudad', price: 950000, currency: 'ARS', images: [MadridImage] },
  { id: 'mock-4', destination: 'Cancún', description: 'Aguas turquesas, arena blanca y la mística de la cultura Maya.', category: 'playa', price: 520000, currency: 'ARS', images: [CancunImage] },
  { id: 'mock-5', destination: 'Mendoza', description: 'Recorridos por las mejores bodegas al pie de la imponente cordillera.', category: 'montaña', price: 140000, currency: 'ARS', images: [MendozaImage] },
  { id: 'mock-6', destination: 'Nueva York', description: 'La ciudad que nunca duerme: rascacielos imponentes, Broadway y Central Park.', category: 'ciudad', price: 890000, currency: 'ARS', images: [NewYorkImage] },
  { id: 'mock-7', destination: 'Ushuaia', description: 'Explorá el Fin del Mundo con sus glaciares majestuosos y paisajes de película.', category: 'montaña', price: 160000, currency: 'ARS', images: [UshuaiaImage] },
  { id: 'mock-8', destination: 'Miami', description: 'Compras, playas de diseño vanguardista y una vida nocturna inigualable.', category: 'playa', price: 720000, currency: 'ARS', images: [MiamiImage] },
  { id: 'mock-10', destination: 'Cataratas del Iguazú', description: 'Siente la fuerza indomable de una de las maravillas naturales del mundo.', category: 'naturaleza', price: 110000, currency: 'ARS', images: [IguazuImage] }
];

function Admin() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('vuelos');  
  const [hasAccess] = useState(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return isLoggedIn && user.role === 'admin';
  });

  const [isCreating, setIsCreating] = useState(false);
  const [editingFlight, setEditingFlight] = useState(null);
  const [flights, setFlights] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('todos');

  useEffect(() => {
    if (!hasAccess) return;

    let isMounted = true; 

    const fetchData = async () => {
      try {
        const response = await fetch('/api/vuelos');
        let backendData = [];
        
        if (response.ok) {
          backendData = await response.json();
        }
        
        const combinedData = [...backendData, ...INITIAL_MOCK_FLIGHTS];
        
        const uniqueFlights = [];
        const seenDestinations = new Set();

        combinedData.forEach(flight => {
          if (flight && flight.destination) {
            const normalizedDest = flight.destination.trim().toLowerCase();
            if (!seenDestinations.has(normalizedDest)) {
              seenDestinations.add(normalizedDest);
              uniqueFlights.push(flight);
            }
          }
        });

        if (isMounted) {
          setFlights(uniqueFlights);
          const uniqueDestinations = [...new Set(uniqueFlights.map(f => f.destination).filter(Boolean))];
          setDestinations(uniqueDestinations);
        }
      } catch (error) {
        console.error("Error cargando catálogo unificado en administración:", error);
        if (isMounted) {
          setFlights(INITIAL_MOCK_FLIGHTS);
          const uniqueDestinations = [...new Set(INITIAL_MOCK_FLIGHTS.map(f => f.destination).filter(Boolean))];
          setDestinations(uniqueDestinations);
        }
      }
    };

    fetchData();

    return () => { isMounted = false; };
  }, [hasAccess]); 

  if (!hasAccess) {
    return (
      <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #243A69 0%, #01143b 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Paper elevation={4} sx={{ p: 5, bgcolor: 'rgba(255,255,255,0.95)', borderRadius: 4, textAlign: 'center', maxWidth: 450 }}>
          <Typography variant="h4" color="error" sx={{ fontWeight: 'bold', mb: 2, fontFamily: 'Poppins' }}>Acceso Denegado</Typography>
          <Typography variant="body1" sx={{ color: '#4A5568', mb: 4, fontFamily: 'Poppins' }}>
            Tu cuenta no posee los privilegios de Administrador necesarios para acceder al Panel de Control de Vuela Fácil.
          </Typography>
          <button className="btn-primary" onClick={() => navigate('/')}>Volver al Inicio</button>
        </Paper>
      </Box>
    );
  }

  const handleDeleteFlight = async (flightId) => {
    const confirmDelete = window.confirm("¿Está completamente seguro de que desea eliminar este paquete turístico del sistema?");
    if (!confirmDelete) return;

    if (String(flightId).startsWith('mock-')) {
      const updatedFlights = flights.filter(f => f.id !== flightId);
      setFlights(updatedFlights);
      const uniqueDest = [...new Set(updatedFlights.map(f => f.destination).filter(Boolean))];
      setDestinations(uniqueDest);
      alert("Paquete de respaldo removido localmente para esta sesión.");
    } else {
      try {
        const response = await fetch(`/api/vuelos/${flightId}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          alert("Paquete turístico eliminado con éxito del servidor.");
          const updatedFlights = flights.filter(f => f.id !== flightId);
          setFlights(updatedFlights);
          const uniqueDest = [...new Set(updatedFlights.map(f => f.destination).filter(Boolean))];
          setDestinations(uniqueDest);
        } else {
          alert("Error: No se pudo eliminar el paquete del servidor central.");
        }
      } catch (error) {
        console.error("Error de conexión al procesar borrado:", error);
        alert("Error crítico de red al intentar conectar con el backend.");
      }
    }
  };

  const handleSuccess = (updatedPayload = null, mockId = null) => {
    if (mockId && updatedPayload) {
      const updatedFlights = flights.map(f => f.id === mockId ? { ...f, ...updatedPayload } : f);
      setFlights(updatedFlights);
      const uniqueDest = [...new Set(updatedFlights.map(f => f.destination).filter(Boolean))];
      setDestinations(uniqueDest);
      setEditingFlight(null);
      alert("Paquete de respaldo actualizado localmente con éxito.");
    } else {
      setIsCreating(false);
      setEditingFlight(null);
      window.location.reload(); 
    }
  };

  const filteredFlights = flights.filter(flight => {
    if (selectedCategory === 'todos') return true;
    return (flight.category || '').toLowerCase() === selectedCategory.toLowerCase();
  });

  return (
    <Box sx={{ py: 4, minHeight: '100vh', background: 'linear-gradient(135deg, #243A69 0%, #01143b 100%)' }}>
      
      <Box sx={{ display: { xs: 'block', md: 'none' }, textAlign: 'center', mt: 4, px: 2 }}>
        <Paper elevation={2} sx={{ p: 4, bgcolor: '#FFF0F0', borderRadius: 2 }}>
          <Typography variant="h6" color="error" sx={{ fontWeight: 'bold', mb: 1 }}>
            Acceso Restringido
          </Typography>
          <Typography variant="body2" color="textSecondary">
            El panel de administración requiere resolución de terminal de escritorio (Modo Senior).
          </Typography>
        </Paper>
      </Box>

      <Box sx={{ display: { xs: 'none', md: 'block' } }} className="admin-container">
        
        {/* NAVEGADOR DE PESTAÑAS */}
        {!isCreating && !editingFlight && (
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid rgba(255,255,255,0.1)' }}>
            <button 
              onClick={() => setActiveTab('vuelos')}
              style={{ 
                background: 'transparent', border: 'none', color: activeTab === 'vuelos' ? '#fff' : '#8ab4f8', 
                fontSize: '1.2rem', fontWeight: 'bold', padding: '10px 20px', cursor: 'pointer',
                borderBottom: activeTab === 'vuelos' ? '3px solid #0288d1' : '3px solid transparent', transition: 'all 0.3s'
              }}
            >
              Gestión de Vuelos
            </button>
            <button 
              onClick={() => setActiveTab('usuarios')}
              style={{ 
                background: 'transparent', border: 'none', color: activeTab === 'usuarios' ? '#fff' : '#8ab4f8', 
                fontSize: '1.2rem', fontWeight: 'bold', padding: '10px 20px', cursor: 'pointer',
                borderBottom: activeTab === 'usuarios' ? '3px solid #0288d1' : '3px solid transparent', transition: 'all 0.3s'
              }}
            >
              Gestión de Usuarios
            </button>
          </div>
        )}

        {activeTab === 'usuarios' && !isCreating && !editingFlight ? (
          <UserManagement />
        ) : (
          !isCreating && !editingFlight ? (
            <>
              <div className="admin-header-actions">
                <div>
                  <h1 className="admin-title">Panel de Administración</h1>
                  <p className="admin-subtitle">Gestión unificada de paquetes de turismo y ofertas de vuelos.</p>
                </div>
                <button className="btn-primary" onClick={() => setIsCreating(true)}>
                  + Agregar paquete turístico
                </button>
              </div>

              <DestinationManagement extractedDestinations={destinations} flights={flights} />

              <div className="glass-form-panel" style={{ marginTop: '2rem' }}>
                <div className="admin-table-header-toolbar">
                  <h3 style={{ margin: 0, color: '#8ab4f8' }}>
                    Control Operativo de Paquetes Activos
                  </h3>
                  <div className="admin-filter-wrapper">
                    <label htmlFor="admin-category-filter" className="admin-filter-label">Filtrar por Categoría:</label>
                    <select
                      id="admin-category-filter"
                      className="form-select admin-filter-select"
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                      <option value="todos">Todas las categorías</option>
                      <option value="playa">Playa</option>
                      <option value="montaña">Montaña</option>
                      <option value="ciudad">Ciudad</option>
                      <option value="historico">Histórico</option>
                      <option value="naturaleza">Naturaleza</option>
                    </select>
                  </div>
                </div>

                <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', color: '#ffffff', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.2)', color: '#b0bec5' }}>
                        <th style={{ padding: '0.75rem' }}>ID Único</th>
                        <th style={{ padding: '0.75rem' }}>Destino Turístico</th>
                        <th style={{ padding: '0.75rem' }}>Categoría</th>
                        <th style={{ padding: '0.75rem' }}>Precio Base</th>
                        <th style={{ padding: '0.75rem' }}>Origen</th>
                        <th style={{ padding: '0.75rem', textAlign: 'center' }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredFlights.length === 0 ? (
                        <tr>
                          <td colSpan="6" style={{ padding: '2.5rem', textAlign: 'center', color: '#b0bec5', fontSize: '0.95rem', fontStyle: 'italic', background: 'rgba(255,255,255,0.01)' }}>
                            ⚠️ No se encontraron paquetes turísticos registrados en la categoría "{selectedCategory}".
                          </td>
                        </tr>
                      ) : (
                        filteredFlights.map((flight) => {
                          const isMock = String(flight.id).startsWith('mock-');
                          return (
                            <tr key={flight.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)' }}>
                              <td style={{ padding: '0.75rem', fontFamily: 'monospace', fontSize: '0.85rem', color: '#8ab4f8' }}>
                                {flight.id}
                              </td>
                              <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>
                                {flight.destination}
                              </td>
                              <td style={{ padding: '0.75rem' }}>
                                <span style={{ textTransform: 'uppercase', fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                                  {flight.category || 'general'}
                                </span>
                              </td>
                              <td style={{ padding: '0.75rem' }}>
                                ${flight.price ? flight.price.toLocaleString('es-AR') : '0'} {flight.currency || 'ARS'}
                              </td>
                              <td style={{ padding: '0.75rem' }}>
                                <span style={{ 
                                  padding: '2px 8px', 
                                  borderRadius: '4px', 
                                  fontSize: '0.75rem', 
                                  background: isMock ? 'rgba(255, 193, 7, 0.15)' : 'rgba(76, 175, 80, 0.15)', 
                                  color: isMock ? '#ffe082' : '#a5d6a7',
                                  border: isMock ? '1px solid rgba(255, 193, 7, 0.3)' : '1px solid rgba(76, 175, 80, 0.3)'
                                }}>
                                  {isMock ? 'Respaldo' : 'Servidor'}
                                </span>
                              </td>
                              <td style={{ padding: '0.75rem', textAlign: 'center', display: 'flex', gap: '0.5rem', justifyContent: 'center', alignItems: 'center' }}>
                                <button 
                                  onClick={() => setEditingFlight(flight)}
                                  style={{ 
                                    background: '#0288d1', 
                                    color: '#ffffff', 
                                    border: 'none', 
                                    padding: '5px 12px', 
                                    borderRadius: '4px', 
                                    cursor: 'pointer',
                                    fontSize: '0.8rem',
                                    fontWeight: 'bold'
                                  }}
                                >
                                  Editar
                                </button>
                                <button 
                                  onClick={() => handleDeleteFlight(flight.id)}
                                  style={{ 
                                    background: '#d32f2f', 
                                    color: '#ffffff', 
                                    border: 'none', 
                                    padding: '5px 10px', 
                                    borderRadius: '4px', 
                                    cursor: 'pointer',
                                    fontSize: '0.8rem',
                                    fontWeight: 'bold'
                                  }}
                                >
                                  Eliminar
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="admin-header-actions">
                <h1 className="admin-title">
                  {isCreating ? 'Registrar Nuevo paquete turístico' : 'Modificar Paquete Turístico'}
                </h1>
              </div>
              <FlightForm 
                existingDestinations={destinations}
                flightToEdit={editingFlight}
                onCancel={() => {
                  setIsCreating(false);
                  setEditingFlight(null);
                }}
                onSuccess={handleSuccess}
              />
            </>
          )
        )}
      </Box>
    </Box>
  );
}

export default Admin;