import { Box } from '@mui/material';
import { useState } from 'react';
import FlightSearch from '../features/flights/components/FlightSearch';
import FlightCategories from '../features/flights/components/FlightCategories';
import FlightRecommendations from '../features/flights/components/FlightRecommendations';

function Mainlayout() {
  const [activeCategory, setActiveCategory] = useState('todos');
  const [searchCriteria, setSearchCriteria] = useState(null);

  return (
    <Box 
      sx={{ 
        width: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        background: 'linear-gradient(135deg, #243A69 0%, #01143b 100%)',
      }}
      >
      <FlightSearch onSearch={setSearchCriteria} />
      <FlightRecommendations 
        activeCategory={activeCategory} 
        searchCriteria={searchCriteria}
        onClearSearch={() => setSearchCriteria(null)}
      />
      <FlightCategories 
        activeCategory={activeCategory} 
        onCategoryChange={(category) => {
          setActiveCategory(category);
          setSearchCriteria(null); // Al cambiar de categoría se limpia la búsqueda para evitar conflictos visuales
        }} 
      />
    </Box>
  );
}

export default Mainlayout;