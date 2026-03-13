function TroubleshootingPage() {
    const base = import.meta.env.BASE_URL || "/";
  
    return (
      <div className="blog-page-bg min-h-screen py-4">
        <div className="max-w-[900px] mx-auto px-4">
  
          {/* LOGO */}
  
          <header className="mb-10 flex flex-col items-center">
            <img
              src={`${base}img/logo.png`}
              alt="Logo"
              className="h-24 sm:h-32 md:h-[200px] mb-6"
            />
          </header>
  
          {/* ARTICLE */}
  
          <article className="blog-article-frame">
  
            <div className="px-4 py-4 text-[#5a3b19] leading-relaxed">
  
              <h1 className="text-xl font-bold mb-6">
                Troubleshooting Guide
              </h1>
  
              <p className="mb-6 text-sm">
                If you are having technical problems with the game on PC,
                please check the following list for your issue.
              </p>
  
              <h2 className="font-bold mt-6 mb-2">
                My save file is no longer showing in the Load Game menu
              </h2>
  
              <p className="mb-4 text-sm">
                This can happen for a variety of reasons, but often the save file
                can be repaired or salvaged.
              </p>
  
              <h2 className="font-bold mt-6 mb-2">
                I'm having trouble connecting to multiplayer
              </h2>
  
              <p className="mb-4 text-sm">
                Please check the Multiplayer Troubleshooting Guide.
              </p>
  
              <h2 className="font-bold mt-6 mb-2">
                Game is not launching on PC
              </h2>
  
              <ul className="list-disc pl-6 text-sm mb-6">
                <li>Delete the startup_preferences folder in %AppData%</li>
                <li>Make sure you have .NET installed</li>
                <li>Verify the game files in Steam</li>
              </ul>
  
              <h2 className="font-bold mt-6 mb-2">
                Game is not launching on Mac
              </h2>
  
              <div className="bg-[#f5dba5] p-3 rounded text-sm font-mono mb-4">
                sudo chown -v "$USER" ~/.config
              </div>
  
              <p className="text-sm mb-6">
                This command will correct the ownership of a folder that the game
                needs to write under.
              </p>
  
              <h2 className="font-bold mt-6 mb-2">
                Can't find friends' farms in multiplayer
              </h2>
  
              <p className="text-sm mb-6">
                Make sure you are launching the game from Steam or GOG and check
                your firewall settings.
              </p>
  
              <h2 className="font-bold mt-6 mb-2">
                There's no sound
              </h2>
  
              <p className="text-sm mb-6">
                Make sure your audio device is plugged in and enabled.
              </p>
  
              <h2 className="font-bold mt-6 mb-2">
                My controller doesn't work
              </h2>
  
              <p className="text-sm">
                Try enabling Steam Input or resetting controller configuration.
              </p>
  
            </div>
  
          </article>
  
        </div>
      </div>
    );
  }
  
  export default TroubleshootingPage;