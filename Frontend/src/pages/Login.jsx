import { useSearchParams } from 'react-router-dom';
import LoginForm from '../features/auth/components/LoginForm';
import '../styles/Login.css';

function Login() {
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect');

  return (
    <main className="login-page-container">
      <div className="login-content-wrapper">
        <div>
          {redirectUrl && (
            <div className="login-reserva-banner">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="currentColor"/>
              </svg>
              <span>
                El inicio de sesión es obligatorio para reservar.{' '}
                Si aún no tenés cuenta,{' '}
                <a href="/registro" className="login-banner-link">registrate</a>.
              </span>
            </div>
          )}
          <LoginForm redirectUrl={redirectUrl} />
        </div>
      </div>
    </main>
  );
}

export default Login;