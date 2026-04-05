import { Link } from "react-router-dom";

const WelcomeNavbar = () => {
  return (
    <header className="welcome-navbar">
      <div className="welcome-navbar__inner">
        <Link to="/" className="welcome-brand">
          <span className="welcome-brand__mark">AV</span>
          <span>
            <strong>AgroVeda</strong>
            <small>Ancient wisdom, modern farming</small>
          </span>
        </Link>

        <nav className="welcome-navlinks" aria-label="Welcome navigation">
          <a href="#features">Features</a>
          <a href="#journey">Journey</a>
          <a href="#insights">Insights</a>
          <a href="#cta">Start</a>
        </nav>

        <div className="welcome-navbar__actions">
          <Link to="/admin/login" className="welcome-pill welcome-pill--ghost">
            Admin
          </Link>
          <Link to="/auth" className="welcome-pill">
            Login / Register
          </Link>
        </div>
      </div>
    </header>
  );
};

export default WelcomeNavbar;
