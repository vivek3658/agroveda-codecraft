import { useEffect, useMemo, useRef } from "react";
import gsap from "gsap";

const WelcomeIntro = ({ onFinish }) => {
  const overlayRef = useRef(null);
  const lotusRef = useRef(null);
  const glowRef = useRef(null);
  const titleRef = useRef(null);
  const dividerRef = useRef(null);
  const subtitleRef = useRef(null);
  const petalsRef = useRef([]);
  const exitAnimRef = useRef(null);
  const onFinishRef = useRef(onFinish);

  const PETAL_COUNT = 10;
  const PARTICLE_COUNT = 16;
  const BASE_Y = -50;

  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  const particles = useMemo(
    () =>
      Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 7,
        duration: 8 + Math.random() * 10,
        size: 4 + Math.random() * 11,
        opacity: 0.1 + Math.random() * 0.22,
        rotation: Math.random() * 360,
        sway: 15 + Math.random() * 35,
      })),
    []
  );

  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        exitAnimRef.current = gsap.timeline({
          onComplete: () => onFinishRef.current?.(),
        });

        exitAnimRef.current.to(
          lotusRef.current,
          {
            scale: 14,
            duration: 1.5,
            ease: "power3.inOut",
          },
          0
        );

        exitAnimRef.current.to(
          overlayRef.current,
          {
            opacity: 0,
            duration: 0.8,
            ease: "power2.inOut",
          },
          0.6
        );
      },
    });

    petalsRef.current.forEach((petal, i) => {
      if (!petal) {
        return;
      }

      const isBack = i % 2 === 0;

      tl.fromTo(
        petal,
        { scale: 0.12, opacity: 0, y: BASE_Y + 30, filter: "blur(6px)" },
        {
          scale: 1,
          opacity: isBack ? 0.6 : 0.95,
          y: BASE_Y + (isBack ? -4 : -16),
          filter: "blur(0px)",
          duration: 1.3,
          ease: "back.out(1.7)",
        },
        i * 0.09
      );
    });

    tl.fromTo(
      glowRef.current,
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.9, ease: "power2.out" },
      0.3
    );

    const pulse = gsap.to(glowRef.current, {
      scale: 1.18,
      opacity: 0.72,
      duration: 1.5,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });

    tl.fromTo(
      titleRef.current,
      { opacity: 0, y: 32, filter: "blur(8px)" },
      { opacity: 1, y: 0, filter: "blur(0px)", duration: 1, ease: "power3.out" },
      0.85
    );

    tl.fromTo(
      dividerRef.current,
      { opacity: 0, scaleX: 0 },
      { opacity: 1, scaleX: 1, duration: 0.6, ease: "power2.out" },
      1.05
    );

    tl.fromTo(
      subtitleRef.current,
      { opacity: 0, y: 22, filter: "blur(5px)" },
      { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.85, ease: "power3.out" },
      1.2
    );

    tl.to(
      [titleRef.current, dividerRef.current, subtitleRef.current],
      {
        opacity: 0,
        scale: 0.85,
        duration: 0.5,
        ease: "power2.in",
      },
      2.1
    );

    tl.to(
      glowRef.current,
      {
        scale: 2,
        opacity: 0,
        duration: 0.6,
        ease: "power2.in",
        onComplete: () => pulse.kill(),
      },
      2.1
    );

    tl.to({}, { duration: 0.6 });

    return () => {
      tl.kill();
      pulse.kill();
      exitAnimRef.current?.kill();
    };
  }, [BASE_Y]);

  return (
    <div ref={overlayRef} className="w-overlay" role="status" aria-label="Loading">
      <div className="w-bg-blob w-bg-blob--a" aria-hidden="true" />
      <div className="w-bg-blob w-bg-blob--b" aria-hidden="true" />
      <div className="w-vignette" aria-hidden="true" />
      <div className="w-bg-breathe" aria-hidden="true" />

      {particles.map((p) => (
        <div
          key={p.id}
          className="w-particle"
          aria-hidden="true"
          style={{
            left: `${p.left}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            width: `${p.size}px`,
            height: `${p.size * 1.5}px`,
            "--po": p.opacity,
            "--pr": `${p.rotation}deg`,
            "--ps": `${p.sway}px`,
          }}
        />
      ))}

      <div className="w-lotus-perspective" aria-hidden="true">
        <div ref={lotusRef} className="w-lotus">
          {Array.from({ length: PETAL_COUNT }).map((_, i) => {
            const angle = (360 / PETAL_COUNT) * i;
            const isBack = i % 2 === 0;

            return (
              <div
                key={i}
                className="w-petal-arm"
                style={{ transform: `rotate(${angle}deg)` }}
              >
                <div
                  ref={(el) => {
                    petalsRef.current[i] = el;
                  }}
                  className={`w-petal ${isBack ? "w-petal--back" : "w-petal--front"}`}
                  style={{
                    transform: `translateX(-50%) translateY(${BASE_Y}px) rotateX(${isBack ? -18 : -38}deg)`,
                  }}
                />
              </div>
            );
          })}

          <div ref={glowRef} className="w-glow">
            <div className="w-glow__core" />
            <div className="w-glow__ring" />
          </div>

          <div className="w-lotus-shadow" />
        </div>
      </div>

      <div className="w-text">
        <h1 ref={titleRef} className="w-title">
          AgroVeda
        </h1>
        <div ref={dividerRef} className="w-divider" />
        <p ref={subtitleRef} className="w-subtitle">
          Blending Nature with Intelligence
        </p>
      </div>
    </div>
  );
};

export default WelcomeIntro;
