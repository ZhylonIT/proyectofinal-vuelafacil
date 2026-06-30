import RioImage from '../../../assets/images/rio.jpg';
import MadridImage from '../../../assets/images/madrid.jpg';
import CancunImage from '../../../assets/images/cancun.jpg';
import MendozaImage from '../../../assets/images/mendoza.jpg';
import NewYorkImage from '../../../assets/images/ny.jpg';
import UshuaiaImage from '../../../assets/images/ushuaia.jpg';
import MiamiImage from '../../../assets/images/miami.jpg';
import IguazuImage from '../../../assets/images/iguazu.jpg';

const MOCK_PACKAGES = [
  // Río de Janeiro
  { id: 'pkg-rio-1', destination: 'Río de Janeiro', description: 'Paquete Relax: 7 noches en Copacabana con desayuno incluido.', category: 'playa', price: 280000, currency: 'ARS', images: [RioImage] },
  { id: 'pkg-rio-2', destination: 'Río de Janeiro', description: 'Aventura Carioca: 5 noches, tour al Cristo Redentor y Pan de Azúcar.', category: 'playa', price: 350000, currency: 'ARS', images: [RioImage] },
  { id: 'pkg-rio-3', destination: 'Río de Janeiro', description: 'Premium VIP: 10 noches en hotel 5 estrellas frente al mar.', category: 'playa', price: 620000, currency: 'ARS', images: [RioImage] },

  // Madrid
  { id: 'pkg-madrid-1', destination: 'Madrid', description: 'Escapada Cultural: 4 noches, visita al Prado y Palacio Real.', category: 'ciudad', price: 780000, currency: 'ARS', images: [MadridImage] },
  { id: 'pkg-madrid-2', destination: 'Madrid', description: 'Madrid Total: 7 noches con excursión a Toledo y gastronomía.', category: 'ciudad', price: 1100000, currency: 'ARS', images: [MadridImage] },
  { id: 'pkg-madrid-3', destination: 'Madrid', description: 'Fin de Semana Real: 3 noches en el centro histórico.', category: 'ciudad', price: 550000, currency: 'ARS', images: [MadridImage] },

  // Cancún
  { id: 'pkg-cancun-1', destination: 'Cancún', description: 'Caribe Soñado: 7 noches todo incluido en resort 4 estrellas.', category: 'playa', price: 480000, currency: 'ARS', images: [CancunImage] },
  { id: 'pkg-cancun-2', destination: 'Cancún', description: 'Aventura Maya: 6 noches, incluye Chichén Itzá y cenotes.', category: 'playa', price: 520000, currency: 'ARS', images: [CancunImage] },
  { id: 'pkg-cancun-3', destination: 'Cancún', description: 'Luna de Miel: 8 noches en hotel boutique con jacuzzi privado.', category: 'playa', price: 750000, currency: 'ARS', images: [CancunImage] },

  // Mendoza
  { id: 'pkg-mendoza-1', destination: 'Mendoza', description: 'Ruta del Vino: 5 noches, visita a 4 bodegas con degustación.', category: 'montaña', price: 130000, currency: 'ARS', images: [MendozaImage] },
  { id: 'pkg-mendoza-2', destination: 'Mendoza', description: 'Aventura Andina: 6 noches, trekking en el Aconcagua.', category: 'montaña', price: 160000, currency: 'ARS', images: [MendozaImage] },
  { id: 'pkg-mendoza-3', destination: 'Mendoza', description: 'Relax y Spa: 4 noches en termas de Cacheuta.', category: 'montaña', price: 145000, currency: 'ARS', images: [MendozaImage] },

  // Nueva York
  { id: 'pkg-ny-1', destination: 'Nueva York', description: 'Manhattan Express: 5 noches, city tour y entrada a MoMA.', category: 'ciudad', price: 850000, currency: 'ARS', images: [NewYorkImage] },
  { id: 'pkg-ny-2', destination: 'Nueva York', description: 'Broadway Nights: 7 noches, incluye entrada a musical.', category: 'ciudad', price: 1100000, currency: 'ARS', images: [NewYorkImage] },
  { id: 'pkg-ny-3', destination: 'Nueva York', description: 'Compras VIP: 4 noches en 5ta Avenida con guía de shopping.', category: 'ciudad', price: 950000, currency: 'ARS', images: [NewYorkImage] },

  // Ushuaia
  { id: 'pkg-ushuaia-1', destination: 'Ushuaia', description: 'Fin del Mundo: 5 noches, navegación por el Canal Beagle.', category: 'montaña', price: 155000, currency: 'ARS', images: [UshuaiaImage] },
  { id: 'pkg-ushuaia-2', destination: 'Ushuaia', description: 'Antártida Express: 8 noches, excursión a la Península Antártica.', category: 'montaña', price: 320000, currency: 'ARS', images: [UshuaiaImage] },
  { id: 'pkg-ushuaia-3', destination: 'Ushuaia', description: 'Nieve y Esquí: 6 noches en el Cerro Castor.', category: 'montaña', price: 180000, currency: 'ARS', images: [UshuaiaImage] },

  // Miami
  { id: 'pkg-miami-1', destination: 'Miami', description: 'Miami Beach: 7 noches en South Beach con auto incluido.', category: 'playa', price: 680000, currency: 'ARS', images: [MiamiImage] },
  { id: 'pkg-miami-2', destination: 'Miami', description: 'Compras y Playa: 5 noches, tour de outlets.', category: 'playa', price: 550000, currency: 'ARS', images: [MiamiImage] },
  { id: 'pkg-miami-3', destination: 'Miami', description: 'Crucero Bahamas: 8 noches, crucero de 3 días incluido.', category: 'playa', price: 820000, currency: 'ARS', images: [MiamiImage] },

  // Cataratas del Iguazú
  { id: 'pkg-iguazu-1', destination: 'Cataratas del Iguazú', description: 'Maravilla Natural: 4 noches, excursión lado argentino y brasileño.', category: 'naturaleza', price: 95000, currency: 'ARS', images: [IguazuImage] },
  { id: 'pkg-iguazu-2', destination: 'Cataratas del Iguazú', description: 'Aventura Selvática: 6 noches, trekking y paseos en lancha.', category: 'naturaleza', price: 120000, currency: 'ARS', images: [IguazuImage] },
  { id: 'pkg-iguazu-3', destination: 'Cataratas del Iguazú', description: 'Ecolodge Premium: 5 noches en hotel sustentable.', category: 'naturaleza', price: 140000, currency: 'ARS', images: [IguazuImage] },
];

export default MOCK_PACKAGES;