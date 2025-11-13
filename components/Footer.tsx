import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-white/70 backdrop-blur-md py-4 mt-10 border-t">
      <div className="max-w-7xl mx-auto text-center text-gray-600 text-sm">
        © 2025 All Rights Reserved. Developed by
        <a
          href="https://suryakumar-portfolio-777.netlify.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-indigo-600 hover:underline ml-1"
        >
          Surya Kumar
        </a>
      </div>
    </footer>
  );
};

export default Footer;