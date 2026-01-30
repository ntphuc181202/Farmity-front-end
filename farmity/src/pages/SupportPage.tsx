import "../styles/support.css";

export default function SupportPage() {
  return (
    <div className="support-page">
      <div className="support-header">
        <h1>Support & Troubleshooting</h1>
        <p>Need help? Start here before contacting us.</p>
      </div>

      <div className="support-sections">
        <section className="support-card">
          <h2>Installation Issues</h2>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Problems
            during installation can usually be solved by checking system
            requirements and reinstalling the game.
          </p>
        </section>

        <section className="support-card">
          <h2>Performance Problems</h2>
          <p>
            Reduce graphics settings, close background applications, and make
            sure your GPU drivers are updated.
          </p>
        </section>

        <section className="support-card">
          <h2>Bug Reports</h2>
          <p>
            If you encounter a bug, please include screenshots and a detailed
            description when contacting the support team.
          </p>
        </section>
      </div>
    </div>
  );
}
