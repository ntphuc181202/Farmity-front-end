import "./home.css";

export default function HomePage() {
  return (
    <div className="home">
  

      {/* HERO */}
      <section className="hero">
        <div className="hero-content">
          <h1>Farm Game: The Peaceful Farmstead</h1>
          <p>
            A relaxing pixel-style farming adventure where you build your
            dream homestead, explore the countryside, and live a peaceful life.
          </p>
        </div>
      </section>

      {/* ABOUT */}
      <section className="about">
        <div className="about-inner">
          <h2>Welcome to Your Peaceful Life</h2>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ut
            libero vitae lacus tincidunt fermentum. Integer non sapien at lacus
            tempor malesuada.
          </p>
        </div>
      </section>

      {/* BLOG PREVIEW */}
      <section className="preview">
        <h2>Latest Blog Posts</h2>
        <div className="card-grid">
          <div className="card">
            <h3>Dev Diary #1</h3>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          </div>
          <div className="card">
            <h3>Pixel Art Update</h3>
            <p>Quisque sit amet est et sapien ullamcorper pharetra.</p>
          </div>
          <div className="card">
            <h3>Gameplay Systems</h3>
            <p>Donec vel mauris quam. Nulla facilisi.</p>
          </div>
        </div>
      </section>

      {/* NEWS PREVIEW */}
      <section className="preview alt">
        <h2>Latest News & Announcements</h2>
        <div className="card-grid">
          <div className="card small">
            <h4>Version 0.1 Released</h4>
            <p>Lorem ipsum dolor sit amet.</p>
          </div>
          <div className="card small">
            <h4>New Characters Added</h4>
            <p>Aliquam tincidunt mauris eu risus.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <h2>Start Your Farming Journey Today</h2>
        <button className="cta-btn">Get The Game</button>
      </section>
    </div>
  );
}
