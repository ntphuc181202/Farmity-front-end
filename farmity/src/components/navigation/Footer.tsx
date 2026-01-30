import { Link } from "react-router-dom";
import "../../styles/footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <h3>Farm Game: The Peaceful Farmstead</h3>
          <p>A cozy pixel farming adventure.</p>
        </div>

        <div className="footer-links">
          <div>
            <h4>Community</h4>
            <ul>
              <li><Link to="/blog">Blog</Link></li>
              <li><Link to="/news">News</Link></li>
              <li><Link to="/media">Media</Link></li>
            </ul>
          </div>

          <div>
            <h4>Support</h4>
            <ul>
              <li><Link to="/faq">FAQ</Link></li>
              <li><Link to="/support">Support & Troubleshooting</Link></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        © 2026 The Peaceful Farmstead Team — All rights reserved.
      </div>
    </footer>
  );
}
