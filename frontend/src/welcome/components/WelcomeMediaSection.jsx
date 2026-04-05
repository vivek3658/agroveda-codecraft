const WelcomeMediaSection = () => {
  return (
    <section className="welcome-media-band">
      <div className="welcome-media-hero">
        <video
          className="welcome-media-hero__video"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
        >
          <source src="/hero.mp4" type="video/mp4" />
        </video>

        <div className="welcome-media-hero__overlay" />

        <div className="welcome-media-hero__content">
          <p className="welcome-section-tag welcome-section-tag--light">
            AgroVeda Welcome
          </p>
          <h2>Farming begins with calm vision, clean tools, and a living landscape.</h2>
          <p>
            A full-width hero video now sits under the navbar to carry the welcome
            page visually before the rest of the sections begin.
          </p>
        </div>
      </div>
    </section>
  );
};

export default WelcomeMediaSection;
