import { useEffect, useState } from 'react';
import { usuarioService } from '../../../services/usuarioService';
import { useAuth } from '../../../context/AuthContext';

function UserManagement() {
  const { user: usuarioActual } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const cargarUsuarios = () => {
    setLoading(true);
    usuarioService.obtenerTodos()
      .then(setUsers)
      .catch((err) => setError(err.message || 'No se pudieron cargar los usuarios.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargarUsuarios();
  }, []);

  const toggleUserRole = async (usuario) => {
    const nuevoRol = usuario.rol === 'ADMIN' ? 'USER' : 'ADMIN';
    setUpdatingId(usuario.id);
    setError('');
    try {
      await usuarioService.cambiarRol(usuario.id, nuevoRol);
      setUsers(prev => prev.map(u => u.id === usuario.id ? { ...u, rol: nuevoRol } : u));
    } catch (err) {
      setError(err.message || 'No se pudo actualizar el rol del usuario.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="glass-form-panel">
      <div className="admin-table-header-toolbar">
        <h3 style={{ margin: 0, color: '#8ab4f8' }}>Gestión de Roles y Accesos ({users.length} usuarios)</h3>
      </div>

      {error && <p style={{ color: '#ef5350', marginTop: '1rem' }}>{error}</p>}

      {loading ? (
        <p style={{ color: '#b0bec5', marginTop: '1.5rem' }}>Cargando usuarios...</p>
      ) : (
        <div style={{ overflowX: 'auto', marginTop: '1.5rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', color: '#ffffff', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.2)', color: '#b0bec5' }}>
                <th style={{ padding: '0.75rem' }}>ID Usuario</th>
                <th style={{ padding: '0.75rem' }}>Nombre Completo</th>
                <th style={{ padding: '0.75rem' }}>Email</th>
                <th style={{ padding: '0.75rem' }}>Privilegios (Rol)</th>
                <th style={{ padding: '0.75rem', textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map(usuario => {
                const esUnoMismo = usuarioActual?.id === usuario.id;
                return (
                  <tr key={usuario.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)' }}>
                    <td style={{ padding: '0.75rem', fontFamily: 'monospace', fontSize: '0.85rem', color: '#8ab4f8' }}>{usuario.id}</td>
                    <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>{usuario.nombre} {usuario.apellido}</td>
                    <td style={{ padding: '0.75rem' }}>{usuario.email}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{
                        padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase',
                        background: usuario.rol === 'ADMIN' ? 'rgba(211, 47, 47, 0.15)' : 'rgba(76, 175, 80, 0.15)',
                        color: usuario.rol === 'ADMIN' ? '#ef5350' : '#a5d6a7',
                        border: usuario.rol === 'ADMIN' ? '1px solid rgba(211, 47, 47, 0.3)' : '1px solid rgba(76, 175, 80, 0.3)'
                      }}>
                        {usuario.rol}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                      <button
                        onClick={() => toggleUserRole(usuario)}
                        disabled={esUnoMismo || updatingId === usuario.id}
                        title={esUnoMismo ? 'No podés modificar tu propio rol.' : ''}
                        style={{
                          background: usuario.rol === 'ADMIN' ? '#ff9800' : '#0288d1',
                          color: '#ffffff', border: 'none', padding: '6px 12px', borderRadius: '4px',
                          cursor: (esUnoMismo || updatingId === usuario.id) ? 'not-allowed' : 'pointer', fontSize: '0.8rem', fontWeight: 'bold',
                          opacity: (esUnoMismo || updatingId === usuario.id) ? 0.5 : 1
                        }}
                      >
                        {updatingId === usuario.id ? 'Actualizando...' : usuario.rol === 'ADMIN' ? 'Revocar Admin' : 'Hacer Admin'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default UserManagement;
