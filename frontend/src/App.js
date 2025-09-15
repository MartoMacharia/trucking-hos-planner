import React, { useState } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Login from "./components/Login";
import TripInputForm from "./components/TripInputForm";
import MapView from "./components/MapView";
import { calculateTrip } from "./services/api";
import LogSheets from "./components/LogSheets";
import { Routes, Route, useNavigate } from "react-router-dom";

function TripSummary({ apiResult }) {
  if (!apiResult) return null;
  const totalDistance = apiResult.total_distance;
  const totalTime = apiResult.total_time;
  const hours = Math.floor(totalTime);
  const minutes = Math.round((totalTime - hours) * 60);
  return (
    <div className="bg-white rounded-xl shadow p-4 mt-4">
      <h3 className="font-semibold mb-2">Trip Summary</h3>
      <div className="text-sm text-gray-800">
        <div>Total distance: {totalDistance} miles</div>
        <div>Estimated time: {hours}h {minutes}m</div>
      </div>
      {apiResult.stops?.length > 0 && (
        <div className="mt-3">
          <div className="font-medium mb-1">Stops</div>
          <ul className="list-disc pl-5 text-sm text-gray-800 space-y-1">
            {apiResult.stops.map((s, i) => (
              <li key={i}>{s.type.toUpperCase()} • {s.description || `Mile ${s.mile_marker}`} • {s.duration} mins</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Home({ onTripSubmit, tripData, apiResult, loading, error }) {
  const navigate = useNavigate();
  return (
    <main className="flex-1 p-4 bg-gray-300 bg-opacity-50">
      <div className="max-w-4xl mx-auto">
        <section className="mb-8">
          <TripInputForm onTripSubmit={onTripSubmit} />
          {loading && <p className="text-blue-800 mt-2">Calculating trip...</p>}
          {error && <p className="text-red-600 mt-2">{error}</p>}
          {apiResult?.log_sheets?.length > 0 && (
            <button
              className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
              onClick={() => navigate("/logs")}
            >
              View ELD Logs
            </button>
          )}
          {apiResult && <TripSummary apiResult={apiResult} />}
        </section>
        {(tripData || apiResult) && (
          <section className="mt-8 space-y-8">
            <MapView tripData={tripData} apiResult={apiResult} />
          </section>
        )}
      </div>
    </main>
  );
}

function LogsScreen({ apiResult }) {
  const navigate = useNavigate();
  return (
    <main className="flex-1 p-4 bg-gray-300 bg-opacity-50">
      <div className="max-w-5xl mx-auto space-y-4">
        <button
          className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded"
          onClick={() => navigate(-1)}
        >
          Back
        </button>
        {apiResult?.log_sheets?.length ? (
          <LogSheets sheets={apiResult.log_sheets} />
        ) : (
          <div className="bg-white rounded-xl shadow p-6">No logs available yet.</div>
        )}
      </div>
    </main>
  );
}

function App() {
  const [tripData, setTripData] = useState(null);
  const [apiResult, setApiResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);

  const handleTripSubmit = async (data) => {
    setTripData(data);
    setError("");
    setLoading(true);
    try {
      const result = await calculateTrip(data);
      setApiResult(result);
    } catch (e) {
      setError(e.message || "Failed to calculate trip");
      setApiResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = () => {
    setLoggedIn(true);
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setTripData(null);
    setApiResult(null);
    setError("");
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
      <Routes>
        <Route
          path="/"
          element={
            <Home
              onTripSubmit={handleTripSubmit}
              tripData={tripData}
              apiResult={apiResult}
              loading={loading}
              error={error}
            />
          }
        />
        <Route path="/logs" element={<LogsScreen apiResult={apiResult} />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
