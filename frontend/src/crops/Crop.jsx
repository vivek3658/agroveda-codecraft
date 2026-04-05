import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createCrop, deleteCrop, getCropById, getCrops, updateCrop } from "./cropService";
import { useAuth } from "../context/AuthContext";
import "./Crop.css";

const initialForm = {
  name: "",
  category: "Vegetables",
  description: "",
  price: "",
  quantity: "",
  unit: "kg",
  location: "",
  harvestDate: "",
  expiryDate: "",
  isAvailable: true,
};

const categoryOptions = ["Grains", "Vegetables", "Fruits", "Legumes", "Spices", "Other"];

const Crop = () => {
  const navigate = useNavigate();
  const { session, logout } = useAuth();
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingCrop, setEditingCrop] = useState(null);
  const [viewingCrop, setViewingCrop] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCrops, setTotalCrops] = useState(0);
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    if (session?.token) {
      loadCrops(currentPage);
    }
  }, [currentPage, session?.token]);

  const loadCrops = async (page = 1) => {
    setLoading(true);
    try {
      const data = await getCrops(session?.token, page, 9);
      setCrops(data.crops || []);
      setTotalPages(data.totalPages || 1);
      setTotalCrops(data.totalCrops || 0);
      setCurrentPage(page);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to load crops.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetForm = () => {
    setFormData(initialForm);
    setEditingCrop(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    const payload = {
      ...formData,
      price: Number(formData.price),
      quantity: Number(formData.quantity),
    };

    try {
      if (editingCrop) {
        await updateCrop(editingCrop._id, payload, session?.token);
        setSuccess("Crop updated successfully.");
      } else {
        await createCrop(payload, session?.token);
        setSuccess("Crop created successfully.");
      }
      resetForm();
      await loadCrops(currentPage);
    } catch (err) {
      setError(err.message || "Failed to save crop.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (crop) => {
    setEditingCrop(crop);
    setViewingCrop(null);
    setShowForm(true);
    setFormData({
      name: crop.name || "",
      category: crop.category || "Vegetables",
      description: crop.description || "",
      price: crop.price ?? "",
      quantity: crop.quantity ?? "",
      unit: crop.unit || "kg",
      location: crop.location || "",
      harvestDate: crop.harvestDate ? crop.harvestDate.slice(0, 10) : "",
      expiryDate: crop.expiryDate ? crop.expiryDate.slice(0, 10) : "",
      isAvailable: crop.isAvailable ?? true,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleView = async (cropId) => {
    try {
      const crop = await getCropById(cropId, session?.token);
      setViewingCrop(crop);
      setShowForm(false);
      setEditingCrop(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err.message || "Failed to load crop details.");
    }
  };

  const handleDelete = async (cropId) => {
    const confirmed = window.confirm("Delete this crop listing?");
    if (!confirmed) {
      return;
    }

    try {
      await deleteCrop(cropId, session?.token);
      setSuccess("Crop deleted successfully.");
      setViewingCrop(null);

      if (crops.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      } else {
        await loadCrops(currentPage);
      }
    } catch (err) {
      setError(err.message || "Failed to delete crop.");
    }
  };

  if (session?.role !== "farmer") {
    return (
      <div className="page-shell">
        <section className="empty-panel">
          <p className="eyebrow">Restricted</p>
          <h1>Farmer access only</h1>
          <p>Crop management is available only for farmer accounts.</p>
          <button className="btn btn-primary" onClick={() => navigate("/dashboard")} type="button">
            Back to Dashboard
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="page-shell crop-page">
      <section className="topbar">
        <div>
          <p className="eyebrow">Farmer Inventory</p>
          <h1>Crop Management</h1>
          <p className="section-copy">Create and manage your published crop listings with real backend data.</p>
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

      {showForm ? (
        <section className="panel crop-form-panel">
          <div className="panel-header">
            <h2>{editingCrop ? "Edit Crop Listing" : "Add Crop Listing"}</h2>
            <p>Use the fields documented in the live Swagger API.</p>
          </div>

          <form className="crop-form-grid" onSubmit={handleSubmit}>
            <label className="field">
              <span>Name</span>
              <input name="name" value={formData.name} onChange={handleChange} required />
            </label>

            <label className="field">
              <span>Category</span>
              <select name="category" value={formData.category} onChange={handleChange}>
                {categoryOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Price</span>
              <input name="price" type="number" min="0" step="0.01" value={formData.price} onChange={handleChange} required />
            </label>

            <label className="field">
              <span>Quantity</span>
              <input
                name="quantity"
                type="number"
                min="0"
                step="0.01"
                value={formData.quantity}
                onChange={handleChange}
                required
              />
            </label>

            <label className="field">
              <span>Unit</span>
              <input name="unit" value={formData.unit} onChange={handleChange} />
            </label>

            <label className="field">
              <span>Location</span>
              <input name="location" value={formData.location} onChange={handleChange} required />
            </label>

            <label className="field">
              <span>Harvest Date</span>
              <input name="harvestDate" type="date" value={formData.harvestDate} onChange={handleChange} />
            </label>

            <label className="field">
              <span>Expiry Date</span>
              <input name="expiryDate" type="date" value={formData.expiryDate} onChange={handleChange} />
            </label>

            <label className="field field-full">
              <span>Description</span>
              <textarea
                name="description"
                rows="4"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </label>

            <label className="toggle-field field-full">
              <input
                type="checkbox"
                name="isAvailable"
                checked={formData.isAvailable}
                onChange={handleChange}
              />
              <span>Mark this crop as available in the marketplace</span>
            </label>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? "Saving..." : editingCrop ? "Update Crop" : "Create Crop"}
              </button>
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
        </section>
      ) : (
        <section className="section-head">
          <div>
            <h2>Your Listings</h2>
            <p>{totalCrops} crop listings across your account</p>
          </div>
          <button type="button" className="btn btn-primary" onClick={() => setShowForm(true)}>
            Add Crop
          </button>
        </section>
      )}

      {viewingCrop && (
        <section className="panel crop-detail-panel">
          <div className="panel-header">
            <h2>{viewingCrop.name}</h2>
            <p>{viewingCrop.category || "Other"} · {viewingCrop.location || "Location pending"}</p>
          </div>
          <div className="detail-grid">
            <div>
              <span>Price</span>
              <strong>Rs. {viewingCrop.price || 0}</strong>
            </div>
            <div>
              <span>Quantity</span>
              <strong>{viewingCrop.quantity || 0} {viewingCrop.unit || "unit"}</strong>
            </div>
            <div>
              <span>Harvest Date</span>
              <strong>{viewingCrop.harvestDate ? new Date(viewingCrop.harvestDate).toLocaleDateString() : "Not set"}</strong>
            </div>
            <div>
              <span>Expiry Date</span>
              <strong>{viewingCrop.expiryDate ? new Date(viewingCrop.expiryDate).toLocaleDateString() : "Not set"}</strong>
            </div>
            <div>
              <span>Status</span>
              <strong>{viewingCrop.isAvailable ? "Available" : "Hidden"}</strong>
            </div>
            <div>
              <span>Farmer</span>
              <strong>{session?.email}</strong>
            </div>
          </div>
          <p className="detail-description">{viewingCrop.description || "No description provided."}</p>
          <div className="form-actions">
            <button type="button" className="btn btn-primary" onClick={() => handleEdit(viewingCrop)}>
              Edit
            </button>
            <button type="button" className="btn btn-danger" onClick={() => handleDelete(viewingCrop._id)}>
              Delete
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => setViewingCrop(null)}>
              Close
            </button>
          </div>
        </section>
      )}

      {loading ? (
        <section className="loading-panel">Loading crops...</section>
      ) : crops.length === 0 ? (
        <section className="empty-panel">
          <h2>No crop listings yet</h2>
          <p>Create your first listing to publish produce to the marketplace.</p>
        </section>
      ) : (
        <section className="crop-grid">
          {crops.map((crop) => (
            <article className="crop-card" key={crop._id}>
              <div className="crop-card-header">
                <div>
                  <p className="crop-category">{crop.category || "Other"}</p>
                  <h3>{crop.name}</h3>
                </div>
                <span className={`status-pill ${crop.isAvailable ? "status-active" : "status-hidden"}`}>
                  {crop.isAvailable ? "Available" : "Hidden"}
                </span>
              </div>
              <p className="crop-description">{crop.description || "No description provided."}</p>
              <div className="crop-meta">
                <span>{crop.location || "Location pending"}</span>
                <span>{crop.quantity || 0} {crop.unit || "unit"}</span>
                <span>Rs. {crop.price || 0}</span>
              </div>
              <div className="crop-actions-row">
                <button type="button" className="btn btn-secondary" onClick={() => handleView(crop._id)}>
                  View
                </button>
                <button type="button" className="btn btn-primary" onClick={() => handleEdit(crop)}>
                  Edit
                </button>
                <button type="button" className="btn btn-danger" onClick={() => handleDelete(crop._id)}>
                  Delete
                </button>
              </div>
            </article>
          ))}
        </section>
      )}

      {totalPages > 1 && (
        <section className="pagination-bar panel">
          <button type="button" className="btn btn-secondary" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
            First
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
          >
            Last
          </button>
        </section>
      )}
    </div>
  );
};

export default Crop;
