import { Box, Typography, Paper } from '@mui/material';
import { useState, useEffect } from 'react';
import FlightForm from '../features/admin/components/FlightForm';
import UserManagement from '../features/admin/components/UserManagement';
import DestinationManagement from '../features/admin/components/DestinationManagement';
import { flightService } from '../services/flightService';
import { categoriaService } from '../services/categoriaService';
import '../styles/AdminPanel.css';

function Admin() {
  const [activeTab, setActiveTab] = useState('vuelos');
  const [isCreating, setIsCreating] = useState(false);
  const [editingFlight, setEditingFlight] = useState(null);
  const [flights, setFlights] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [categories, setCategories] = useState([]);

  const fetchData = async () => {
    try {
      const data = await flightService.obtenerTodos();
      setFlights(data);
      const uniqueDestinations = [...new Set(data.map(f => f.destination).filter(Boolean))];
      setDestinations(uniqueDestinations);
    } catch (error) {
      console.error('Error cargando el catálogo de vuelos en administración:', error);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
    categoriaService.listar()
      .then(data => setCategories(Array.isArray(data) ? data : []))
      .catch(error => console.error('Error cargando categorías desde la API:', error));
  }, []);

  const handleDeleteFlight = async (flightId) => {
    const confirmDelete = window.confirm('¿Está completamente seguro de que desea eliminar este paquete turístico del sistema?');
    if (!confirmDelete) return;

    try {
      await flightService.eliminar(flightId);
      alert('Paquete turístico eliminado con éxito del servidor.');
      const updatedFlights = flights.filter(f => f.id !== flightId);
      setFlights(updatedFlights);
      const uniqueDest = [...new Set(updatedFlights.map(f => f.destination).filter(Boolean))];
      setDestinations(uniqueDest);
    } catch (error) {
      alert(error.message || 'Error crítico de red al intentar conectar con el backend.');
    }
  };

  const handleSuccess = () => {
    setIsCreating(false);
    setEditingFlight(null);
    fetchData();
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
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.nombre.toLowerCase()}>{cat.nombre}</option>
                      ))}
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
                        <th style={{ padding: '0.75rem', textAlign: 'center' }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredFlights.length === 0 ? (
                        <tr>
                          <td colSpan="5" style={{ padding: '2.5rem', textAlign: 'center', color: '#b0bec5', fontSize: '0.95rem', fontStyle: 'italic', background: 'rgba(255,255,255,0.01)' }}>
                            ⚠️ No se encontraron paquetes turísticos registrados en la categoría "{selectedCategory}".
                          </td>
                        </tr>
                      ) : (
                        filteredFlights.map((flight) => (
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
                        ))
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
