import RegisterForm from '../features/auth/components/RegisterForm';
import '../styles/Register.css';

function Register() {
  return (
    <main className="register-page-container">
      <div className="register-content-wrapper">
        <RegisterForm />
      </div>
    </main>
  );
}

export default Register;