const Crop = require('../models/Crop');
const OrderItem = require('../models/OrderItem');

const getMonthStart = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
};

const formatMonth = (date) => date.toLocaleString('en-US', { month: 'short' });

const getFarmerOverview = async (farmerId) => {
  const [totalCrops, activeCrops, farmerCrops, revenueRows] = await Promise.all([
    Crop.countDocuments({ farmer: farmerId }),
    Crop.countDocuments({ farmer: farmerId, isAvailable: true }),
    Crop.find({ farmer: farmerId }).sort({ createdAt: -1 }),
    OrderItem.find({
      seller: farmerId,
      status: { $ne: 'cancelled' }
    }).select('createdAt productNameSnapshot quantity lineTotal')
  ]);

  const monthStart = getMonthStart();
  const totalRevenue = revenueRows.reduce((sum, row) => sum + row.lineTotal, 0);
  const monthlyRevenue = revenueRows
    .filter((row) => new Date(row.createdAt) >= monthStart)
    .reduce((sum, row) => sum + row.lineTotal, 0);

  const cropRevenueMap = new Map();
  const monthlyMap = new Map();
  const topProductsMap = new Map();

  for (const row of revenueRows) {
    const productName = row.productNameSnapshot;
    cropRevenueMap.set(productName, (cropRevenueMap.get(productName) || 0) + row.lineTotal);

    const month = formatMonth(new Date(row.createdAt));
    const currentMonth = monthlyMap.get(month) || { month, revenue: 0, crops: 0 };
    currentMonth.revenue += row.lineTotal;
    currentMonth.crops += row.quantity;
    monthlyMap.set(month, currentMonth);

    const currentProduct = topProductsMap.get(productName) || { name: productName, sales: 0, revenue: 0 };
    currentProduct.sales += row.quantity;
    currentProduct.revenue += row.lineTotal;
    topProductsMap.set(productName, currentProduct);
  }

  const cropNameCount = new Map();
  for (const crop of farmerCrops) {
    cropNameCount.set(crop.name, (cropNameCount.get(crop.name) || 0) + 1);
  }

  const cropStats = Array.from(cropNameCount.entries()).map(([name, count]) => {
    const crop = farmerCrops.find((entry) => entry.name === name);
    return {
      name,
      count,
      revenue: cropRevenueMap.get(name) || 0,
      status: crop?.isAvailable ? 'active' : 'inactive'
    };
  });

  const monthlyTrends = Array.from(monthlyMap.values()).sort((a, b) => {
    const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month);
  });

  const topProducts = Array.from(topProductsMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return {
    totalCrops,
    activeCrops,
    totalRevenue,
    monthlyRevenue,
    cropStats,
    monthlyTrends,
    topProducts
  };
};

module.exports = {
  getFarmerOverview
};
