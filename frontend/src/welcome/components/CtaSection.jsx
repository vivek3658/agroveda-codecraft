import { Link } from "react-router-dom";

const CtaSection = () => {
  return (
    <section className="welcome-cta" id="cta">
      <div className="welcome-cta__content">
        <p className="welcome-section-tag welcome-section-tag--light">Get Started</p>
        <h2>Bring your farm operations into one calm, intelligent workspace.</h2>
        <p>
          Start with a user account to access crop tools, the marketplace, storage,
          learning resources, and the new soil report assistant.
        </p>
        <div className="welcome-hero__actions">
          <Link to="/auth" className="welcome-pill">
            Login / Register
          </Link>
          <Link to="/admin/login" className="welcome-pill welcome-pill--ghost-light">
            Admin Access
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CtaSection;
