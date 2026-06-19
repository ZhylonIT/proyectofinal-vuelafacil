import { Box, Typography, Paper } from '@mui/material';
import { useState, useEffect } from 'react';
import FlightForm from '../features/admin/components/FlightForm';
import '../styles/AdminPanel.css';

// Importación de imágenes institucionales para coincidir exactamente con FlightRecommendations
import RioImage from '../assets/images/rio.jpg';
import MadridImage from '../assets/images/madrid.jpg';
import CancunImage from '../assets/images/cancun.jpg';
import MendozaImage from '../assets/images/mendoza.jpg';
import NewYorkImage from '../assets/images/ny.jpg';
import UshuaiaImage from '../assets/images/ushuaia.jpg';
import MiamiImage from '../assets/images/miami.jpg';
import IguazuImage from '../assets/images/iguazu.jpg';

// Catálogo inmutable de respaldo integrado en el flujo de administración corporativa
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
  const [isCreating, setIsCreating] = useState(false);
  const [flights, setFlights] = useState([]);
  const [destinations, setDestinations] = useState([]);

  useEffect(() => {
    let isMounted = true; 

    const fetchData = async () => {
      try {
        const response = await fetch('/api/vuelos');
        let backendData = [];
        
        if (response.ok) {
          backendData = await response.json();
        }
        
        // Estrategia de unificación senior idéntica a FlightRecommendations (Precedencia Backend)
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
  }, []); 

  // Función básica crítica corporativa: Eliminación de paquetes turísticos
  const handleDeleteFlight = async (flightId) => {
    const confirmDelete = window.confirm("¿Está completamente seguro de que desea eliminar este paquete turístico del sistema?");
    if (!confirmDelete) return;

    if (String(flightId).startsWith('mock-')) {
      // Simulación de remoción local para mantener consistencia visual en sesión
      const updatedFlights = flights.filter(f => f.id !== flightId);
      setFlights(updatedFlights);
      const uniqueDest = [...new Set(updatedFlights.map(f => f.destination).filter(Boolean))];
      setDestinations(uniqueDest);
      alert("Paquete de respaldo removido localmente para esta sesión.");
    } else {
      // Operación CRUD real hacia la persistencia del Backend Spring Boot
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

  const handleSuccess = () => {
    setIsCreating(false);
    window.location.reload(); 
  };

  return (
    <Box sx={{ py: 4, minHeight: '100vh', background: 'linear-gradient(135deg, #243A69 0%, #01143b 100%)' }}>
      
      {/* MANTENIMIENTO MANDATORIO DE NO RESPONSIVIDAD: BLOQUEO EN ESCRITORIOS CHICOS / MÓVILES */}
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

      {/* CONTENEDOR EXCLUSIVO PARA RESOLUCIONES DE ESCRITORIO DE ACUERDO A LA REGLA DE NO-RESPONSIVIDAD */}
      <Box sx={{ display: { xs: 'none', md: 'block' } }} className="admin-container">
        {!isCreating ? (
          <>
            <div className="admin-header-actions">
              <div>
                <h1 className="admin-title">Panel de Administración</h1>
                <p className="admin-subtitle">Gestión unificada de paquetes de turismo y ofertas de vuelos.</p>
              </div>
              <button className="btn-primary" onClick={() => setIsCreating(true)}>
                + Agregar destino
              </button>
            </div>

            {/* Módulo de Resumen de Destinos */}
            <div className="glass-form-panel">
              <h3 style={{ marginTop: 0, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', color: '#8ab4f8' }}>
                Destinos Consolidados en Catálogo ({destinations.length})
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                {destinations.map((dest, idx) => (
                  <div key={idx} style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
                    <strong style={{ fontSize: '1.1rem', color: '#ffffff' }}>{dest}</strong>
                    <div style={{ fontSize: '0.85rem', color: '#b0bec5', marginTop: '0.5rem' }}>
                      {flights.filter(f => f.destination === dest).length} paquete(s) activos
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Módulo Funcional Crítico: Listado y Control de Operaciones CRUD básicas */}
            <div className="glass-form-panel" style={{ marginTop: '2rem' }}>
              <h3 style={{ marginTop: 0, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', color: '#8ab4f8' }}>
                Control Operativo de Paquetes Activos
              </h3>
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
                    {flights.map((flight) => {
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
                          <td style={{ padding: '0.75rem', textAlign: 'center' }}>
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
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="admin-header-actions">
              <h1 className="admin-title">Registrar Nuevo Vuelo</h1>
            </div>
            <FlightForm 
              existingDestinations={destinations}
              onCancel={() => setIsCreating(false)}
              onSuccess={handleSuccess}
            />
          </>
        )}
      </Box>
    </Box>
  );
}

export default Admin;