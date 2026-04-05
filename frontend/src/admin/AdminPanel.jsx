import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAdmin } from "./AdminContext";
import {
  addSponsoredProduct,
  getSponsoredProducts,
  removeSponsoredProduct,
  toggleSponsoredProduct,
} from "./adminService";
import "./Admin.css";

const initialForm = {
  brand: "",
  productName: "",
  category: "",
  cropTags: "",
  description: "",
  suggestionText: "",
  buyUrl: "",
};

const AdminPanel = () => {
  const { adminSession, logoutAdmin } = useAdmin();
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    setProducts(getSponsoredProducts());
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const next = addSponsoredProduct({
      ...formData,
      cropTags: formData.cropTags
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    });
    setProducts(next);
    setFormData(initialForm);
  };

  return (
    <div className="page-shell admin-page">
      <section className="topbar">
        <div>
          <p className="eyebrow">Admin Panel</p>
          <h1>Sponsored Product Control</h1>
          <p className="section-copy">
            Logged in as <strong>{adminSession?.username}</strong>. Manage sponsored brands,
            farming products, and the suggestions shown to farmers.
          </p>
        </div>
        <div className="topbar-actions">
          <Link to="/dashboard" className="btn btn-secondary">
            User Dashboard
          </Link>
          <button type="button" className="btn btn-danger" onClick={logoutAdmin}>
            Admin Sign Out
          </button>
        </div>
      </section>

      <section className="notice notice-success">
        Real daily email sending is not possible in this frontend-only repo. This panel stores the
        sponsored content that a backend mail scheduler should later use.
      </section>

      <section className="admin-layout">
        <article className="panel">
          <div className="panel-header">
            <h2>Add Sponsored Product</h2>
            <p>Create products that can be promoted to farmers in future email campaigns.</p>
          </div>

          <form className="admin-grid" onSubmit={handleSubmit}>
            <label className="field">
              <span>Brand</span>
              <input name="brand" value={formData.brand} onChange={handleChange} required />
            </label>
            <label className="field">
              <span>Product Name</span>
              <input
                name="productName"
                value={formData.productName}
                onChange={handleChange}
                required
              />
            </label>
            <label className="field">
              <span>Category</span>
              <input name="category" value={formData.category} onChange={handleChange} required />
            </label>
            <label className="field">
              <span>Crop Tags</span>
              <input
                name="cropTags"
                value={formData.cropTags}
                onChange={handleChange}
                placeholder="Wheat, Rice, Tomato"
                required
              />
            </label>
            <label className="field field-full">
              <span>Description</span>
              <textarea
                name="description"
                rows="3"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </label>
            <label className="field field-full">
              <span>Suggestion Copy</span>
              <textarea
                name="suggestionText"
                rows="3"
                value={formData.suggestionText}
                onChange={handleChange}
                required
              />
            </label>
            <label className="field field-full">
              <span>Buy URL</span>
              <input name="buyUrl" value={formData.buyUrl} onChange={handleChange} required />
            </label>

            <button type="submit" className="btn btn-primary">
              Save Sponsored Product
            </button>
          </form>
        </article>

        <article className="panel">
          <div className="panel-header">
            <h2>Saved Sponsored Products</h2>
            <p>{products.length} products currently stored in local admin data.</p>
          </div>

          <div className="admin-product-list">
            {products.map((item) => (
              <div key={item.id} className="admin-product-card">
                <div className="admin-product-head">
                  <div>
                    <strong>{item.productName}</strong>
                    <span>{item.brand} · {item.category}</span>
                  </div>
                  <span className={`status-pill ${item.active ? "status-active" : "status-hidden"}`}>
                    {item.active ? "Active" : "Inactive"}
                  </span>
                </div>

                <p>{item.description}</p>
                <p className="admin-muted">{item.suggestionText}</p>
                <div className="crop-chip-row">
                  {(item.cropTags || []).map((tag) => (
                    <span className="crop-chip" key={`${item.id}-${tag}`}>
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="admin-actions">
                  <a className="btn btn-secondary" href={item.buyUrl} target="_blank" rel="noreferrer">
                    View Link
                  </a>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setProducts(toggleSponsoredProduct(item.id))}
                  >
                    {item.active ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => setProducts(removeSponsoredProduct(item.id))}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
};

export default AdminPanel;
