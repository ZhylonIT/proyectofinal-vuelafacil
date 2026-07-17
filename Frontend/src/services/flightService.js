import { apiClient } from './apiClient';

export const flightService = {
  obtenerTodos: () => apiClient.get('/vuelos', { auth: false }),
  obtenerPorId: (id) => apiClient.get(`/vuelos/${id}`, { auth: false }),
  obtenerRecomendaciones: () => apiClient.get('/vuelos/recomendaciones', { auth: false }),
  crear: (payload) => apiClient.post('/vuelos', payload),
  actualizar: (id, payload) => apiClient.put(`/vuelos/${id}`, payload),
  eliminar: (id) => apiClient.delete(`/vuelos/${id}`),
};
