function DownloadPage() {
    const base = import.meta.env.BASE_URL ?? "/";
  
    return (
      <div className="blog-page-bg min-h-screen py-4">
        <div className="max-w-[900px] mx-auto px-4">
  
          {/* HEADER */}
          <header className="mb-10 flex flex-col items-center">
                <img
                  src={`${base}img/herologo.png`}
              alt="Game Logo"
              className="h-24 sm:h-32 md:h-[200px] mb-6"
            />
          </header>
  
          {/* DOWNLOAD */}
          <article className="blog-article-frame">
            <div className="px-4 py-4 text-[#5a3b19] leading-relaxed">
  
              <h1 className="text-xl font-bold mb-6">
                Download the Game
              </h1>
  
              <p className="text-sm mb-6">
                Choose your platform below to download and start playing.
              </p>
  
              {/* DOWNLOAD OPTIONS */}
              <div className="flex flex-col gap-4">
  
                <button
                  className="bg-[#d48a2a] text-white font-semibold py-3 px-4 rounded hover:bg-[#b86e19]"
                >
                  Download for Windows
                </button>
  
                <button
                  className="bg-[#d48a2a] text-white font-semibold py-3 px-4 rounded hover:bg-[#b86e19]"
                >
                  Download for Mac
                </button>
  
                <button
                  className="bg-[#d48a2a] text-white font-semibold py-3 px-4 rounded hover:bg-[#b86e19]"
                >
                  Download for Linux
                </button>
  
              </div>
  
              {/* SYSTEM REQUIREMENTS */}
              <div className="mt-8 text-sm">
  
                <p className="font-semibold mb-2">
                  System Requirements
                </p>
  
                <ul className="list-disc pl-6 space-y-1">
                  <li>OS: Windows 10 / macOS / Linux</li>
                  <li>Processor: 2 GHz</li>
                  <li>Memory: 2 GB RAM</li>
                  <li>Storage: 1 GB available space</li>
                </ul>
  
              </div>
  
            </div>
          </article>
  
        </div>
      </div>
    );
  }
  
  export default DownloadPage;