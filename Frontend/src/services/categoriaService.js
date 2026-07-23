import { apiClient } from './apiClient';

export const categoriaService = {
  listar: () => apiClient.get('/categorias', { auth: false }),
  crear: (payload) => apiClient.post('/categorias', payload),
  actualizar: (id, payload) => apiClient.put(`/categorias/${id}`, payload),
  eliminar: (id) => apiClient.delete(`/categorias/${id}`),
};
