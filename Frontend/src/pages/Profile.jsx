import UserProfile from '../features/auth/components/UserProfile';
import '../styles/Profile.css';

function Profile() {
  return (
    <main className="profile-page-container">
      <div className="profile-content-wrapper">
        <UserProfile />
      </div>
    </main>
  );
}

export default Profile;