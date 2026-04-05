import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createOrder, getMarketplaceListings } from "./marketplaceService";
import "./Marketplace.css";

const categories = ["all", "Vegetables", "Fruits", "Grains", "Legumes", "Spices", "Other"];

const initialShipping = {
  name: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
};

const Marketplace = () => {
  const { session, logout } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [cart, setCart] = useState([]);
  const [shippingAddress, setShippingAddress] = useState(initialShipping);
  const [submittingOrder, setSubmittingOrder] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await getMarketplaceListings({
          search: searchTerm,
          category: selectedCategory,
          limit: 24,
          sortBy: "createdAt",
          order: "desc",
        });
        setProducts(data.listings || []);
        setError("");
      } catch (err) {
        setError(err.message || "Failed to load marketplace listings.");
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedCategory]);

  const cartTotal = useMemo(
    () => cart.reduce((total, item) => total + item.price * item.cartQuantity, 0),
    [cart]
  );

  const cartItems = useMemo(
    () => cart.reduce((total, item) => total + item.cartQuantity, 0),
    [cart]
  );

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id || item._id === product._id);

      if (existing) {
        return prev.map((item) =>
          item.id === product.id || item._id === product._id
            ? {
                ...item,
                cartQuantity: Math.min(item.cartQuantity + 1, item.quantity || 1),
              }
            : item
        );
      }

      return [...prev, { ...product, cartQuantity: 1 }];
    });
    setSuccess(`${product.name} added to cart.`);
  };

  const updateCartItem = (id, nextQuantity) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id || item._id === id
            ? {
                ...item,
                cartQuantity: Math.max(1, Math.min(nextQuantity, item.quantity || nextQuantity)),
              }
            : item
        )
        .filter((item) => item.cartQuantity > 0)
    );
  };

  const removeCartItem = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id && item._id !== id));
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      setError("Add items to your cart before checkout.");
      return;
    }

    const missingField = Object.entries(shippingAddress).find(([, value]) => !value.trim());
    if (missingField) {
      setError("Please complete the shipping address before placing the order.");
      return;
    }

    setSubmittingOrder(true);
    try {
      await createOrder(
        {
          items: cart.map((item) => ({
            listingId: item.id || item._id,
            quantity: item.cartQuantity,
          })),
          shippingAddress,
          paymentMethod: "cod",
        },
        session?.token
      );
      setCart([]);
      setShippingAddress(initialShipping);
      setSuccess("Order placed successfully.");
      setError("");
    } catch (err) {
      setError(err.message || "Unable to place your order.");
    } finally {
      setSubmittingOrder(false);
    }
  };

  return (
    <div className="page-shell marketplace-page">
      <section className="topbar">
        <div>
          <p className="eyebrow">Marketplace</p>
          <h1>Fresh from farm to table</h1>
          <p className="section-copy">Search live listings, compare categories, and place direct orders from any account.</p>
        </div>
        <div className="topbar-actions">
          <Link to="/dashboard" className="btn btn-secondary">
            Back to Dashboard
          </Link>
          <Link to="/orders" className="btn btn-secondary">
            My Orders
          </Link>
          <button onClick={logout} className="btn btn-danger" type="button">
            Sign Out
          </button>
        </div>
      </section>

      {error && <div className="notice notice-error">{error}</div>}
      {success && <div className="notice notice-success">{success}</div>}

      <section className="marketplace-layout">
        <div className="marketplace-main">
          <section className="panel filter-panel">
            <div className="filter-grid">
              <label className="field">
                <span>Search</span>
                <input
                  type="text"
                  placeholder="Search by product, farmer, or location"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </label>

              <label className="field">
                <span>Category</span>
                <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category === "all" ? "All categories" : category}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </section>

          <section className="section-head">
            <div>
              <h2>Available Listings</h2>
              <p>{products.length} live products found</p>
            </div>
          </section>

          {loading ? (
            <section className="loading-panel">Loading marketplace listings...</section>
          ) : products.length === 0 ? (
            <section className="empty-panel">
              <h2>No listings found</h2>
              <p>Try adjusting the search terms or category filters.</p>
            </section>
          ) : (
            <section className="product-grid">
              {products.map((product) => (
                <article className="product-card" key={product.id || product._id}>
                  <div className="product-card-top">
                    <div>
                      <p className="product-category-pill">{product.category || "Other"}</p>
                      <h3>{product.name}</h3>
                      <p className="product-farmer">{product.farmer || "Verified farmer"}</p>
                    </div>
                    <div className="product-avatar">
                      {(product.name || "P").slice(0, 1).toUpperCase()}
                    </div>
                  </div>

                  <p className="product-description">{product.description || "No description provided."}</p>

                  <div className="product-meta">
                    <span>{product.location || "Location not specified"}</span>
                    <span>
                      {product.quantity || 0} {product.unit || "unit"} available
                    </span>
                    <span>
                      {product.rating || 0} rating · {product.reviews || 0} reviews
                    </span>
                  </div>

                  <div className="product-footer">
                    <div>
                      <strong>{new Intl.NumberFormat("en-IN", {
                        style: "currency",
                        currency: "INR",
                        maximumFractionDigits: 0,
                      }).format(product.price || 0)}</strong>
                      <span> / {product.unit || "unit"}</span>
                    </div>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => addToCart(product)}
                      disabled={!product.quantity}
                    >
                      {product.quantity ? "Add to Cart" : "Out of Stock"}
                    </button>
                  </div>
                </article>
              ))}
            </section>
          )}
        </div>

        <aside className="cart-panel panel">
          <div className="panel-header">
            <h2>Cart</h2>
            <p>{cartItems} items selected</p>
          </div>

          {cart.length === 0 ? (
            <div className="mini-empty">Add listings to start an order.</div>
          ) : (
            <div className="cart-list">
              {cart.map((item) => {
                const id = item.id || item._id;
                return (
                  <div className="cart-item" key={id}>
                    <div>
                      <strong>{item.name}</strong>
                      <span>
                        {item.cartQuantity} x {item.unit || "unit"}
                      </span>
                    </div>
                    <div className="cart-actions">
                      <button type="button" onClick={() => updateCartItem(id, item.cartQuantity - 1)}>
                        -
                      </button>
                      <button type="button" onClick={() => updateCartItem(id, item.cartQuantity + 1)}>
                        +
                      </button>
                      <button type="button" onClick={() => removeCartItem(id)}>
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="cart-total-row">
            <span>Total</span>
            <strong>
              {new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0,
              }).format(cartTotal)}
            </strong>
          </div>

          <div className="checkout-form">
            <h3>Shipping Address</h3>
            {Object.keys(shippingAddress).map((field) => (
              <label className="field" key={field}>
                <span>{field.charAt(0).toUpperCase() + field.slice(1)}</span>
                <input
                  type="text"
                  value={shippingAddress[field]}
                  onChange={(e) =>
                    setShippingAddress((prev) => ({ ...prev, [field]: e.target.value }))
                  }
                />
              </label>
            ))}
          </div>

          <button type="button" className="btn btn-primary cart-checkout" onClick={handleCheckout} disabled={submittingOrder}>
            {submittingOrder ? "Placing Order..." : "Place Order"}
          </button>
        </aside>
      </section>
    </div>
  );
};

export default Marketplace;
