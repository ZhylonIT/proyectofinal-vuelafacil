import { Box, Typography } from '@mui/material';

function Footer() {
  return (
    <Box 
      component="footer" 
      sx={{ 
        py: 3, 
        px: { xs: 2, sm: 4, md: 6 }, 
        mt: 'auto', 
        bgcolor: 'primary.main', 
        width: '100%',
        boxSizing: 'border-box'
      }}
    >
      <Typography variant="body2" color="text.primary" align="center" sx={{ fontWeight: 500 }}>
        © {new Date().getFullYear()} VuelaFácil - Tu viaje sin complicaciones.
      </Typography>
    </Box>
  );
}

export default Footer;