import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

const AppFooter = () => {
  const { language, languages } = useLanguage();
  const currentLanguage = languages.find((item) => item.code === language)?.label || "English";

  return (
    <footer className="app-footer-wrap">
      <div className="app-footer">
        <div className="footer-brand">
          <strong>AgroVeda</strong>
          <p>
            Helping farmers and consumers connect through learning, storage, trade, and
            order management.
          </p>
        </div>

        <div className="footer-links">
          <div>
            <h4>Quick Links</h4>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/marketplace">Marketplace</Link>
            <Link to="/orders">Orders</Link>
          </div>
          <div>
            <h4>Support</h4>
            <Link to="/service/course">Courses</Link>
            <Link to="/service/storage">Storage</Link>
            <Link to="/profile">Profile</Link>
            <Link to="/admin/login">Admin Login</Link>
          </div>
          <div>
            <h4>Current Language</h4>
            <p>{currentLanguage}</p>
            <p>Automatic translation enabled</p>
          </div>
        </div>
      </div>
      <div className="footer-bottom">AgroVeda © 2026. All rights reserved.</div>
    </footer>
  );
};

export default AppFooter;
