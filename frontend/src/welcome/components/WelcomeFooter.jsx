import { Link } from "react-router-dom";

const WelcomeFooter = () => {
  return (
    <footer className="welcome-footer">
      <div className="welcome-footer__inner">
        <div>
          <p className="welcome-section-tag">AgroVeda</p>
          <h3>Made for mindful, data-driven agriculture.</h3>
          <p>
            Bring together crop operations, marketplace access, storage discovery,
            soil intelligence, and guided learning in one workspace.
          </p>
        </div>

        <div className="welcome-footer__links">
          <div>
            <h4>Explore</h4>
            <a href="#features">Platform Features</a>
            <a href="#journey">How It Works</a>
            <a href="#insights">Farmer Insights</a>
          </div>
          <div>
            <h4>Access</h4>
            <Link to="/auth">User Login</Link>
            <Link to="/admin/login">Admin Login</Link>
            <Link to="/auth">Create Account</Link>
          </div>
        </div>
      </div>
      <div className="welcome-footer__bottom">AgroVeda © 2026</div>
    </footer>
  );
};

export default WelcomeFooter;
