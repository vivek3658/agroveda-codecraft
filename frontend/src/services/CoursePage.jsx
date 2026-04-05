import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getFarmingCourses } from "./courseService";
import "./CoursePage.css";

const CoursePage = () => {
  const { logout } = useAuth();
  const [catalog, setCatalog] = useState({ featured: [], playlists: [], resources: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState("all");

  useEffect(() => {
    const loadCourses = async () => {
      setLoading(true);
      try {
        const data = await getFarmingCourses();
        setCatalog(data);
        setError("");
      } catch (err) {
        setError(err.message || "Unable to load farming courses.");
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  const topics = useMemo(() => {
    const values = catalog.featured.map((item) => item.topic).filter(Boolean);
    return ["all", ...new Set(values)];
  }, [catalog.featured]);

  const filteredCourses = useMemo(() => {
    return catalog.featured.filter((item) => {
      const matchesQuery =
        !query ||
        [item.title, item.provider, item.topic, item.description]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(query.toLowerCase()));
      const matchesTopic = topic === "all" || item.topic === topic;
      return matchesQuery && matchesTopic;
    });
  }, [catalog.featured, query, topic]);

  return (
    <div className="page-shell course-page">
      <section className="topbar">
        <div>
          <p className="eyebrow">Learning Hub</p>
          <h1>Farming Courses and Resources</h1>
          <p className="section-copy">
            Learn practical farming with curated YouTube study paths, guided topics, and trusted agriculture resources.
          </p>
        </div>
        <div className="topbar-actions">
          <Link to="/dashboard" className="btn btn-secondary">
            Back to Dashboard
          </Link>
          <Link to="/marketplace" className="btn btn-secondary">
            Marketplace
          </Link>
          <button onClick={logout} className="btn btn-danger" type="button">
            Sign Out
          </button>
        </div>
      </section>

      {error && <div className="notice notice-error">{error}</div>}

      <section className="panel learning-hero">
        <div>
          <h2>How to use this page</h2>
          <p>
            Start with beginner video paths, move into topic-based playlists, then use the resource section for field support,
            research, and market information.
          </p>
        </div>
        <div className="hero-chips">
          <span className="status-pill status-active">YouTube-first</span>
          <span className="status-pill status-ready">No API rate limit</span>
          <span className="status-pill status-harvested">Normal fetch catalog</span>
        </div>
      </section>

      <section className="panel course-filter-panel">
        <div className="course-filter-grid">
          <label className="field">
            <span>Search</span>
            <input
              type="text"
              placeholder="Search by topic, title, or provider"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <label className="field">
            <span>Topic</span>
            <select value={topic} onChange={(e) => setTopic(e.target.value)}>
              {topics.map((item) => (
                <option key={item} value={item}>
                  {item === "all" ? "All Topics" : item}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {loading ? (
        <section className="loading-panel">Loading farming courses...</section>
      ) : (
        <>
          <section className="section-head">
            <div>
              <h2>Featured Learning Paths</h2>
              <p>{filteredCourses.length} curated video-based course paths</p>
            </div>
          </section>

          <section className="course-grid">
            {filteredCourses.map((course) => (
              <article className="course-card panel" key={course.id}>
                <div className="course-card-head">
                  <div>
                    <p className="feature-kicker">{course.topic}</p>
                    <h3>{course.title}</h3>
                  </div>
                  <span className="status-pill status-active">{course.level}</span>
                </div>
                <p className="course-description">{course.description}</p>
                <div className="course-meta">
                  <span>{course.provider}</span>
                  <span>{course.duration}</span>
                  <span>{course.source}</span>
                </div>
                <a className="btn btn-primary" href={course.url} target="_blank" rel="noreferrer">
                  Open on YouTube
                </a>
              </article>
            ))}
          </section>

          <section className="resource-layout">
            <article className="panel">
              <div className="panel-header">
                <h2>Recommended Playlists</h2>
                <p>Topic bundles for step-by-step learning.</p>
              </div>
              <div className="playlist-list">
                {catalog.playlists.map((playlist) => (
                  <a
                    className="playlist-item"
                    href={playlist.url}
                    target="_blank"
                    rel="noreferrer"
                    key={playlist.id}
                  >
                    <strong>{playlist.title}</strong>
                    <span>{playlist.description}</span>
                  </a>
                ))}
              </div>
            </article>

            <article className="panel">
              <div className="panel-header">
                <h2>Other Resources</h2>
                <p>Trusted places to continue learning beyond videos.</p>
              </div>
              <div className="resource-list">
                {catalog.resources.map((resource) => (
                  <a
                    className="resource-item"
                    href={resource.url}
                    target="_blank"
                    rel="noreferrer"
                    key={resource.id}
                  >
                    <div>
                      <strong>{resource.title}</strong>
                      <p>{resource.description}</p>
                    </div>
                    <span className="status-pill">{resource.kind}</span>
                  </a>
                ))}
              </div>
            </article>
          </section>
        </>
      )}
    </div>
  );
};

export default CoursePage;
