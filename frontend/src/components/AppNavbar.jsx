import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

const AppNavbar = () => {
  const { session, logout } = useAuth();
  const { language, setLanguage, languages } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const links = session
    ? [
        { to: "/dashboard", label: "Dashboard" },
        { to: "/profile", label: "Profile" },
      ]
    : [{ to: "/auth", label: "Login" }];

  const showBackButton =
    session &&
    !["/dashboard", "/auth", "/admin/login", "/admin"].includes(location.pathname);

  return (
    <header className="app-navbar-wrap">
      <div className="app-navbar">
        <div className="nav-brand-group">
          {showBackButton ? (
            <button
              type="button"
              className="nav-back-button"
              onClick={() => navigate(-1)}
              aria-label="Go back"
              title="Go back"
            >
              ←
            </button>
          ) : null}

          <NavLink to={session ? "/dashboard" : "/auth"} className="brand-block">
            <span className="brand-badge">AV</span>
            <div>
              <strong>AgroVeda</strong>
              <span>Smart agriculture workspace</span>
            </div>
          </NavLink>
        </div>

        <nav className="nav-links">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="nav-controls">
          <label className="language-control">
            <select value={language} onChange={(e) => setLanguage(e.target.value)}>
              {languages.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          {session && (
            <button type="button" className="btn btn-secondary nav-signout" onClick={logout}>
              Sign Out
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default AppNavbar;
