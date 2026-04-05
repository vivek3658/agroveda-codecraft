const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Farmer-to-Consumer Marketplace API',
      version: '1.0.0',
      description: 'API documentation for the agriculture marketplace backend',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        ApiSuccess: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Request successful' }
          }
        },
        UserAuth: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '6612d7a1a22f1e0bd4567890' },
            name: { type: 'string', example: 'Ravi Patel' },
            email: { type: 'string', example: 'ravi@example.com' },
            role: { type: 'string', enum: ['farmer', 'consumer'], example: 'farmer' }
          }
        },
        Crop: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            farmer: { type: 'string' },
            name: { type: 'string', example: 'Tomato' },
            category: { type: 'string', example: 'Vegetables' },
            description: { type: 'string', example: 'Fresh farm tomatoes' },
            price: { type: 'number', example: 32 },
            quantity: { type: 'number', example: 120 },
            unit: { type: 'string', example: 'kg' },
            images: {
              type: 'array',
              items: { type: 'string' }
            },
            location: { type: 'string', example: 'Indore, Madhya Pradesh' },
            harvestDate: { type: 'string', format: 'date-time' },
            expiryDate: { type: 'string', format: 'date-time' },
            isAvailable: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Profile: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            role: { type: 'string', enum: ['farmer', 'consumer'] },
            name: { type: 'string', example: 'Ravi Patel' },
            email: { type: 'string', example: 'ravi@example.com' },
            phone: { type: 'string', example: '9876543210' },
            address: { type: 'string', example: 'Village Rampura' },
            city: { type: 'string', example: 'Indore' },
            state: { type: 'string', example: 'Madhya Pradesh' },
            pincode: { type: 'string', example: '452001' },
            farmSize: { type: 'string', example: '12 acres' },
            experience: { type: 'string', example: '8 years' },
            specialization: { type: 'string', example: 'Organic Vegetables' }
          }
        },
        MarketplaceListing: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string', example: 'Fresh Tomatoes' },
            farmer: { type: 'string', example: 'Ravi Patel' },
            location: { type: 'string', example: 'Indore, Madhya Pradesh' },
            price: { type: 'number', example: 32 },
            unit: { type: 'string', example: 'kg' },
            quantity: { type: 'number', example: 120 },
            category: { type: 'string', example: 'Vegetables' },
            description: { type: 'string', example: 'Naturally grown tomatoes harvested this week.' },
            image: { type: 'string', example: 'https://cdn.example.com/listings/tomato-1.jpg' },
            rating: { type: 'number', example: 4.6 },
            reviews: { type: 'number', example: 28 }
          }
        },
        OrderCreateRequest: {
          type: 'object',
          required: ['items', 'shippingAddress'],
          properties: {
            items: {
              type: 'array',
              items: {
                type: 'object',
                required: ['listingId', 'quantity'],
                properties: {
                  listingId: { type: 'string' },
                  quantity: { type: 'number', example: 5 }
                }
              }
            },
            shippingAddress: {
              type: 'object',
              required: ['name', 'phone', 'address', 'city', 'state', 'pincode'],
              properties: {
                name: { type: 'string' },
                phone: { type: 'string' },
                address: { type: 'string' },
                city: { type: 'string' },
                state: { type: 'string' },
                pincode: { type: 'string' }
              }
            },
            paymentMethod: {
              type: 'string',
              enum: ['cod', 'upi', 'card', 'net_banking', 'wallet'],
              example: 'cod'
            }
          }
        },
        ReviewCreateRequest: {
          type: 'object',
          required: ['orderId', 'listingId', 'rating'],
          properties: {
            orderId: { type: 'string' },
            listingId: { type: 'string' },
            rating: { type: 'number', minimum: 1, maximum: 5, example: 5 },
            comment: { type: 'string', example: 'Very fresh and good quality.' }
          }
        },
        FarmerAnalyticsOverview: {
          type: 'object',
          properties: {
            totalCrops: { type: 'number', example: 14 },
            activeCrops: { type: 'number', example: 9 },
            totalRevenue: { type: 'number', example: 184500 },
            monthlyRevenue: { type: 'number', example: 28600 },
            cropStats: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'Tomato' },
                  count: { type: 'number', example: 4 },
                  revenue: { type: 'number', example: 52000 },
                  status: { type: 'string', example: 'active' }
                }
              }
            },
            monthlyTrends: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  month: { type: 'string', example: 'Jan' },
                  revenue: { type: 'number', example: 12000 },
                  crops: { type: 'number', example: 3 }
                }
              }
            },
            topProducts: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'Wheat' },
                  sales: { type: 'number', example: 1800 },
                  revenue: { type: 'number', example: 74000 }
                }
              }
            }
          }
        }
      }
    },
  },
  apis: ['./src/routes/*.js'], // Path to the API docs
};

const specs = swaggerJsdoc(options);
module.exports = specs;
