import { useState } from "react";
import WelcomeFooter from "../components/WelcomeFooter";
import WelcomeIntro from "../components/WelcomeIntro";
import WelcomeNavbar from "../components/WelcomeNavbar";
import WelcomeMediaSection from "../components/WelcomeMediaSection";
import HeroSection from "../components/HeroSection";
import FeatureSection from "../components/FeatureSection";
import JourneySection from "../components/JourneySection";
import InsightsSection from "../components/InsightsSection";
import CtaSection from "../components/CtaSection";
import "../welcome.css";

const WelcomePage = () => {
  const [showIntro, setShowIntro] = useState(true);

  return (
    <div className="welcome-page">
      {showIntro ? <WelcomeIntro onFinish={() => setShowIntro(false)} /> : null}
      <WelcomeNavbar />
      <main>
        <WelcomeMediaSection />
        <HeroSection />
        <FeatureSection />
        <JourneySection />
        <InsightsSection />
        <CtaSection />
      </main>
      <WelcomeFooter />
    </div>
  );
};

export default WelcomePage;
