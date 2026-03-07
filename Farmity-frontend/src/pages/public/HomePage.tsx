import { useState, useEffect, useRef } from "react";

const FEATURE_IMAGES = [
  "feature.png",
  "feature2.png",
  "feature3.png",
  "feature4.png",
  "feature5.png",
  "feature6.png",
  "feature7.png",
] as const;

const FEATURES = [
  {
    title: "Create the farm of your dreams",
    desc: "Turn your overgrown fields into a lively and bountiful farm!",
  },
  {
    title: "Learn to live off the land",
    desc: "Raise animals, go fishing, tend to crops, craft items, or do it all! The choice is yours.",
  },
  {
    title: "Become a part of the local community",
    desc: "Pelican Town is home to over 30 residents you can befriend!",
  },
  {
    title: "Meet someone special",
    desc: "With 12 townsfolk to date, you may even find someone to start a family with!",
  },
  {
    title: "Explore vast, mysterious caves",
    desc: "Encounter dangerous monsters & valuable treasures deep underground!",
  },
  {
    title: "Customize",
    desc: "There are hundreds of character & home decoration options to choose from!",
  },
  {
    title: "Relax at your own pace",
    desc: "No time limits, no pressure — every day is what you make of it.",
  },
] as const;

function HomePage() {
  const [slide, setSlide] = useState(0);
  const [parallaxY, setParallaxY] = useState(0);
  const heroRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const t = setInterval(
      () => setSlide((s) => (s + 1) % FEATURES.length),
      2000,
    );
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      setParallaxY(scrollY * 0.2);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const base = import.meta.env.BASE_URL;

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-stardew-bg overflow-hidden">
      <section className="relative min-h-[115vh] overflow-hidden" ref={heroRef}>
        {/* Background */}
        <div
          className="absolute inset-0 z-0 overflow-hidden"
          style={{
            transform: `translateY(${parallaxY}px)`,
          }}
        >
          <img
            src={`${base}img/stardewbackground.png`}
            alt=""
            aria-hidden
            className="w-full h-[100%] object-cover object-bottom"
            style={{
              transform: "translateY(-22%)",
            }}
          />
        </div>

        {/* Cloud */}
        <img
          src={`${base}img/cloud.png`}
          alt=""
          aria-hidden
          className="pointer-events-none absolute top-20 left-[-300px] w-[900px] opacity-25 z-[1] animate-cloud"
        />

        {/* Bird */}
        <img
          src={`${base}img/stardew_bird.gif`}
          alt=""
          aria-hidden
          className="pointer-events-none absolute top-[55%] left-1/2 w-[100px] -translate-y-1/2 z-[2] animate-bird"
        />

        {/* Overlay Content */}
        <div className="relative z-10 flex flex-col min-h-[115vh]">
          {/* Logo */}
          <div className="flex-1 flex items-center justify-center pt-20 sm:pt-24 md:pt-28">
            <img
              src={`${base}img/logo.png`}
              alt="Stardewvalley"
              className="h-28 sm:h-36 md:h-48 lg:h-56 xl:h-64 w-auto drop-shadow-[0_8px_30px_rgba(0,0,0,0.6)]"
            />
          </div>

          {/* Banner */}
          <div className="relative w-full translate-y-6 sm:translate-y-10 md:translate-y-14">
            <img
              src={`${base}img/banner.png`}
              alt="Farm landscape"
              className="w-full h-[220px] sm:h-[300px] md:h-[420px] lg:h-[520px] object-cover object-bottom"
            />
          </div>
        </div>
      </section>

      <div className="bg-[#fef6ad]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8 sm:space-y-10">
          <section className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0d5e9c] mb-2">
              You&apos;re moving to the Valley...
            </h2>
            <p className="text-[0.98rem] sm:text-base text-stardew-brown-soft leading-relaxed">
              You&apos;ve inherited your grandfather&apos;s old farm plot in
              Stardew Valley. Armed with hand-me-down tools and a few coins, you
              set out to begin your new life!
            </p>
          </section>

          <section>
            <div className="rounded-lg overflow-hidden mb-4 max-w-2xl mx-auto relative">
              <div className="relative aspect-[4/3] sm:aspect-video bg-stardew-green-dark/10">
                <img
                  src={`${base}img/${FEATURE_IMAGES[slide]}`}
                  alt={`Feature ${slide + 1}: ${FEATURES[slide].title}`}
                  className="w-full h-full object-cover object-center block"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-white" />
              </div>
              <button
                type="button"
                onClick={() =>
                  setSlide((s) => (s - 1 + FEATURES.length) % FEATURES.length)
                }
                className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors"
                aria-label="Previous slide"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setSlide((s) => (s + 1) % FEATURES.length)}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors"
                aria-label="Next slide"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
            <h3 className="text-xl font-bold text-[#0d5e9c] mb-3 text-center mt-6">
              Features
            </h3>
            <ul className="space-y-1.5 text-[0.98rem] text-stardew-brown-soft leading-relaxed">
              {FEATURES.map((item) => (
                <li key={item.title}>
                  <span className="font-semibold text-[#0d5e9c]">
                    {item.title}:
                  </span>{" "}
                  {item.desc}
                </li>
              ))}
            </ul>
          </section>

          <section className="text-center pt-2">
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-4">
              {[
                "Steam",
                "Humble",
                "GOG.com",
                "Xbox One",
                "PS4",
                "Switch",
                "iOS",
                "Android",
              ].map((store) => (
                <span
                  key={store}
                  className="px-2.5 py-1 rounded text-xs sm:text-sm font-medium text-stardew-brown-soft"
                >
                  {store}
                </span>
              ))}
            </div>
            <p className="text-[0.75rem] text-stardew-brown-soft">
              This is a fanmade landing page inspired by{" "}
              <a
                href="https://www.Stardewvalley.net/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#0d5e9c] underline"
              >
                Stardew Valley
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default HomePage;

