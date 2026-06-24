import { useState } from 'react';
import { AppBar, Toolbar, Box, Button, IconButton, Drawer, List, ListItem, ListItemButton, ListItemText, Avatar, Typography } from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import logoPrincipal from '../assets/images/logoprincipal.png';

function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const [authState, setAuthState] = useState(() => ({
    isLoggedIn: localStorage.getItem('isLoggedIn') === 'true',
    user: JSON.parse(localStorage.getItem('currentUser') || 'null'),
    pathname: location.pathname
  }));

  if (location.pathname !== authState.pathname) {
    setAuthState({
      isLoggedIn: localStorage.getItem('isLoggedIn') === 'true',
      user: JSON.parse(localStorage.getItem('currentUser') || 'null'),
      pathname: location.pathname
    });
  }

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    
    setAuthState({
      isLoggedIn: false,
      user: null,
      pathname: location.pathname
    });
    
    navigate('/');
  };

  const getUserInitials = () => {
    if (!authState.user || !authState.user.firstName) return '?';
    const firstInitial = authState.user.firstName.charAt(0).toUpperCase();
    const lastInitial = authState.user.lastName ? authState.user.lastName.charAt(0).toUpperCase() : '';
    return `${firstInitial}${lastInitial}`;
  };

  // Solo se inyecta la pestaña de 'Administración' si el rol del usuario es 'admin'
  const navItems = authState.isLoggedIn
    ? [
        { label: 'Inicio', path: '/' },
        { label: 'Mi Perfil', path: '/perfil' },
        ...(authState.user?.role === 'admin' ? [{ label: 'Administración', path: '/administracion' }] : [])
      ]
    : [
        { label: 'Crear cuenta', path: '/registro', variant: 'outlined' },
        { label: 'Iniciar sesión', path: '/login', variant: 'contained' }
      ];

  const drawerContent = (
    <Box onClick={handleDrawerToggle} sx={{ width: 250, bgcolor: 'background.default', height: '100%', pt: 2, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ px: 2, pb: 2, display: 'flex', justifyContent: 'center', borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>
        <img src={logoPrincipal} alt="Logo VuelaFácil" style={{ height: '50px', width: 'auto', objectFit: 'contain' }} />
      </Box>

      {authState.isLoggedIn && authState.user && (
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, bgcolor: 'rgba(36, 58, 105, 0.05)', mx: 1, my: 2, borderRadius: 2 }}>
          <Avatar sx={{ bgcolor: 'accent.main', color: 'accent.contrastText', fontWeight: 700 }}>
            {getUserInitials()}
          </Avatar>
          <Typography variant="subtitle1" sx={{ color: '#0B3B5A', fontWeight: 600, noWrap: true }}>
            {authState.user.firstName}
          </Typography>
        </Box>
      )}

      <List sx={{ px: 1, flexGrow: 1 }}>
        {navItems.map((item) => (
          <ListItem key={item.label} disablePadding sx={{ mb: 1 }}>
            <ListItemButton 
              component={Link} 
              to={item.path}
              sx={{
                borderRadius: 2,
                bgcolor: item.variant === 'contained' ? 'accent.main' : 'transparent',
                color: item.variant === 'contained' ? 'accent.contrastText' : 'text.primary',
                border: item.variant === 'outlined' ? '1px solid' : 'none',
                borderColor: 'accent.main',
                textAlign: 'center',
                '&:hover': { bgcolor: item.variant === 'contained' ? '#1a2a4d' : 'rgba(0, 0, 0, 0.04)' }
              }}
            >
              <ListItemText primary={item.label} slotProps={{ primaryTypography: { fontWeight: 600, fontSize: '1rem' } }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {authState.isLoggedIn && (
        <Box sx={{ p: 2, borderTop: '1px solid rgba(0, 0, 0, 0.12)' }}>
          <Button onClick={handleLogout} variant="contained" fullWidth sx={{ bgcolor: '#C53030', color: '#FFFFFF', '&:hover': { bgcolor: '#9B2C2C' } }}>
            Cerrar sesión
          </Button>
        </Box>
      )}
    </Box>
  );

  return (
    <>
      <AppBar position="fixed" elevation={0} sx={{ bgcolor: 'background.default', color: 'text.primary', width: '100%', borderBottom: '1px solid', borderColor: 'rgba(0, 0, 0, 0.12)', zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar disableGutters sx={{ justifyContent: 'space-between', width: '100%', px: { xs: 2, sm: 4, md: 6 } }}>
          <Box component={Link} to="/" sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', height: '90px' }}>
            <img src={logoPrincipal} alt="Logo VuelaFácil" style={{ height: '65px', width: 'auto', objectFit: 'contain', marginTop: '6px' }} />
          </Box>

          <IconButton color="inherit" aria-label="open drawer" edge="start" onClick={handleDrawerToggle} sx={{ display: { xs: 'flex', md: 'none' }, color: 'text.primary' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 18H21V16H3V18ZM3 13H21V11H3V13ZM3 6V8H21V6H3Z" fill="currentColor"/></svg>
          </IconButton>

          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2, alignItems: 'center' }}>
            {authState.isLoggedIn && (
              <Button component={Link} to="/" sx={{ color: 'text.primary', fontWeight: 600, fontSize: '1.1rem' }}>Inicio</Button>
            )}
            
            {authState.isLoggedIn && (
              <Button component={Link} to="/perfil" sx={{ color: 'text.primary', fontWeight: 600, fontSize: '1.1rem' }}>Mi Perfil</Button>
            )}
            
            {/* Solo se inyecta el botón si el usuario tiene rol 'admin' */}
            {authState.isLoggedIn && authState.user?.role === 'admin' && (
              <Button component={Link} to="/administracion" sx={{ color: 'text.primary', fontWeight: 600, fontSize: '1.1rem' }}>Administración</Button>
            )}

            {!authState.isLoggedIn ? (
              <>
                <Button component={Link} to="/registro" variant="outlined" sx={{ color: 'accent.main', borderColor: 'accent.main', fontWeight: 600, fontSize: '1rem', '&:hover': { borderColor: 'accent.main', bgcolor: 'rgba(36, 58, 105, 0.04)' } }}>Crear cuenta</Button>
                <Button component={Link} to="/login" variant="contained" sx={{ bgcolor: 'accent.main', color: 'accent.contrastText', fontWeight: 600, fontSize: '1rem', '&:hover': { bgcolor: '#1a2a4d' } }}>Iniciar sesión</Button>
              </>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, ml: 2, pl: 2, borderLeft: '1px solid rgba(0,0,0,0.12)' }}>
                <Avatar sx={{ bgcolor: 'accent.main', color: 'accent.contrastText', fontWeight: 600, width: 38, height: 38, fontSize: '0.95rem' }}>{getUserInitials()}</Avatar>
                <Typography sx={{ color: '#0B3B5A', fontWeight: 600, fontSize: '1rem', maxWidth: 150, noWrap: true }}>{authState.user?.firstName}</Typography>
                <Button onClick={handleLogout} variant="text" sx={{ color: '#C53030', fontWeight: 600, fontSize: '0.9rem', ml: 1, '&:hover': { bgcolor: 'rgba(197, 48, 48, 0.04)' } }}>Cerrar sesión</Button>
              </Box>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer variant="temporary" anchor="right" open={mobileOpen} onClose={handleDrawerToggle} ModalProps={{ keepMounted: true }} sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250 } }}>
        {drawerContent}
      </Drawer>
    </>
  );
}

export default Header;