import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

function WikiPage() {
  const base = import.meta.env.BASE_URL ?? "/";

  const data = [
    {
      title: "Basics",
      items: [
        "Getting Started",
        "The Player",
        "Controls",
        "Energy",
        "Health",
        "Skills",
        "Day Cycle",
        "Inventory",
        "Farm Maps",
      ],
    },
    {
      title: "The Farm",
      items: [
        "Crops",
        "Shipping",
        "Animals",
        "Fruit Trees",
        "Artisan Goods",
        "Farmhouse",
        "The Cave",
        "Greenhouse",
        "Cabin",
      ],
    },
    {
      title: "Environment",
      items: [
        "Weather",
        "Seasons",
        "Spring",
        "Summer",
        "Fall",
        "Winter",
        "Festivals",
        "Monsters",
        "Television",
      ],
    },
    {
      title: "Gameplay",
      items: [
        "Villagers",
        "Friendship",
        "Marriage",
        "Children",
        "Quests",
        "Bundles",
        "Achievements",
        "Multiplayer",
        "Modding",
      ],
    },
  ];

  const items = [
    "Tools",
    "Weapons",
    "Hats",
    "Footwear",
    "Rings",
    "Foraging",
    "Fish",
    "Bait",
    "Tackle",
    "Fertilizer",
    "Cooking",
    "Crafting",
    "Trees",
    "Secret Notes",
    "Books",
    "Artifacts",
    "Minerals",
    "Furniture",
    "Wallpaper",
    "Flooring",
  ];

  const places = [
    "Pelican Town",
    "Cindersap Forest",
    "The Desert",
    "Ginger Island",
    "The Mines",
  ];

  return (
    <div className="blog-page-bg min-h-screen py-4">
      <div className="max-w-[900px] mx-auto px-4">
        {/* HEADER */}
        <header className="mb-10 flex flex-col items-center">
          <img
            src={`${base}img/logo.png`}
            alt="Game Logo"
            className="h-24 sm:h-32 md:h-[200px] mb-6"
          />
        </header>

        {/* WIKI */}
        <article className="blog-article-frame">
          <div className="container mt-3">
            <div className="row">
              {/* LEFT - ABOUT */}
              <div className="col-md-12">
                <div className="card border-success">
                  <div className="card-header bg-success text-white fw-bold text-center">
                    About
                  </div>

                  <div className="card-body d-flex">
                    {/* Image */}
                    <img
                      src="/mediawiki/images/a/af/Horse_rider.png"
                      alt="horse"
                      style={{ width: 80, height: "auto", marginRight: 15 }}
                    />

                    {/* Text */}
                    <p className="mb-0">
                      Stardew Valley is an open-ended country-life RPG! You’ve
                      inherited your grandfather’s old farm plot in Stardew
                      Valley. Armed with hand-me-down tools and a few coins, you
                      set out to begin your new life. Can you learn to live off
                      the land and turn these overgrown fields into a thriving
                      home? It won’t be easy. Ever since Joja Corporation came
                      to town, the old ways of life have all but disappeared.
                      The community center, once the town’s most vibrant hub of
                      activity, now lies in shambles. But the valley seems full
                      of opportunity. With a little dedication, you might just
                      be the one to restore Stardew Valley to greatness!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* BASIC */}
          <div className="container-fluid mt-3">
            <div className="row">
              {data.map((col, index) => (
                <div className="col-md-3 mb-3" key={index}>
                  <div className="card border-success h-100">
                    {/* HEADER */}
                    <div className="card-header bg-success text-white fw-bold text-center">
                      {col.title}
                    </div>

                    {/* BODY */}
                    <div className="card-body">
                      <ul className="list-unstyled mb-0">
                        {col.items.map((item, i) => (
                          <li
                            key={i}
                            className="d-flex align-items-center mb-2"
                          >
                            <img
                              src="https://stardewvalleywiki.com/mediawiki/images/8/88/Chicken.png"
                              alt=""
                              style={{ width: 24, marginRight: 10 }}
                            />
                            <a href="#" className="text-decoration-none">
                              {item}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ITEMS */}
          <div className="container-fluid mt-3">
            <div className="card border-success">
              <div className="card-header bg-success text-white fw-bold text-center">
                Items
              </div>

              <div className="card-body">
                <div className="row">
                  {items.map((item, i) => (
                    <div className="col-md-3 mb-2" key={i}>
                      <a href="#" className="text-decoration-none">
                        {item}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* PLACES */}
          <div className="container-fluid mt-3 mb-3">
            <div className="card border-success">
              <div className="card-header bg-success text-white fw-bold text-center">
                The Valley Beyond the Valley
              </div>

              <div className="card-body">
                <div className="row">
                  {places.map((place, i) => (
                    <div className="col-md-4 mb-2" key={i}>
                      <a href="#" className="text-decoration-none">
                        {place}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}

export default WikiPage;
