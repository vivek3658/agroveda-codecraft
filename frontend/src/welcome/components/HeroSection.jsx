import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="welcome-hero">
      <div className="welcome-hero__content">
        <p className="welcome-section-tag welcome-section-tag--light">
          Ancient Wisdom Meets Smart Agriculture
        </p>
        <h1>Turn reports, market signals, and farm data into better decisions.</h1>
        <p className="welcome-hero__copy">
          AgroVeda helps farmers and buyers move from guesswork to clarity with crop
          tracking, soil intelligence, marketplace access, storage discovery, and
          guided learning in one green workspace.
        </p>

        <div className="welcome-hero__actions">
          <Link to="/auth" className="welcome-pill">
            Start with AgroVeda
          </Link>
          <a href="#features" className="welcome-pill welcome-pill--ghost-light">
            Explore Features
          </a>
        </div>

        <div className="welcome-hero__metrics">
          <article>
            <strong>24/7</strong>
            <span>digital farm access</span>
          </article>
          <article>
            <strong>6</strong>
            <span>core service modules</span>
          </article>
          <article>
            <strong>1</strong>
            <span>unified agriculture workspace</span>
          </article>
        </div>
      </div>

      <div className="welcome-hero__visual">
        <div className="welcome-orb welcome-orb--primary" />
        <div className="welcome-orb welcome-orb--secondary" />
        <div className="welcome-visual-card">
          <p>Live Farm Stack</p>
          <div className="welcome-visual-card__grid">
            <span>Crop Records</span>
            <span>Soil Assistant</span>
            <span>Market Orders</span>
            <span>Storage Finder</span>
            <span>Farmer Analytics</span>
            <span>Learning Hub</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
