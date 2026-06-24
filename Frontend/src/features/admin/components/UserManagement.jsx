import { useState } from 'react';

function UserManagement() {
  const [users, setUsers] = useState(() => {
    const mockAdmin = {
      id: 'admin-001',
      firstName: 'Admin',
      lastName: 'Vuela Fácil',
      email: 'admin@vuelafacil.com',
      role: 'admin'
    };

    const registeredUserStr = localStorage.getItem('registeredUser');
    const registeredUser = registeredUserStr ? { role: 'user', ...JSON.parse(registeredUserStr) } : null;

    const userList = [mockAdmin];
    if (registeredUser) {
      userList.push(registeredUser);
    }
    
    return userList;
  });

  const toggleUserRole = (userId) => {
    if (userId === 'admin-001') {
      alert("Operación denegada. El usuario maestro del sistema no puede perder sus privilegios.");
      return;
    }

    const updatedUsers = users.map(user => {
      if (user.id === userId) {
        const newRole = user.role === 'admin' ? 'user' : 'admin';
        const storedUserStr = localStorage.getItem('registeredUser');
        const storedUser = storedUserStr ? JSON.parse(storedUserStr) : {};
        localStorage.setItem('registeredUser', JSON.stringify({ ...storedUser, role: newRole }));
        
        return { ...user, role: newRole };
      }
      return user;
    });

    setUsers(updatedUsers);
  };

  return (
    <div className="glass-form-panel">
      <div className="admin-table-header-toolbar">
        <h3 style={{ margin: 0, color: '#8ab4f8' }}>Gestión de Roles y Accesos ({users.length} usuarios)</h3>
      </div>
      
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
            {users.map(user => (
              <tr key={user.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)' }}>
                <td style={{ padding: '0.75rem', fontFamily: 'monospace', fontSize: '0.85rem', color: '#8ab4f8' }}>{user.id}</td>
                <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>{user.firstName} {user.lastName}</td>
                <td style={{ padding: '0.75rem' }}>{user.email}</td>
                <td style={{ padding: '0.75rem' }}>
                  <span style={{ 
                    padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase',
                    background: user.role === 'admin' ? 'rgba(211, 47, 47, 0.15)' : 'rgba(76, 175, 80, 0.15)', 
                    color: user.role === 'admin' ? '#ef5350' : '#a5d6a7',
                    border: user.role === 'admin' ? '1px solid rgba(211, 47, 47, 0.3)' : '1px solid rgba(76, 175, 80, 0.3)'
                  }}>
                    {user.role}
                  </span>
                </td>
                <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                  <button 
                    onClick={() => toggleUserRole(user.id)}
                    disabled={user.id === 'admin-001'}
                    style={{ 
                      background: user.role === 'admin' ? '#ff9800' : '#0288d1', 
                      color: '#ffffff', border: 'none', padding: '6px 12px', borderRadius: '4px', 
                      cursor: user.id === 'admin-001' ? 'not-allowed' : 'pointer', fontSize: '0.8rem', fontWeight: 'bold',
                      opacity: user.id === 'admin-001' ? 0.5 : 1
                    }}
                  >
                    {user.role === 'admin' ? 'Revocar Admin' : 'Hacer Admin'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UserManagement;