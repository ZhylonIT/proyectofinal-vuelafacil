import { BrowserRouter } from 'react-router-dom';
import { Box } from '@mui/material';
import AppRoutes from './routes/AppRoutes';
import Header from './layouts/Header';
import Footer from './layouts/Footer';
import WhatsAppButton from './components/common/WhatsAppButton';

function App() {
  return (
    <BrowserRouter>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
        <Header />
        
        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1, 
            pt: 11, 
            pb: 4, 
            width: '100%',
            px: { xs: 2, sm: 4, md: 6 },
            boxSizing: 'border-box',
            background: 'linear-gradient(135deg, #243A69 0%, #01143b 100%)',
          }}
        >
          <AppRoutes />
        </Box>

        <Footer />
        <WhatsAppButton />
      </Box>
    </BrowserRouter>  
  );
}

export default App;