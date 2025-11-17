import React from "react";
import { Link } from "react-router-dom";

const UserAuthLanding: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">

      {/* 🔵 Header */}
      <h1 className="text-3xl font-extrabold text-indigo-700 mb-8">
        Online Petition Portal
      </h1>

      {/* 🔵 Card */}
      <div className="bg-white shadow-xl rounded-xl p-10 w-full max-w-md text-center border-t-4 border-indigo-600">

        <h2 className="text-xl font-semibold text-gray-700 mb-3">
          User Login / Register
        </h2>

        <p className="text-gray-500 mb-8">
          Please login or register to continue.
        </p>

        {/* 🔵 Buttons */}
        <div className="flex flex-col gap-4">

          <Link
            to="/login"
            className="w-full py-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="w-full py-3 rounded-lg border border-indigo-600 text-indigo-600 font-medium hover:bg-indigo-50 transition"
          >
            Register
          </Link>

        </div>
      </div>
    </div>
  );
};

export default UserAuthLanding;