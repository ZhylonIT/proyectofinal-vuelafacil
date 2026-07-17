import { apiClient } from './apiClient';

export const usuarioService = {
  obtenerTodos: () => apiClient.get('/usuarios'),
  cambiarRol: (id, rol) => apiClient.patch(`/usuarios/${id}/rol`, { rol }),
};
