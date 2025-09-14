import React from "react";

const Header = ({ onLogout }) => {
  return (
    <header className="bg-blue-600 text-white p-4 flex justify-between items-center">
      <h1 className="text-2xl font-bold">Trucking HOS Planner</h1>
      <button
        onClick={onLogout}
        className="bg-blue-800 hover:bg-blue-700 px-4 py-2 rounded"
      >
        Logout
      </button>
    </header>
  );
};

export default Header;