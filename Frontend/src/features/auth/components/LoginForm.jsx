import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../../styles/Login.css';

function LoginForm({ redirectUrl }) {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors((prev) => {
        const updatedErrors = { ...prev };
        delete updatedErrors[name];
        return updatedErrors;
      });
    }
    if (globalError) setGlobalError('');
  };

  const validateForm = () => {
    const localErrors = {};
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!formData.email.trim()) {
      localErrors.email = 'El correo electrónico es obligatorio.';
    } else if (!emailRegex.test(formData.email)) {
      localErrors.email = 'Formato de correo electrónico inválido.';
    }

    if (!formData.password) {
      localErrors.password = 'La contraseña es obligatoria.';
    }

    return localErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setGlobalError('');

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    const registeredUserStr = localStorage.getItem('registeredUser');    
    const registeredUser = registeredUserStr ? { role: 'user', ...JSON.parse(registeredUserStr) } : null;

    const mockAdmin = {
      id: 'admin-001',
      firstName: 'Admin',
      lastName: 'Vuela Fácil',
      email: 'admin@vuelafacil.com',
      password: 'admin',
      role: 'admin'
    };

    setTimeout(() => {
      let matchedUser = null;

      if (registeredUser && formData.email.toLowerCase() === registeredUser.email.toLowerCase() && formData.password === registeredUser.password) {
        matchedUser = registeredUser;
      } else if (formData.email.toLowerCase() === mockAdmin.email && formData.password === mockAdmin.password) {
        matchedUser = mockAdmin;
      }

      if (matchedUser) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('currentUser', JSON.stringify({
          id: matchedUser.id,
          firstName: matchedUser.firstName,
          lastName: matchedUser.lastName,
          email: matchedUser.email,
          role: matchedUser.role 
        }));

        if (redirectUrl) {
          navigate(redirectUrl);
        } else if (matchedUser.role === 'admin') {
          navigate('/administracion');
        } else {
          navigate('/');
        }
      } else {
        setGlobalError('El correo electrónico o la contraseña son incorrectos. Por favor, intente de nuevo.');
        setIsSubmitting(false);
      }
    }, 1000);
  };

  return (
    <div className="login-card">
      <h2 className="login-title">Iniciar sesión</h2>
      <p className="login-subtitle">Ingresá tus credenciales corporativas o de usuario para continuar.</p>

      {globalError && (
        <div className="login-error-alert" role="alert">
          <svg className="error-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="currentColor"/>
          </svg>
          <span>{globalError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="login-form">
        <div className="login-form-group">
          <label htmlFor="email">Correo Electrónico</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={errors.email ? 'input-error' : ''}
            placeholder="usuario@vuelafacil.com"
            disabled={isSubmitting}
          />
          {errors.email && <span className="error-text" role="alert">{errors.email}</span>}
        </div>

        <div className="login-form-group">
          <label htmlFor="password">Contraseña</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={errors.password ? 'input-error' : ''}
            placeholder="••••••••"
            disabled={isSubmitting}
          />
          {errors.password && <span className="error-text" role="alert">{errors.password}</span>}
        </div>

        <button type="submit" className="login-submit-btn" disabled={isSubmitting}>
          {isSubmitting ? 'Verificando...' : 'Ingresar'}
        </button>
      </form>
    </div>
  );
}

export default LoginForm;