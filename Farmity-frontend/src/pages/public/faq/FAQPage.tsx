function FAQPage() {
    const base = import.meta.env.BASE_URL || "/";
  
    return (
      <div className="blog-page-bg min-h-screen py-4">
        <div className="max-w-[900px] mx-auto px-4">
  
          {/* HEADER */}
  
          <header className="mb-10 flex flex-col items-center">
            <img
              src={`${base}img/logo.png`}
              alt="Logo"
              className="h-24 sm:h-32 md:h-[200px] mb-6"
            />
          </header>
  
          {/* FAQ */}
  
          <article className="blog-article-frame">
            <div className="px-4 py-4 text-[#5a3b19] leading-relaxed">
  
              <h1 className="text-xl font-bold mb-6">
                Frequently Asked Questions
              </h1>
  
              <h2 className="font-bold text-lg mb-2">
                What is the game?
              </h2>
  
              <p className="mb-5 text-sm">
                This is a country-life RPG available on multiple platforms
                including PC, consoles and mobile.
              </p>
  
              <h2 className="font-bold text-lg mb-2">
                Who made it?
              </h2>
  
              <p className="mb-5 text-sm">
                The game was developed by a solo developer over several years.
              </p>
  
              <h2 className="font-bold text-lg mb-2">
                Who is the publisher?
              </h2>
  
              <p className="mb-5 text-sm">
                The game is self-published across most platforms.
              </p>
  
              <h2 className="font-bold text-lg mb-2">
                Does the game support controllers?
              </h2>
  
              <p className="mb-5 text-sm">
                Yes. Xbox and PlayStation controllers are supported on PC,
                and consoles have full controller support.
              </p>
  
              <h2 className="font-bold text-lg mb-2">
                What languages are supported?
              </h2>
  
              <p className="mb-5 text-sm">
                The game supports many languages including English, Spanish,
                Japanese, Chinese and Korean.
              </p>
  
              <h2 className="font-bold text-lg mb-2">
                Can I post videos of the game?
              </h2>
  
              <p className="mb-5 text-sm">
                Yes, you are free to create videos or other content featuring
                the game.
              </p>
  
              <h2 className="font-bold text-lg mb-2">
                What language was the game coded in?
              </h2>
  
              <p className="mb-5 text-sm">
                C#.
              </p>
  
              <h2 className="font-bold text-lg mb-2">
                I'm having technical issues. How do I fix it?
              </h2>
  
              <p className="text-sm">
                Please check the{" "}
                <a
                  href="/troubleshooting"
                  className="text-blue-700 underline font-semibold"
                >
                  Troubleshooting Guide
                </a>
              </p>
  
            </div>
          </article>
  
        </div>
      </div>
    );
  }
  
  export default FAQPage;