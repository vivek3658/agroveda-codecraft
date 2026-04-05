import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAdmin } from "./AdminContext";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { adminSession, loginAdmin } = useAdmin();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (adminSession) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    try {
      loginAdmin(username, password);
      navigate("/admin");
    } catch (err) {
      setError(err.message || "Admin login failed");
    }
  };

  return (
    <div className="page-shell">
      <section className="panel admin-login-panel">
        <p className="eyebrow">Admin Access</p>
        <h1>Admin Login</h1>
        <p className="section-copy">
          Single built-in admin for managing sponsored brands and farmer suggestion products.
        </p>

        <div className="notice notice-success">
          Built-in admin username: <strong>admin</strong>
        </div>

        {error && <div className="notice notice-error">{error}</div>}

        <form className="admin-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Username</span>
            <input value={username} onChange={(e) => setUsername(e.target.value)} required />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          <button type="submit" className="btn btn-primary">
            Enter Admin Panel
          </button>
        </form>
      </section>
    </div>
  );
};

export default AdminLogin;
