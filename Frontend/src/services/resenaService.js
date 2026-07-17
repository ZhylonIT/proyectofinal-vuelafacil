import { apiClient } from './apiClient';

export const resenaService = {
  crear: (flightId, datos) => apiClient.post(`/vuelos/${flightId}/resenas`, datos),
  listarPorVuelo: (flightId) => apiClient.get(`/vuelos/${flightId}/resenas`, { auth: false }),
};
