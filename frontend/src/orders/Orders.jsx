import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMyOrders } from "../marketplace/marketplaceService";
import "./Orders.css";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);

const formatDate = (value) => {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Not available" : date.toLocaleString("en-IN");
};

const getOrderItems = (order) => order.items || order.orderItems || order.products || [];

const getOrderTotal = (order) =>
  order.totalAmount || order.total || order.amount || getOrderItems(order).reduce((sum, item) => {
    const lineTotal = item.lineTotal || item.total || (item.quantity || 0) * (item.unitPrice || item.price || 0);
    return sum + lineTotal;
  }, 0);

const openInvoicePdf = (order) => {
  const items = getOrderItems(order);
  const shipping = order.shippingAddress || {};
  const invoiceId = order._id || order.id || `AGV-${Date.now()}`;

  const rows = items
    .map((item) => {
      const name = item.name || item.title || item.cropName || item.listingName || "Product";
      const quantity = item.quantity || 0;
      const price = item.unitPrice || item.price || 0;
      const total = item.lineTotal || item.total || quantity * price;
      return `
        <tr>
          <td>${name}</td>
          <td>${quantity}</td>
          <td>${formatCurrency(price)}</td>
          <td>${formatCurrency(total)}</td>
        </tr>
      `;
    })
    .join("");

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Invoice ${invoiceId}</title>
        <style>
          body { font-family: Arial, sans-serif; color: #17351f; padding: 32px; }
          .header { display: flex; justify-content: space-between; align-items: start; margin-bottom: 24px; }
          .brand { font-size: 28px; font-weight: 700; color: #2f6d3a; }
          .card { border: 1px solid #d6e9d5; border-radius: 16px; padding: 18px; margin-bottom: 18px; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; }
          th, td { border-bottom: 1px solid #e2eee1; padding: 10px 8px; text-align: left; }
          th { color: #2f6d3a; }
          .meta { color: #48604d; line-height: 1.7; }
          .total { font-size: 22px; font-weight: 700; color: #16361d; text-align: right; margin-top: 18px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand">AgroVeda</div>
            <div class="meta">Order Invoice</div>
          </div>
          <div class="meta">
            <div><strong>Invoice:</strong> ${invoiceId}</div>
            <div><strong>Date:</strong> ${formatDate(order.createdAt || order.date)}</div>
            <div><strong>Status:</strong> ${order.status || "Placed"}</div>
          </div>
        </div>

        <div class="card">
          <h3>Shipping Address</h3>
          <div class="meta">
            <div>${shipping.name || "Not available"}</div>
            <div>${shipping.phone || ""}</div>
            <div>${shipping.address || ""}</div>
            <div>${shipping.city || ""}, ${shipping.state || ""} ${shipping.pincode || ""}</div>
          </div>
        </div>

        <div class="card">
          <h3>Items</h3>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>${rows || '<tr><td colspan="4">No item details available</td></tr>'}</tbody>
          </table>
          <div class="total">Grand Total: ${formatCurrency(getOrderTotal(order))}</div>
        </div>
      </body>
    </html>
  `;

  const printWindow = window.open("", "_blank", "width=900,height=700");
  if (!printWindow) {
    return;
  }

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
};

const Orders = () => {
  const { session, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      try {
        const data = await getMyOrders(session?.token);
        setOrders(data);
        setError("");
      } catch (err) {
        setError(err.message || "Failed to load orders.");
      } finally {
        setLoading(false);
      }
    };

    if (session?.token) {
      loadOrders();
    }
  }, [session?.token]);

  return (
    <div className="page-shell orders-page">
      <section className="topbar">
        <div>
          <p className="eyebrow">Orders</p>
          <h1>My Orders</h1>
          <p className="section-copy">Review placed orders and generate a PDF invoice for each one.</p>
        </div>
        <div className="topbar-actions">
          <Link to="/dashboard" className="btn btn-secondary">
            Back to Dashboard
          </Link>
          <Link to="/marketplace" className="btn btn-primary">
            Browse Marketplace
          </Link>
          <button onClick={logout} className="btn btn-danger" type="button">
            Sign Out
          </button>
        </div>
      </section>

      {error && <div className="notice notice-error">{error}</div>}

      {loading ? (
        <section className="loading-panel">Loading orders...</section>
      ) : orders.length === 0 ? (
        <section className="empty-panel">
          <h2>No orders yet</h2>
          <p>Place an order from the marketplace and it will appear here.</p>
          <Link to="/marketplace" className="btn btn-primary">
            Go to Marketplace
          </Link>
        </section>
      ) : (
        <section className="orders-list">
          {orders.map((order, index) => {
            const items = getOrderItems(order);
            const orderId = order._id || order.id || `order-${index}`;
            const shipping = order.shippingAddress || {};

            return (
              <article className="order-card panel" key={orderId}>
                <div className="order-card-head">
                  <div>
                    <p className="eyebrow">Order #{index + 1}</p>
                    <h2>{orderId}</h2>
                    <p>{formatDate(order.createdAt || order.date)}</p>
                  </div>
                  <div className="order-summary">
                    <span className="status-pill status-active">{order.status || "Placed"}</span>
                    <strong>{formatCurrency(getOrderTotal(order))}</strong>
                  </div>
                </div>

                <div className="order-grid">
                  <div className="order-block">
                    <h3>Items</h3>
                    {items.length === 0 ? (
                      <p>No item data available.</p>
                    ) : (
                      items.map((item, itemIndex) => (
                        <div className="order-item" key={`${orderId}-${itemIndex}`}>
                          <strong>{item.name || item.title || item.cropName || item.listingName || "Product"}</strong>
                          <span>
                            {item.quantity || 0} x {formatCurrency(item.unitPrice || item.price || 0)}
                          </span>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="order-block">
                    <h3>Shipping</h3>
                    <p>{shipping.name || "Not available"}</p>
                    <p>{shipping.phone || ""}</p>
                    <p>{shipping.address || ""}</p>
                    <p>
                      {shipping.city || ""} {shipping.state || ""} {shipping.pincode || ""}
                    </p>
                  </div>
                </div>

                <div className="order-actions">
                  <button type="button" className="btn btn-primary" onClick={() => openInvoicePdf(order)}>
                    Download PDF
                  </button>
                  <Link to="/marketplace" className="btn btn-secondary">
                    Order Again
                  </Link>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
};

export default Orders;
