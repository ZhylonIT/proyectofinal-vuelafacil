import { useState } from 'react';
import { AppBar, Toolbar, Box, Button, IconButton, Drawer, List, ListItem, ListItemButton, ListItemText } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import logoPrincipal from '../assets/images/logoprincipal.png';

function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Manejador centralizado para el inicio de sesión simulado con redirección
  const handleLogin = () => {
    setIsLoggedIn(true);
    navigate('/administracion');
  };

  // Manejador centralizado para el cierre de sesión simulado
  const handleLogout = () => {
    setIsLoggedIn(false);
    navigate('/');
  };

  // Configuración dinámica de ítems de navegación según estado local de login
  const navItems = isLoggedIn
    ? [
        { label: 'Inicio', path: '/' },
        { label: 'Administración', path: '/administracion' },
        { label: 'Cerrar sesión', path: '#', variant: 'contained', onClick: handleLogout }
      ]
    : [
        { label: 'Crear cuenta', path: '/registro', variant: 'outlined' },
        { label: 'Iniciar sesión', path: '#', variant: 'contained', onClick: handleLogin }
      ];

  const drawerContent = (
    <Box onClick={handleDrawerToggle} sx={{ width: 250, bgcolor: 'background.default', height: '100%', pt: 2 }}>
      <Box sx={{ px: 2, pb: 2, display: 'flex', justifyContent: 'center', borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>
        <img 
          src={logoPrincipal} 
          alt="Logo VuelaFácil" 
          style={{ height: '50px', width: 'auto', objectFit: 'contain' }} 
        />
      </Box>
      <List sx={{ px: 1 }}>
        {navItems.map((item) => (
          <ListItem key={item.label} disablePadding sx={{ mb: 1 }}>
            <ListItemButton 
              {...(item.onClick 
                ? { onClick: item.onClick } 
                : { component: Link, to: item.path }
              )}
              sx={{
                borderRadius: 2,
                bgcolor: item.variant === 'contained' ? 'accent.main' : 'transparent',
                color: item.variant === 'contained' ? 'accent.contrastText' : 'text.primary',
                border: item.variant === 'outlined' ? '1px solid' : 'none',
                borderColor: 'accent.main',
                textAlign: 'center',
                '&:hover': {
                  bgcolor: item.variant === 'contained' ? '#1a2a4d' : 'rgba(0, 0, 0, 0.04)',
                }
              }}
            >
              {/* Solución Senior: Migración de API directa a sistema robusto de slotProps */}
              <ListItemText 
                primary={item.label} 
                slotProps={{
                  primaryTypography: { fontWeight: 600, fontSize: '1rem' }
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{ 
          bgcolor: 'background.default', 
          color: 'text.primary', 
          width: '100%',
          borderBottom: '1px solid',
          borderColor: 'rgba(0, 0, 0, 0.12)',          
          zIndex: (theme) => theme.zIndex.drawer + 1
        }}
      >
        <Toolbar 
          disableGutters 
          sx={{ 
            justifyContent: 'space-between', 
            width: '100%', 
            px: { xs: 2, sm: 4, md: 6 } 
          }}
        >
          <Box 
            component={Link} 
            to="/" 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              textDecoration: 'none',
              height: '90px',
            }}
          >
            <img 
              src={logoPrincipal} 
              alt="Logo VuelaFácil" 
              style={{ height: '65px', width: 'auto', objectFit: 'contain', marginTop: '6px' }} 
            />
          </Box>

          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ display: { xs: 'flex', md: 'none' }, color: 'text.primary' }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 18H21V16H3V18ZM3 13H21V11H3V13ZM3 6V8H21V6H3Z" fill="currentColor"/>
            </svg>
          </IconButton>

          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2, alignItems: 'center' }}>
            {isLoggedIn && (
              <>
                <Button 
                  component={Link} 
                  to="/" 
                  sx={{ color: 'text.primary', fontWeight: 600, fontSize: '1.1rem' }}
                >
                  Inicio
                </Button>
                
                <Button 
                  component={Link} 
                  to="/administracion" 
                  sx={{ color: 'text.primary', fontWeight: 600, fontSize: '1.1rem' }}
                >
                  Administración
                </Button>
              </>
            )}

            {!isLoggedIn && (
              <Button 
                component={Link} 
                to="/registro" 
                variant="outlined"
                sx={{ 
                  color: 'accent.main', 
                  borderColor: 'accent.main',
                  fontWeight: 600, 
                  fontSize: '1rem',
                  '&:hover': {
                    borderColor: 'accent.main',
                    bgcolor: 'rgba(36, 58, 105, 0.04)'
                  }
                }}
              >
                Crear cuenta
              </Button>
            )}
            
            <Button 
              onClick={isLoggedIn ? handleLogout : handleLogin}
              variant="contained"
              sx={{ 
                bgcolor: 'accent.main', 
                color: 'accent.contrastText', 
                fontWeight: 600, 
                fontSize: '1rem',
                '&:hover': {
                  bgcolor: '#1a2a4d'
                }
              }}
            >
              {isLoggedIn ? 'Cerrar sesión' : 'Iniciar sesión'}
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Cajón lateral de navegación para móvil y tablet */}
      <Drawer
        variant="temporary"
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Optimiza el rendimiento de renderizado en móviles
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250 },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
}

export default Header;