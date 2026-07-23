import { apiClient } from './apiClient';

export const caracteristicaService = {
  listar: () => apiClient.get('/caracteristicas', { auth: false }),
  crear: (payload) => apiClient.post('/caracteristicas', payload),
  actualizar: (id, payload) => apiClient.put(`/caracteristicas/${id}`, payload),
  eliminar: (id) => apiClient.delete(`/caracteristicas/${id}`),
};
