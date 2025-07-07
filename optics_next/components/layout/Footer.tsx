// src/components/layout/Footer.tsx
export default function Footer() {
  return (
    <footer className="footer">
      <div className="container mx-auto px-4 text-center text-sm">
        &copy; {new Date().getFullYear()} Solo Vizion. All rights reserved.
      </div>
    </footer>
  );
}
