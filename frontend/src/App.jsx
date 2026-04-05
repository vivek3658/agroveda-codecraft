import { BrowserRouter as Router, Navigate, Route, Routes, Link, useLocation } from "react-router-dom";
import Auth from "./auth/Auth";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Crop from "./crops/Crop";
import Marketplace from "./marketplace/Marketplace";
import Analytics from "./analytics/Analytics";
import Profile from "./profile/Profile";
import Orders from "./orders/Orders";
import CoursePage from "./services/CoursePage";
import StoragePage from "./services/StoragePage";
import SoilAssistantPage from "./features/chatbot/pages/SoilAssistantPage";
import WelcomePage from "./welcome/pages/WelcomePage";
import { LanguageProvider } from "./context/LanguageContext";
import AppNavbar from "./components/AppNavbar";
import AppFooter from "./components/AppFooter";
import { AdminProvider, useAdmin } from "./admin/AdminContext";
import AdminLogin from "./admin/AdminLogin";
import AdminPanel from "./admin/AdminPanel";
import { getFarmerSponsoredSuggestions } from "./admin/adminService";
import { getWeatherForecast, searchWeatherLocations } from "./services/weatherService";
import { useEffect, useState } from "react";

const buildLinePoints = (values, width = 100, height = 100) => {
  const safeValues = values.map((value) => Number(value ?? 0));
  const min = Math.min(...safeValues);
  const max = Math.max(...safeValues);
  const range = max - min || 1;

  return safeValues
    .map((value, index) => {
      const x = (index / Math.max(1, safeValues.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");
};

const WeatherTrendCharts = ({ forecast }) => {
  const days = forecast.forecast || [];
  const tempValues = days.map((day) => Number(day.maxTemp ?? 0));
  const rainValues = days.map((day) => Number(day.rainChance ?? 0));
  const linePoints = buildLinePoints(tempValues, 100, 100);
  const maxRain = Math.max(...rainValues, 1);

  return (
    <div className="weather-visual-grid">
      <article className="weather-visual-card">
        <div className="weather-visual-card__head">
          <p className="feature-kicker">Temperature Trend</p>
          <span>{days.length} day view</span>
        </div>
        <svg viewBox="0 0 100 110" className="weather-line-chart" aria-label="Temperature trend chart">
          <polyline
            fill="none"
            stroke="rgba(47, 109, 58, 0.22)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={linePoints}
          />
          <polyline
            fill="none"
            stroke="url(#tempGradient)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={linePoints}
          />
          <defs>
            <linearGradient id="tempGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#5ca86c" />
              <stop offset="100%" stopColor="#c4972f" />
            </linearGradient>
          </defs>
        </svg>
        <div className="weather-chart-labels">
          {days.map((day) => (
            <div key={day.date}>
              <strong>{day.maxTemp ?? "--"}°</strong>
              <span>
                {new Date(day.date).toLocaleDateString("en-IN", {
                  weekday: "short",
                })}
              </span>
            </div>
          ))}
        </div>
      </article>

      <article className="weather-visual-card">
        <div className="weather-visual-card__head">
          <p className="feature-kicker">Rain Probability</p>
          <span>Daily rainfall chance</span>
        </div>
        <div className="weather-bar-chart" aria-label="Rain probability chart">
          {days.map((day) => {
            const height = `${((Number(day.rainChance ?? 0) / maxRain) * 100 || 6).toFixed(2)}%`;
            return (
              <div className="weather-bar-chart__item" key={day.date}>
                <span className="weather-bar-chart__value">{day.rainChance ?? "--"}%</span>
                <div className="weather-bar-chart__track">
                  <div className="weather-bar-chart__bar" style={{ height }} />
                </div>
                <span className="weather-bar-chart__label">
                  {new Date(day.date).toLocaleDateString("en-IN", {
                    weekday: "short",
                  })}
                </span>
              </div>
            );
          })}
        </div>
      </article>
    </div>
  );
};

const WeatherInsights = () => {
  const [query, setQuery] = useState("");
  const [range, setRange] = useState(3);
  const [matches, setMatches] = useState([]);
  const [forecast, setForecast] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (query.trim().length < 2) {
      setMatches([]);
      return;
    }

    const timer = window.setTimeout(async () => {
      setSearching(true);
      try {
        const results = await searchWeatherLocations(query);
        setMatches(results);
      } catch (err) {
        setError(err.message || "Unable to search locations.");
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => window.clearTimeout(timer);
  }, [query]);

  const loadForecast = async (location) => {
    setLoading(true);
    setError("");
    try {
      const data = await getWeatherForecast({
        latitude: location.latitude,
        longitude: location.longitude,
        days: range,
        locationLabel: `${location.name}${location.admin1 ? `, ${location.admin1}` : ""}${location.country ? `, ${location.country}` : ""}`,
      });
      setForecast(data);
      setSelectedLocation(location);
      setMatches([]);
      setQuery(data.locationLabel);
    } catch (err) {
      setError(err.message || "Unable to load forecast.");
    } finally {
      setLoading(false);
    }
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported in this browser.");
      return;
    }

    setLoading(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const data = await getWeatherForecast({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            days: range,
            locationLabel: "Current location",
          });
          setForecast(data);
          setSelectedLocation({
            name: "Current location",
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setQuery("Current location");
        } catch (err) {
          setError(err.message || "Unable to load forecast for current location.");
        } finally {
          setLoading(false);
        }
      },
      (geoError) => {
        setLoading(false);
        setError(geoError.message || "Location access was denied.");
      }
    );
  };

  useEffect(() => {
    if (selectedLocation) {
      loadForecast(selectedLocation);
    }
  }, [range]);

  return (
    <section className="dashboard-category">
      <div className="dashboard-category-head">
        <p className="feature-kicker">Weather Category</p>
        <h2>3 or 7 day weather insights</h2>
      </div>

      <div className="weather-panel">
        <div className="weather-panel__controls">
          <label className="field weather-field">
            <span>Search location</span>
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Enter city or district"
            />
          </label>

          <label className="field weather-field weather-field--range">
            <span>Forecast range</span>
            <select value={range} onChange={(event) => setRange(Number(event.target.value))}>
              <option value={3}>3 days</option>
              <option value={7}>7 days</option>
            </select>
          </label>

          <button type="button" className="btn btn-secondary weather-location-btn" onClick={useCurrentLocation} disabled={loading}>
            Use Current Location
          </button>
        </div>

        {matches.length > 0 ? (
          <div className="weather-match-list">
            {matches.map((location) => (
              <button
                key={location.id}
                type="button"
                className="weather-match-item"
                onClick={() => loadForecast(location)}
              >
                <strong>{location.name}</strong>
                <span>
                  {[location.admin1, location.country].filter(Boolean).join(", ")}
                </span>
              </button>
            ))}
          </div>
        ) : null}

        {searching ? <div className="mini-empty">Searching locations...</div> : null}
        {error ? <div className="notice notice-error">{error}</div> : null}

        {!forecast && !loading ? (
          <div className="weather-empty">
            Search for a place or use your current location to get rainfall, temperature, humidity, and wind outlook.
          </div>
        ) : null}

        {loading ? <div className="loading-panel weather-loading">Loading weather insights...</div> : null}

        {forecast ? (
          <div className="weather-results">
            <article className="weather-summary-card">
              <p className="feature-kicker">Current Snapshot</p>
              <h3>{forecast.locationLabel}</h3>
              <p>{forecast.current.summary}</p>
              <div className="weather-summary-grid">
                <div>
                  <span>Temp</span>
                  <strong>{forecast.current.temperature ?? "--"}°C</strong>
                </div>
                <div>
                  <span>Humidity</span>
                  <strong>{forecast.current.humidity ?? "--"}%</strong>
                </div>
                <div>
                  <span>Wind</span>
                  <strong>{forecast.current.windSpeed ?? "--"} km/h</strong>
                </div>
                <div>
                  <span>Timezone</span>
                  <strong>{forecast.timezone || "--"}</strong>
                </div>
              </div>
            </article>

            <WeatherTrendCharts forecast={forecast} />

            <div className={`weather-forecast-grid weather-forecast-grid-${range}`}>
              {forecast.forecast.map((day) => (
                <article className="weather-day-card" key={day.date}>
                  <p className="feature-kicker">
                    {new Date(day.date).toLocaleDateString("en-IN", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                  <h3>{day.summary}</h3>
                  <div className="weather-day-meta">
                    <span>Max: {day.maxTemp ?? "--"}°C</span>
                    <span>Min: {day.minTemp ?? "--"}°C</span>
                    <span>Rain chance: {day.rainChance ?? "--"}%</span>
                    <span>Rainfall: {day.rainfall ?? "--"} mm</span>
                    <span>Wind: {day.windSpeed ?? "--"} km/h</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
};

const Dashboard = ({ title }) => {
  const { session } = useAuth();
  const sponsoredSuggestions = session?.role === "farmer" ? getFarmerSponsoredSuggestions().slice(0, 3) : [];
  const farmerCards =
    session?.role === "farmer"
      ? [
          {
            kicker: "Farmer Tools",
            title: "Crop Management",
            description: "Publish, update, and maintain your produce inventory from one place.",
            actions: [{ to: "/crops", label: "Open Crops", tone: "primary" }],
          },
          {
            kicker: "Performance",
            title: "Analytics",
            description: "Review revenue trends, product leaders, and crop performance from live data.",
            actions: [{ to: "/analytics", label: "View Analytics", tone: "primary" }],
          },
          {
            kicker: "Marketplace",
            title: "Shop as Buyer",
            description: "Explore the marketplace, place orders, and track purchases like any customer.",
            actions: [{ to: "/marketplace", label: "Open Marketplace", tone: "primary" }],
          },
        ]
      : [];

  const serviceCards = [
    {
      kicker: session?.role === "consumer" ? "Consumer Tools" : "Orders",
      title: "Marketplace",
      description: "Discover verified listings, compare prices, and place direct farm orders.",
      actions: [
        { to: "/marketplace", label: "Browse Marketplace", tone: "primary" },
        { to: "/orders", label: "View Orders", tone: "secondary" },
      ],
    },
    {
      kicker: "Smart Advisory",
      title: "Soil Report Assistant",
      description: "Analyze soil reports, get crop recommendations, and continue with AI-guided follow-up questions.",
      actions: [{ to: "/service/soil-report", label: "Open Soil Assistant", tone: "primary" }],
    },
    {
      kicker: "Learning Hub",
      title: "Courses and Resources",
      description: "Learn farming with curated YouTube paths, practical playlists, and trusted agriculture resources.",
      actions: [{ to: "/service/course", label: "Open Learning Hub", tone: "primary" }],
    },
    {
      kicker: "Storage Service",
      title: "Storage Locations",
      description: "Find crop storage locations, search by place or crop, and contact facilities by call or email.",
      actions: [{ to: "/service/storage", label: "Open Storage Finder", tone: "primary" }],
    },
  ];

  return (
    <div className="page-shell">
      <section className="hero-card">
        <div>
          <p className="eyebrow">AgroVeda Workspace</p>
          <h1>{title}</h1>
          <p className="hero-copy">
            Signed in as <strong>{session?.email}</strong> with{" "}
            <strong>{session?.role}</strong> access.
          </p>
        </div>
      </section>

      <section className="dashboard-featured">
        <article className="feature-card feature-card-featured">
          <p className="feature-kicker">Workspace Overview</p>
          <h2>{session?.role === "farmer" ? "Run your farm from one calm dashboard" : "Manage buying, learning, and insights in one place"}</h2>
          <p>
            {session?.role === "farmer"
              ? "Move from crop planning to sales, soil guidance, storage, and analytics without leaving the AgroVeda workspace."
              : "Browse the marketplace, track orders, use the soil assistant, and keep learning with tools designed for daily agricultural decisions."}
          </p>
          <div className="feature-card-actions">
            <Link to="/marketplace" className="btn btn-primary">
              Open Marketplace
            </Link>
            <Link to="/service/soil-report" className="btn btn-secondary">
              Try Soil Assistant
            </Link>
          </div>
        </article>
      </section>

      {farmerCards.length > 0 ? (
        <section className="dashboard-category">
          <div className="dashboard-category-head">
            <p className="feature-kicker">Farmer Category</p>
            <h2>Field and business tools</h2>
          </div>
          <div className="dashboard-grid dashboard-grid-two">
            {farmerCards.map((card) => (
              <article className="feature-card dashboard-card" key={card.title}>
                <p className="feature-kicker">{card.kicker}</p>
                <h2>{card.title}</h2>
                <p>{card.description}</p>
                <div className="feature-card-actions">
                  {card.actions.map((action) => (
                    <Link
                      key={action.to}
                      to={action.to}
                      className={`btn ${action.tone === "secondary" ? "btn-secondary" : "btn-primary"}`}
                    >
                      {action.label}
                    </Link>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="dashboard-category">
        <div className="dashboard-category-head">
          <p className="feature-kicker">Service Category</p>
          <h2>Everyday agriculture services</h2>
        </div>
        <div className="dashboard-grid dashboard-grid-four">
          {serviceCards.map((card) => (
            <article className="feature-card dashboard-card" key={card.title}>
              <p className="feature-kicker">{card.kicker}</p>
              <h2>{card.title}</h2>
              <p>{card.description}</p>
              <div className="feature-card-actions">
                {card.actions.map((action) => (
                  <Link
                    key={action.to}
                    to={action.to}
                    className={`btn ${action.tone === "secondary" ? "btn-secondary" : "btn-primary"}`}
                  >
                    {action.label}
                  </Link>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      {session?.role === "farmer" && sponsoredSuggestions.length > 0 ? (
        <section className="dashboard-category">
          <div className="dashboard-category-head">
            <p className="feature-kicker">Sponsored Category</p>
            <h2>Suggested products for your farm</h2>
          </div>
          <div className="dashboard-grid dashboard-grid-three">
            {sponsoredSuggestions.map((item) => (
              <article className="feature-card dashboard-card" key={item.id}>
                <p className="feature-kicker">Sponsored Suggestion</p>
                <h2>{item.productName}</h2>
                <p>{item.suggestionText}</p>
                <div className="feature-card-actions">
                  <a href={item.buyUrl} target="_blank" rel="noreferrer" className="btn btn-primary">
                    View Product
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <WeatherInsights />
    </div>
  );
};

const AccessDenied = () => {
  const { logout } = useAuth();

  return (
    <div className="page-shell">
      <section className="empty-panel">
        <p className="eyebrow">Access Control</p>
        <h1>Access Denied</h1>
        <p>
          This page is restricted for your current role. Return to your dashboard or sign
          in with another account.
        </p>
        <div className="stack-actions">
          <Link to="/dashboard" className="btn btn-primary">
            Go to Dashboard
          </Link>
          <button onClick={logout} className="btn btn-danger" type="button">
            Sign Out
          </button>
        </div>
      </section>
    </div>
  );
};

const PrivateRoute = ({ children, roles }) => {
  const { session } = useAuth();

  if (!session) {
    return <Navigate to="/auth" />;
  }

  if (roles && !roles.includes(session.role)) {
    return <Navigate to="/denied" />;
  }

  return children;
};

const AdminRoute = ({ children }) => {
  const { adminSession } = useAdmin();

  if (!adminSession) {
    return <Navigate to="/admin/login" />;
  }

  return children;
};

function AppRoutes() {
  const { session } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route path="/auth" element={!session ? <Auth /> : <Navigate to="/dashboard" />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminPanel />
          </AdminRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute roles={["farmer", "consumer"]}>
            <Dashboard title="AgroVeda Dashboard" />
          </PrivateRoute>
        }
      />
      <Route
        path="/crops"
        element={
          <PrivateRoute roles={["farmer"]}>
            <Crop />
          </PrivateRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <PrivateRoute roles={["farmer"]}>
            <Analytics />
          </PrivateRoute>
        }
      />
      <Route
        path="/marketplace"
        element={
          <PrivateRoute roles={["farmer", "consumer"]}>
            <Marketplace />
          </PrivateRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <PrivateRoute roles={["farmer", "consumer"]}>
            <Orders />
          </PrivateRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <PrivateRoute roles={["farmer", "consumer"]}>
            <Profile />
          </PrivateRoute>
        }
      />
      <Route
        path="/service/course"
        element={
          <PrivateRoute roles={["farmer", "consumer"]}>
            <CoursePage />
          </PrivateRoute>
        }
      />
      <Route
        path="/service/storage"
        element={
          <PrivateRoute roles={["farmer", "consumer"]}>
            <StoragePage />
          </PrivateRoute>
        }
      />
      <Route
        path="/service/stoage"
        element={
          <PrivateRoute roles={["farmer", "consumer"]}>
            <StoragePage />
          </PrivateRoute>
        }
      />
      <Route
        path="/service/soil-report"
        element={
          <PrivateRoute roles={["farmer", "consumer"]}>
            <SoilAssistantPage />
          </PrivateRoute>
        }
      />
      <Route path="/denied" element={<AccessDenied />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function AppFrame() {
  const location = useLocation();
  const showAppChrome = !["/", "/auth", "/admin/login"].includes(location.pathname);

  return (
    <div className="app-shell">
      {showAppChrome ? <AppNavbar /> : null}
      <main className="app-content">
        <AppRoutes />
      </main>
      {showAppChrome ? <AppFooter /> : null}
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AdminProvider>
        <AuthProvider>
          <Router>
            <AppFrame />
          </Router>
        </AuthProvider>
      </AdminProvider>
    </LanguageProvider>
  );
}

export default App;
