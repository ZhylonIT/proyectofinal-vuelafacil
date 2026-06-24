import { Box } from '@mui/material';
import { useState } from 'react';
import FlightSearch from '../features/flights/components/FlightSearch';
import FlightCategories from '../features/flights/components/FlightCategories';
import FlightRecommendations from '../features/flights/components/FlightRecommendations';
import CharacteristicsFilter from '../features/flights/components/CharacteristicsFilter';

function Mainlayout() {
  const [activeCategory, setActiveCategory] = useState('todos');
  const [searchCriteria, setSearchCriteria] = useState(null);
  const [activeCharacteristics, setActiveCharacteristics] = useState([]);

  const handleToggleCharacteristic = (id) => {
    setActiveCharacteristics(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', background: 'linear-gradient(135deg, #243A69 0%, #01143b 100%)' }}>
      <FlightSearch onSearch={setSearchCriteria} />
      
      <CharacteristicsFilter 
        selectedIds={activeCharacteristics} 
        onToggleCharacteristic={handleToggleCharacteristic}
      />

      <FlightRecommendations 
        activeCategory={activeCategory} 
        searchCriteria={searchCriteria}
        activeCharacteristics={activeCharacteristics}
        onClearSearch={() => setSearchCriteria(null)}
      />
      
      <FlightCategories 
        activeCategory={activeCategory} 
        onCategoryChange={(category) => {
          setActiveCategory(category);
          setSearchCriteria(null);
        }} 
      />
    </Box>
  );
}

export default Mainlayout;