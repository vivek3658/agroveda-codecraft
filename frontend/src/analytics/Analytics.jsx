import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getFarmerAnalyticsOverview } from "./analyticsService";
import "./Analytics.css";

const Analytics = () => {
  const navigate = useNavigate();
  const { session, logout } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAnalytics = async () => {
      setLoading(true);
      try {
        const data = await getFarmerAnalyticsOverview(session?.token);
        setAnalytics(data);
        setError("");
      } catch (err) {
        setError(err.message || "Failed to load analytics overview.");
      } finally {
        setLoading(false);
      }
    };

    if (session?.token) {
      loadAnalytics();
    }
  }, [session?.token]);

  const trendMax = useMemo(() => {
    const values = analytics?.monthlyTrends?.map((item) => item.revenue || 0) || [];
    return Math.max(...values, 1);
  }, [analytics]);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);

  const averagePerCrop =
    analytics?.totalCrops > 0 ? Math.round((analytics.totalRevenue || 0) / analytics.totalCrops) : 0;

  if (session?.role !== "farmer") {
    return (
      <div className="page-shell">
        <section className="empty-panel">
          <p className="eyebrow">Restricted</p>
          <h1>Farmer access only</h1>
          <p>Analytics is available only for farmer accounts.</p>
          <button className="btn btn-primary" onClick={() => navigate("/dashboard")} type="button">
            Back to Dashboard
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="page-shell analytics-page">
      <section className="topbar">
        <div>
          <p className="eyebrow">Farmer Insights</p>
          <h1>Farm Analytics</h1>
          <p className="section-copy">Track revenue, crop activity, and product performance in one view.</p>
        </div>
        <div className="topbar-actions">
          <Link to="/dashboard" className="btn btn-secondary">
            Back to Dashboard
          </Link>
          <button onClick={logout} className="btn btn-danger" type="button">
            Sign Out
          </button>
        </div>
      </section>

      {error && <div className="notice notice-error">{error}</div>}

      {loading ? (
        <section className="loading-panel">Loading analytics overview...</section>
      ) : (
        <>
          <section className="metrics-grid">
            <article className="metric-card">
              <span>Total Crops</span>
              <strong>{analytics?.totalCrops || 0}</strong>
              <p>{analytics?.activeCrops || 0} active listings</p>
            </article>
            <article className="metric-card">
              <span>Total Revenue</span>
              <strong>{formatCurrency(analytics?.totalRevenue)}</strong>
              <p>Lifetime earnings from orders</p>
            </article>
            <article className="metric-card">
              <span>Monthly Revenue</span>
              <strong>{formatCurrency(analytics?.monthlyRevenue)}</strong>
              <p>Current month performance</p>
            </article>
            <article className="metric-card">
              <span>Average per Crop</span>
              <strong>{formatCurrency(averagePerCrop)}</strong>
              <p>Revenue spread across all crops</p>
            </article>
          </section>

          <section className="analytics-grid">
            <article className="panel">
              <div className="panel-header">
                <h2>Revenue Trends</h2>
                <p>Month-wise revenue snapshot</p>
              </div>
              <div className="trend-chart">
                {(analytics?.monthlyTrends || []).length === 0 ? (
                  <div className="mini-empty">No trend data available yet.</div>
                ) : (
                  analytics.monthlyTrends.map((trend, index) => (
                    <div className="trend-column" key={`${trend.month}-${index}`}>
                      <div
                        className="trend-bar"
                        style={{ height: `${((trend.revenue || 0) / trendMax) * 180}px` }}
                        title={`${trend.month}: ${formatCurrency(trend.revenue)}`}
                      />
                      <strong>{trend.month}</strong>
                      <span>{trend.crops || 0} crops</span>
                    </div>
                  ))
                )}
              </div>
            </article>

            <article className="panel">
              <div className="panel-header">
                <h2>Top Products</h2>
                <p>Best performers by revenue</p>
              </div>
              <div className="rank-list">
                {(analytics?.topProducts || []).length === 0 ? (
                  <div className="mini-empty">No sales data available yet.</div>
                ) : (
                  analytics.topProducts.map((product, index) => (
                    <div className="rank-item" key={`${product.name}-${index}`}>
                      <div>
                        <strong>{product.name}</strong>
                        <span>{product.sales || 0} units sold</span>
                      </div>
                      <strong>{formatCurrency(product.revenue)}</strong>
                    </div>
                  ))
                )}
              </div>
            </article>
          </section>

          <section className="panel">
            <div className="panel-header">
              <h2>Crop Performance</h2>
              <p>Per-crop contribution and status</p>
            </div>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Crop</th>
                    <th>Count</th>
                    <th>Revenue</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(analytics?.cropStats || []).length === 0 ? (
                    <tr>
                      <td colSpan="4" className="table-empty">
                        No crop stats available yet.
                      </td>
                    </tr>
                  ) : (
                    analytics.cropStats.map((crop, index) => (
                      <tr key={`${crop.name}-${index}`}>
                        <td>{crop.name}</td>
                        <td>{crop.count || 0}</td>
                        <td>{formatCurrency(crop.revenue)}</td>
                        <td>
                          <span className={`status-pill status-${(crop.status || "active").toLowerCase()}`}>
                            {crop.status || "active"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="cta-row">
            <Link to="/crops" className="btn btn-primary">
              Manage Crops
            </Link>
            <Link to="/profile" className="btn btn-secondary">
              Update Profile
            </Link>
          </section>
        </>
      )}
    </div>
  );
};

export default Analytics;
