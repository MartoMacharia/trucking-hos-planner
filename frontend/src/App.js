import React, { useState } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Login from "./components/Login";
import TripInputForm from "./components/TripInputForm";
import MapView from "./components/MapView";

function App() {
  const [tripData, setTripData] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);

  const handleTripSubmit = (data) => {
    setTripData(data);
    console.log("Trip Data:", data); // debug
  };

  const handleLoginSuccess = () => {
    setLoggedIn(true);
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setTripData(null);
  };

  if (!loggedIn) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundImage: "url('/oriental-tiles.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Header onLogout={handleLogout} />
      <main className="flex-1 p-4 bg-gray-300 bg-opacity-50">
        <div className="max-w-4xl mx-auto">
          <section className="mb-8">
            <TripInputForm onTripSubmit={handleTripSubmit} />
          </section>
          {tripData && (
            <section className="mt-8">
              <MapView tripData={tripData} />
            </section>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default App;
