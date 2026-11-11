import { Rocket } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="content-wrapper site-footer-inner">
        <div className="footer-brand">
          <Rocket size={16} color="var(--accent)" />
          <span>LaunchBoard</span>
          <span className="footer-badge">· Where bootcamp projects go live</span>
        </div>

        <div className="footer-badge">
          Built live at NilePixel Bootcamp
        </div>
      </div>
    </footer>
  );
}
