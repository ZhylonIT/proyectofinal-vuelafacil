import LoginForm from '../features/auth/components/LoginForm';
import '../styles/Login.css';

function Login() {
  return (
    <main className="login-page-container">
      <div className="login-content-wrapper">
        <LoginForm />
      </div>
    </main>
  );
}

export default Login;