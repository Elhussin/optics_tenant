// src/components/layout/Footer.tsx
export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        &copy; {new Date().getFullYear()} Solo Vizion. All rights reserved.
      </div>
    </footer>
  );
}
