import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../../styles/Register.css';

function RegisterForm() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

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
  };

  const validateForm = () => {
    const localErrors = {};
    const nameRegex = /^[a-zA-ZÀ-ÿ\s]{2,40}$/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!formData.firstName.trim()) {
      localErrors.firstName = 'El nombre es obligatorio.';
    } else if (!nameRegex.test(formData.firstName)) {
      localErrors.firstName = 'El nombre solo debe contener letras (mínimo 2 caracteres).';
    }

    if (!formData.lastName.trim()) {
      localErrors.lastName = 'El apellido es obligatorio.';
    } else if (!nameRegex.test(formData.lastName)) {
      localErrors.lastName = 'El apellido solo debe contener letras (mínimo 2 caracteres).';
    }

    if (!formData.email.trim()) {
      localErrors.email = 'El correo electrónico es obligatorio.';
    } else if (!emailRegex.test(formData.email)) {
      localErrors.email = 'Introduzca una dirección de correo válida.';
    }

    if (!formData.password) {
      localErrors.password = 'La contraseña es obligatoria.';
    } else if (formData.password.length < 6) {
      localErrors.password = 'La contraseña debe contener al menos 6 caracteres.';
    }

    return localErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    // Se asigna el rol base 'user' a las nuevas cuentas
    const newUser = {
      ...formData,
      role: 'user', 
      id: `usr-${Date.now()}`
    };

    localStorage.setItem('registeredUser', JSON.stringify(newUser));

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    }, 1200);
  };

  return (
    <div className="register-card">
      <h2 className="register-title">Crear una cuenta</h2>
      <p className="register-subtitle">Registrate para acceder a promociones exclusivas y gestionar tus vuelos de forma ágil.</p>

      {submitSuccess ? (
        <div className="register-success-alert" role="alert">
          <svg className="success-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="currentColor"/>
          </svg>
          <div>
            <strong>¡Registro completado con éxito!</strong>
            <p>Cuenta creada. Redireccionando al inicio de sesión...</p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="register-form">
          <div className="register-form-row">
            <div className="register-form-group">
              <label htmlFor="firstName">Nombre *</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={errors.firstName ? 'input-error' : ''}
                placeholder="Ej. Juan"
                disabled={isSubmitting}
              />
              {errors.firstName && <span className="error-text" role="alert">{errors.firstName}</span>}
            </div>

            <div className="register-form-group">
              <label htmlFor="lastName">Apellido *</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={errors.lastName ? 'input-error' : ''}
                placeholder="Ej. Pérez"
                disabled={isSubmitting}
              />
              {errors.lastName && <span className="error-text" role="alert">{errors.lastName}</span>}
            </div>
          </div>

          <div className="register-form-group">
            <label htmlFor="email">Correo Electrónico *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'input-error' : ''}
              placeholder="juan.perez@ejemplo.com"
              disabled={isSubmitting}
            />
            {errors.email && <span className="error-text" role="alert">{errors.email}</span>}
          </div>

          <div className="register-form-group">
            <label htmlFor="password">Contraseña *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? 'input-error' : ''}
              placeholder="Mínimo 6 caracteres"
              disabled={isSubmitting}
            />
            {errors.password && <span className="error-text" role="alert">{errors.password}</span>}
          </div>

          <button type="submit" className="register-submit-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Procesando registro...' : 'Registrarse'}
          </button>
        </form>
      )}
    </div>
  );
}

export default RegisterForm;