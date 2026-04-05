import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMyProfile, updateMyProfile } from "./profileService";
import "./Profile.css";

const emptyProfile = {
  name: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  farmSize: "",
  experience: "",
  specialization: "",
};

const Profile = () => {
  const navigate = useNavigate();
  const { session, logout } = useAuth();
  const [profile, setProfile] = useState(emptyProfile);
  const [initialProfile, setInitialProfile] = useState(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const data = await getMyProfile(session?.token);
        const nextProfile = { ...emptyProfile, email: session?.email || "", ...data };
        setProfile(nextProfile);
        setInitialProfile(nextProfile);
        setError("");
      } catch (err) {
        setError(err.message || "Failed to load profile.");
        const fallbackProfile = { ...emptyProfile, email: session?.email || "" };
        setProfile(fallbackProfile);
        setInitialProfile(fallbackProfile);
      } finally {
        setLoading(false);
      }
    };

    if (session?.token) {
      loadProfile();
    }
  }, [session?.email, session?.token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload = { ...profile };
      delete payload.email;
      const updated = await updateMyProfile(payload, session?.token);
      const normalized = { ...profile, ...updated, email: profile.email || session?.email || "" };
      setProfile(normalized);
      setInitialProfile(normalized);
      setSuccess("Profile updated successfully.");
      setIsEditing(false);
    } catch (err) {
      setError(err.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setProfile(initialProfile);
    setIsEditing(false);
    setError("");
    setSuccess("");
  };

  return (
    <div className="page-shell profile-page">
      <section className="topbar">
        <div>
          <p className="eyebrow">Account</p>
          <h1>My Profile</h1>
          <p className="section-copy">Keep your contact details and farmer information up to date.</p>
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
      {success && <div className="notice notice-success">{success}</div>}

      {loading ? (
        <section className="loading-panel">Loading profile...</section>
      ) : (
        <section className="profile-card panel">
          <div className="profile-hero">
            <div>
              <p className="eyebrow">Profile Overview</p>
              <h2>{profile.name || "AgroVeda User"}</h2>
              <p>{session?.role === "farmer" ? "Farmer account" : "Consumer account"}</p>
            </div>
            <div className="profile-badge">{session?.role === "farmer" ? "FR" : "CU"}</div>
          </div>

          <form className="profile-form" onSubmit={handleSubmit}>
            <div className="profile-grid">
              <label className="field">
                <span>Full Name</span>
                <input name="name" value={profile.name} onChange={handleChange} disabled={!isEditing} required />
              </label>

              <label className="field">
                <span>Email</span>
                <input name="email" value={profile.email} disabled />
              </label>

              <label className="field">
                <span>Phone</span>
                <input name="phone" value={profile.phone} onChange={handleChange} disabled={!isEditing} />
              </label>

              <label className="field">
                <span>City</span>
                <input name="city" value={profile.city} onChange={handleChange} disabled={!isEditing} />
              </label>

              <label className="field field-full">
                <span>Address</span>
                <input name="address" value={profile.address} onChange={handleChange} disabled={!isEditing} />
              </label>

              <label className="field">
                <span>State</span>
                <input name="state" value={profile.state} onChange={handleChange} disabled={!isEditing} />
              </label>

              <label className="field">
                <span>Pincode</span>
                <input name="pincode" value={profile.pincode} onChange={handleChange} disabled={!isEditing} />
              </label>

              {session?.role === "farmer" && (
                <>
                  <label className="field">
                    <span>Farm Size</span>
                    <input name="farmSize" value={profile.farmSize} onChange={handleChange} disabled={!isEditing} />
                  </label>

                  <label className="field">
                    <span>Experience</span>
                    <input name="experience" value={profile.experience} onChange={handleChange} disabled={!isEditing} />
                  </label>

                  <label className="field field-full">
                    <span>Specialization</span>
                    <input
                      name="specialization"
                      value={profile.specialization}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </label>
                </>
              )}
            </div>

            <div className="form-actions">
              {!isEditing ? (
                <button type="button" className="btn btn-primary" onClick={() => setIsEditing(true)}>
                  Edit Profile
                </button>
              ) : (
                <>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                    Cancel
                  </button>
                </>
              )}
            </div>
          </form>
        </section>
      )}
    </div>
  );
};

export default Profile;
