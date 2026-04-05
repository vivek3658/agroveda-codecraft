const Crop = require('../models/Crop');
const Listing = require('../models/Listing');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const User = require('../models/User');

const generateOrderNumber = () => {
  const now = new Date();
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const random = Math.floor(1000 + Math.random() * 9000);
  return `AGR-${stamp}-${random}`;
};

const generateInvoiceNumber = () => {
  const now = new Date();
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const random = Math.floor(1000 + Math.random() * 9000);
  return `INV-${stamp}-${random}`;
};

const createOrder = async (buyerId, payload) => {
  const { items, shippingAddress, paymentMethod = 'cod' } = payload;

  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('At least one item is required');
  }

  const buyer = await User.findById(buyerId);
  if (!buyer) {
    throw new Error('Buyer not found');
  }

  const builtItems = [];
  let subtotal = 0;

  for (const item of items) {
    const listing = await Listing.findById(item.listingId).populate('farmer', 'name');
    if (!listing || listing.status !== 'published') {
      throw new Error('Listing not available');
    }

    if (Number(item.quantity) > listing.quantity) {
      throw new Error(`Insufficient quantity for ${listing.name}`);
    }

    const lineTotal = listing.price * Number(item.quantity);
    subtotal += lineTotal;

    builtItems.push({
      listing: listing._id,
      crop: listing.crop,
      farmer: listing.farmer._id,
      name: listing.name,
      farmerName: listing.farmer.name,
      price: listing.price,
      unit: listing.unit,
      quantity: Number(item.quantity),
      lineTotal
    });
  }

  const order = await Order.create({
    consumer: buyerId,
    orderNumber: generateOrderNumber(),
    items: builtItems,
    paymentMethod,
    subtotal,
    deliveryFee: 0,
    taxAmount: 0,
    discountAmount: 0,
    grandTotal: subtotal,
    invoiceNumber: generateInvoiceNumber(),
    invoiceDate: new Date(),
    shippingAddress
  });

  await OrderItem.insertMany(
    builtItems.map((item) => ({
      order: order._id,
      listing: item.listing,
      crop: item.crop,
      seller: item.farmer,
      buyer: buyerId,
      productNameSnapshot: item.name,
      sellerNameSnapshot: item.farmerName,
      pricePerUnit: item.price,
      unit: item.unit,
      quantity: item.quantity,
      lineTotal: item.lineTotal,
      status: order.status
    }))
  );

  for (const item of builtItems) {
    const listing = await Listing.findById(item.listing);
    const crop = await Crop.findById(item.crop);

    if (listing) {
      listing.quantity = Math.max(0, listing.quantity - item.quantity);
      listing.totalSalesQuantity = (listing.totalSalesQuantity || 0) + item.quantity;
      listing.totalRevenue = (listing.totalRevenue || 0) + item.lineTotal;
      listing.status = listing.quantity > 0 ? 'published' : 'sold_out';
      await listing.save();
    }

    if (crop) {
      crop.quantity = Math.max(0, crop.quantity - item.quantity);
      crop.isAvailable = crop.quantity > 0;
      await crop.save();
    }
  }

  return {
    orderId: order._id,
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    grandTotal: order.grandTotal,
    invoiceNumber: order.invoiceNumber
  };
};

const getMyOrders = async (buyerId) => {
  const orders = await Order.find({ consumer: buyerId }).sort({ createdAt: -1 });

  return orders.map((order) => ({
    id: order._id,
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    grandTotal: order.grandTotal,
    invoiceNumber: order.invoiceNumber,
    invoiceDate: order.invoiceDate,
    items: order.items.map((item) => ({
      id: item._id,
      name: item.name,
      farmer: item.farmerName,
      price: item.price,
      quantity: item.quantity,
      unit: item.unit,
      lineTotal: item.lineTotal
    })),
    createdAt: order.createdAt
  }));
};

const getOrderById = async (buyerId, orderId) => {
  const order = await Order.findOne({ _id: orderId, consumer: buyerId });
  if (!order) {
    throw new Error('Order not found');
  }

  return {
    id: order._id,
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    subtotal: order.subtotal,
    deliveryFee: order.deliveryFee,
    taxAmount: order.taxAmount,
    discountAmount: order.discountAmount,
    grandTotal: order.grandTotal,
    invoice: {
      invoiceNumber: order.invoiceNumber,
      invoiceDate: order.invoiceDate,
      invoicePdfUrl: order.invoicePdfUrl
    },
    shippingAddress: order.shippingAddress,
    items: order.items,
    createdAt: order.createdAt
  };
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById
};
