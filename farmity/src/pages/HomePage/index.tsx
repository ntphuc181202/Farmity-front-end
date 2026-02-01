import styles from "./home.module.scss";

export default function HomePage() {
  return (
    <div className={styles.home}>
      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1>Farm Game: The Peaceful Farmstead</h1>
          <p>
            A relaxing pixel-style farming adventure where you build your
            dream homestead, explore the countryside, and live a peaceful life.
          </p>
        </div>
      </section>

      {/* ABOUT */}
      <section className={styles.about}>
        <div className={styles.aboutInner}>
          <h2>Welcome to Your Peaceful Life</h2>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ut
            libero vitae lacus tincidunt fermentum. Integer non sapien at lacus
            tempor malesuada.
          </p>
        </div>
      </section>

      {/* BLOG PREVIEW */}
      <section className={styles.preview}>
        <h2>Latest Blog Posts</h2>
        <div className={styles.cardGrid}>
          <div className={styles.card}>
            <h3>Dev Diary #1</h3>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          </div>
          <div className={styles.card}>
            <h3>Pixel Art Update</h3>
            <p>Quisque sit amet est et sapien ullamcorper pharetra.</p>
          </div>
          <div className={styles.card}>
            <h3>Gameplay Systems</h3>
            <p>Donec vel mauris quam. Nulla facilisi.</p>
          </div>
        </div>
      </section>

      {/* NEWS PREVIEW */}
      <section className={`${styles.preview} ${styles.alt}`}>
        <h2>Latest News & Announcements</h2>
        <div className={styles.cardGrid}>
          <div className={`${styles.card} ${styles.small}`}>
            <h4>Version 0.1 Released</h4>
            <p>Lorem ipsum dolor sit amet.</p>
          </div>
          <div className={`${styles.card} ${styles.small}`}>
            <h4>New Characters Added</h4>
            <p>Aliquam tincidunt mauris eu risus.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.cta}>
        <h2>Start Your Farming Journey Today</h2>
        <button className={styles.ctaBtn}>Get The Game</button>
      </section>
    </div>
  );
}
