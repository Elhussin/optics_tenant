// src/components/layout/Footer.tsx
export default function Footer() {
  return (
    <footer className="bg-gray-100 mt-10 py-4">
      <div className="container mx-auto px-4 text-center text-sm text-gray-600">
        &copy; {new Date().getFullYear()} Solo Vizion. All rights reserved.
      </div>
    </footer>
  );
}
