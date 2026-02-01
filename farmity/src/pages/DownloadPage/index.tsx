import "./download.css";

export default function DownloadPage() {
  return (
    <div className="download">

      {/* HERO DOWNLOAD */}
      <section className="download-hero">
        <h1>Download The Game</h1>
        <p>Latest version: <strong>v0.1.0 Alpha</strong></p>
        <button className="download-btn">Download for Windows</button>
        <p className="build-note">File size: 850MB • Last updated: Jan 2026</p>
      </section>

      {/* REQUIREMENTS */}
      <section className="requirements">
        <h2>System Requirements</h2>
        <div className="req-grid">

          <div className="req-card">
            <h3>Minimum</h3>
            <ul>
              <li>OS: Windows 10</li>
              <li>CPU: Intel i3 / Ryzen 3</li>
              <li>RAM: 4 GB</li>
              <li>GPU: Integrated Graphics</li>
              <li>Storage: 2 GB available space</li>
            </ul>
          </div>

          <div className="req-card recommended">
            <h3>Recommended</h3>
            <ul>
              <li>OS: Windows 11</li>
              <li>CPU: Intel i5 / Ryzen 5</li>
              <li>RAM: 8 GB</li>
              <li>GPU: GTX 1050 or equivalent</li>
              <li>Storage: SSD recommended</li>
            </ul>
          </div>

        </div>
      </section>

      {/* INSTALLATION */}
      <section className="installation">
        <h2>Installation Guide</h2>
        <ol>
          <li>Download the installer file using the button above.</li>
          <li>Extract the ZIP file to your desired location.</li>
          <li>Run <strong>Farmstead.exe</strong>.</li>
          <li>Allow Windows firewall access if prompted.</li>
          <li>Log in and start your farming journey.</li>
        </ol>
      </section>

      {/* NOTES */}
      <section className="notes">
        <h2>Notes & Troubleshooting</h2>
        <p>
          If the game does not launch, ensure your drivers are updated and
          antivirus software is not blocking the executable.
        </p>
      </section>

    </div>
  );
}
