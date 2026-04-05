import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getStorageLocations } from "./storageService";
import "./StoragePage.css";

const StoragePage = () => {
  const { logout } = useAuth();
  const [directory, setDirectory] = useState({ meta: {}, locations: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const loadLocations = async () => {
      setLoading(true);
      try {
        const data = await getStorageLocations();
        setDirectory(data);
        setError("");
      } catch (err) {
        setError(err.message || "Unable to load storage directory.");
      } finally {
        setLoading(false);
      }
    };

    loadLocations();
  }, []);

  const filteredLocations = useMemo(() => {
    return directory.locations.filter((location) => {
      const haystack = [
        location.name,
        location.type,
        location.city,
        location.state,
        location.address,
        ...(location.supportedCrops || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(query.trim().toLowerCase());
    });
  }, [directory.locations, query]);

  return (
    <div className="page-shell storage-page">
      <section className="topbar">
        <div>
          <p className="eyebrow">Storage Finder</p>
          <h1>Crop Storage Locations</h1>
          <p className="section-copy">
            Search crop storage and cold storage locations by city, state, crop, or facility name, then contact them directly by call or email.
          </p>
        </div>
        <div className="topbar-actions">
          <Link to="/dashboard" className="btn btn-secondary">
            Back to Dashboard
          </Link>
          <Link to="/service/course" className="btn btn-secondary">
            Learning Hub
          </Link>
          <button onClick={logout} className="btn btn-danger" type="button">
            Sign Out
          </button>
        </div>
      </section>

      {error && <div className="notice notice-error">{error}</div>}

      <section className="panel storage-intro">
        <div>
          <h2>{directory.meta.title || "Storage Directory"}</h2>
          <p>{directory.meta.description || "Find nearby storage partners for your produce."}</p>
        </div>
        <span className="status-pill status-ready">Manual curated dataset</span>
      </section>

      <section className="panel storage-search-panel">
        <label className="field">
          <span>Search by location, crop, or storage name</span>
          <input
            type="text"
            placeholder="Try Nashik, Punjab, Potato, Cold Storage..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        {directory.meta.note && <p className="storage-note">{directory.meta.note}</p>}
      </section>

      {loading ? (
        <section className="loading-panel">Loading storage locations...</section>
      ) : filteredLocations.length === 0 ? (
        <section className="empty-panel">
          <h2>No storage locations found</h2>
          <p>Try a broader location or crop keyword.</p>
        </section>
      ) : (
        <section className="storage-grid">
          {filteredLocations.map((location) => (
            <article className="storage-card panel" key={location.id}>
              <div className="storage-card-head">
                <div>
                  <p className="feature-kicker">{location.type}</p>
                  <h3>{location.name}</h3>
                </div>
                <span className="status-pill status-active">{location.capacity}</span>
              </div>

              <p className="storage-address">{location.address}</p>

              <div className="storage-meta">
                <span>{location.city}, {location.state}</span>
                <span>Temperature: {location.temperature}</span>
              </div>

              <div className="crop-chip-row">
                {(location.supportedCrops || []).map((crop) => (
                  <span className="crop-chip" key={`${location.id}-${crop}`}>
                    {crop}
                  </span>
                ))}
              </div>

              <p className="storage-description">{location.description}</p>

              <div className="contact-grid">
                <a className="btn btn-primary" href={`tel:${location.phone.replace(/\s+/g, "")}`}>
                  Call
                </a>
                <a className="btn btn-secondary" href={`mailto:${location.email}?subject=Storage%20Inquiry%20from%20AgroVeda`}>
                  Email
                </a>
              </div>

              <div className="contact-details">
                <strong>{location.phone}</strong>
                <span>{location.email}</span>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
};

export default StoragePage;
