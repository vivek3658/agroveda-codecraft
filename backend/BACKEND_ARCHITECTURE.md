# Agriculture Platform Backend Architecture

## 1. High-Level Architecture

The current backend already has:

- JWT-based authentication
- Role-based users (`farmer`, `consumer`)
- Farmer-owned crop CRUD

To support analytics, marketplace, and profile with production-ready data, the backend should be organized as domain modules on top of MongoDB collections:

- `auth`
- `users`
- `profiles`
- `crops`
- `marketplace`
- `orders`
- `reviews`
- `analytics`
- `common` for middleware, utils, constants, and shared validation

### Recommended flow

1. A `User` authenticates with JWT.
2. A `FarmerProfile` or `ConsumerProfile` extends the base `User`.
3. A farmer creates `Crop` records they own.
4. A farmer publishes some crop inventory as a `Listing`.
5. A consumer places an `Order`.
6. An order contains `OrderItem` snapshots of listing data at purchase time.
7. A consumer can submit a `Review` after delivery.
8. Farmer analytics are computed from `crops`, `listings`, `orders`, `order_items`, and `reviews`.

### Recommended module structure

```text
src/
  config/
  db/
  constants/
    enums.js
  middlewares/
    auth.middleware.js
    error.middleware.js
    validate.middleware.js
  utils/
    apiFeatures.js
    pagination.js
    response.js
  modules/
    auth/
      auth.controller.js
      auth.service.js
      auth.routes.js
    users/
      user.model.js
      user.controller.js
      user.service.js
      user.routes.js
    profiles/
      farmer-profile.model.js
      consumer-profile.model.js
      profile.controller.js
      profile.service.js
      profile.routes.js
    crops/
      crop.model.js
      crop.controller.js
      crop.service.js
      crop.routes.js
    marketplace/
      listing.model.js
      marketplace.controller.js
      marketplace.service.js
      marketplace.routes.js
    orders/
      order.model.js
      order-item.model.js
      order.controller.js
      order.service.js
      order.routes.js
    reviews/
      review.model.js
      review.controller.js
      review.service.js
      review.routes.js
    analytics/
      analytics.controller.js
      analytics.service.js
      analytics.routes.js
  app.js
  index.js
```

### Why this is production-ready

- Keeps auth separate from domain data
- Preserves crop ownership by farmer
- Builds marketplace from real listings instead of hardcoded arrays
- Stores order-item snapshots so historical prices are not broken by later edits
- Keeps profile data normalized instead of overloading `User`
- Makes analytics derivable from transactional data

## 2. Entity Relationship Design

### Core relationships

- `User (1) -> (0..1) FarmerProfile`
- `User (1) -> (0..1) ConsumerProfile`
- `User(farmer) (1) -> (N) Crop`
- `Crop (1) -> (N) Listing`
- `User(farmer) (1) -> (N) Listing`
- `User(consumer) (1) -> (N) Order`
- `Order (1) -> (N) OrderItem`
- `Listing (1) -> (N) OrderItem`
- `Order (1) -> (N) Review`
- `Listing (1) -> (N) Review`
- `User(consumer) (1) -> (N) Review`
- `User(farmer) (1) -> (N) Review` through listing ownership

### Entity diagram

```text
User
  |_ FarmerProfile
  |_ ConsumerProfile

User(farmer) -> Crop -> Listing -> OrderItem -> Order <- User(consumer)
                                 \-> Review
```

## 3. Schema Definitions

MongoDB is document-oriented, but this design stays normalized enough for transactional consistency and aggregation.

### 3.1 Users collection

Collection: `users`

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `_id` | ObjectId | yes | primary key |
| `name` | String | yes | indexed for admin search |
| `email` | String | yes | unique index |
| `password` | String | no | nullable for Google auth |
| `googleId` | String | no | sparse index |
| `role` | String enum | yes | `farmer`, `consumer` |
| `status` | String enum | yes | `active`, `inactive`, `suspended` |
| `lastLoginAt` | Date | no | audit field |
| `createdAt` | Date | yes | timestamps |
| `updatedAt` | Date | yes | timestamps |

Indexes:

- unique `{ email: 1 }`
- sparse `{ googleId: 1 }`
- `{ role: 1, status: 1 }`

Enums:

- `role`: `farmer`, `consumer`
- `status`: `active`, `inactive`, `suspended`

### 3.2 Farmer profiles collection

Collection: `farmer_profiles`

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `_id` | ObjectId | yes | primary key |
| `userId` | ObjectId | yes | ref `users._id`, unique |
| `phone` | String | no | |
| `address` | String | no | |
| `city` | String | no | |
| `state` | String | no | |
| `pincode` | String | no | |
| `farmSizeAcres` | Number | no | normalized numeric value |
| `experienceYears` | Number | no | normalized numeric value |
| `specialization` | [String] | no | e.g. `["Organic", "Vegetables"]` |
| `farmName` | String | no | |
| `geo` | Object | no | `{ type: "Point", coordinates: [lng, lat] }` |
| `createdAt` | Date | yes | timestamps |
| `updatedAt` | Date | yes | timestamps |

Indexes:

- unique `{ userId: 1 }`
- `{ city: 1, state: 1 }`
- `2dsphere { geo: "2dsphere" }`

### 3.3 Consumer profiles collection

Collection: `consumer_profiles`

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `_id` | ObjectId | yes | primary key |
| `userId` | ObjectId | yes | ref `users._id`, unique |
| `phone` | String | no | |
| `address` | String | no | |
| `city` | String | no | |
| `state` | String | no | |
| `pincode` | String | no | |
| `preferredCategories` | [String] | no | optional personalization |
| `createdAt` | Date | yes | timestamps |
| `updatedAt` | Date | yes | timestamps |

Indexes:

- unique `{ userId: 1 }`
- `{ city: 1, state: 1 }`

### 3.4 Crops collection

Collection: `crops`

This extends your existing farmer-owned crop module and keeps crop management separate from marketplace visibility.

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `_id` | ObjectId | yes | primary key |
| `farmerId` | ObjectId | yes | ref `users._id` |
| `name` | String | yes | |
| `category` | String enum | yes | |
| `description` | String | yes | |
| `basePrice` | Number | yes | farmer base price |
| `quantityAvailable` | Number | yes | available stock for crop |
| `unit` | String enum | yes | `kg`, `quintal`, `ton`, `piece`, `dozen`, `crate` |
| `locationText` | String | yes | display location |
| `harvestDate` | Date | no | |
| `expiryDate` | Date | no | |
| `status` | String enum | yes | `draft`, `active`, `inactive`, `sold_out`, `archived` |
| `images` | [String] | no | |
| `metadata` | Object | no | optional crop-specific attributes |
| `createdAt` | Date | yes | timestamps |
| `updatedAt` | Date | yes | timestamps |

Indexes:

- `{ farmerId: 1, createdAt: -1 }`
- `{ category: 1, status: 1 }`
- `{ basePrice: 1 }`
- text index on `{ name, description, locationText }`

Enums:

- `category`: `Grains`, `Vegetables`, `Fruits`, `Legumes`, `Spices`, `Other`
- `status`: `draft`, `active`, `inactive`, `sold_out`, `archived`

### 3.5 Listings collection

Collection: `listings`

Listings are the actual marketplace records shown to consumers. A crop may have multiple listings over time, but typically one active listing per crop batch.

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `_id` | ObjectId | yes | primary key |
| `cropId` | ObjectId | yes | ref `crops._id` |
| `farmerId` | ObjectId | yes | ref `users._id`, denormalized for query speed |
| `title` | String | yes | often matches crop name |
| `description` | String | yes | public marketplace text |
| `category` | String enum | yes | copied from crop for search |
| `price` | Number | yes | public selling price |
| `unit` | String enum | yes | |
| `quantityAvailable` | Number | yes | sellable quantity |
| `minOrderQuantity` | Number | no | default 1 |
| `locationText` | String | yes | marketplace display |
| `images` | [String] | no | |
| `status` | String enum | yes | `draft`, `published`, `paused`, `sold_out`, `deleted` |
| `publishedAt` | Date | no | |
| `averageRating` | Number | yes | derived/cache field |
| `reviewsCount` | Number | yes | derived/cache field |
| `totalSoldQuantity` | Number | yes | derived/cache field |
| `createdAt` | Date | yes | timestamps |
| `updatedAt` | Date | yes | timestamps |

Indexes:

- `{ farmerId: 1, status: 1, createdAt: -1 }`
- `{ cropId: 1 }`
- `{ category: 1, price: 1 }`
- `{ status: 1, publishedAt: -1 }`
- text index on `{ title, description, locationText }`

Enums:

- `status`: `draft`, `published`, `paused`, `sold_out`, `deleted`

### 3.6 Orders collection

Collection: `orders`

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `_id` | ObjectId | yes | primary key |
| `consumerId` | ObjectId | yes | ref `users._id` |
| `orderNumber` | String | yes | unique human-readable identifier |
| `status` | String enum | yes | |
| `paymentStatus` | String enum | yes | |
| `paymentMethod` | String enum | yes | |
| `subtotal` | Number | yes | sum of items |
| `deliveryFee` | Number | yes | |
| `taxAmount` | Number | yes | optional tax |
| `discountAmount` | Number | yes | |
| `grandTotal` | Number | yes | final payable |
| `shippingAddress` | Object | yes | snapshot |
| `placedAt` | Date | yes | |
| `deliveredAt` | Date | no | |
| `cancelledAt` | Date | no | |
| `createdAt` | Date | yes | timestamps |
| `updatedAt` | Date | yes | timestamps |

Suggested embedded `shippingAddress`:

```json
{
  "name": "Aman Sharma",
  "phone": "9876543210",
  "address": "Plot 12, MG Road",
  "city": "Indore",
  "state": "Madhya Pradesh",
  "pincode": "452001"
}
```

Indexes:

- unique `{ orderNumber: 1 }`
- `{ consumerId: 1, createdAt: -1 }`
- `{ status: 1, paymentStatus: 1 }`

Enums:

- `status`: `pending`, `confirmed`, `packed`, `shipped`, `delivered`, `cancelled`
- `paymentStatus`: `pending`, `paid`, `failed`, `refunded`
- `paymentMethod`: `cod`, `upi`, `card`, `net_banking`, `wallet`

### 3.7 Order items collection

Collection: `order_items`

Order items should be a separate collection because analytics often groups by farmer, crop, and listing. It can also be embedded if order volume is small, but separate documents make analytics cleaner.

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `_id` | ObjectId | yes | primary key |
| `orderId` | ObjectId | yes | ref `orders._id` |
| `listingId` | ObjectId | yes | ref `listings._id` |
| `cropId` | ObjectId | yes | ref `crops._id` |
| `farmerId` | ObjectId | yes | ref `users._id` |
| `consumerId` | ObjectId | yes | ref `users._id` |
| `productNameSnapshot` | String | yes | immutable snapshot |
| `farmerNameSnapshot` | String | yes | immutable snapshot |
| `pricePerUnit` | Number | yes | immutable snapshot |
| `unit` | String | yes | immutable snapshot |
| `quantity` | Number | yes | |
| `lineTotal` | Number | yes | `pricePerUnit * quantity` |
| `status` | String enum | yes | per-item fulfillment state |
| `deliveredAt` | Date | no | |
| `createdAt` | Date | yes | timestamps |
| `updatedAt` | Date | yes | timestamps |

Indexes:

- `{ orderId: 1 }`
- `{ farmerId: 1, createdAt: -1 }`
- `{ listingId: 1 }`
- `{ cropId: 1 }`
- `{ consumerId: 1 }`
- `{ farmerId: 1, status: 1, deliveredAt: -1 }`

Enums:

- `status`: `pending`, `confirmed`, `packed`, `shipped`, `delivered`, `cancelled`

### 3.8 Reviews collection

Collection: `reviews`

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `_id` | ObjectId | yes | primary key |
| `listingId` | ObjectId | yes | ref `listings._id` |
| `orderId` | ObjectId | yes | ref `orders._id` |
| `orderItemId` | ObjectId | yes | ref `order_items._id` |
| `cropId` | ObjectId | yes | ref `crops._id` |
| `farmerId` | ObjectId | yes | ref `users._id` |
| `consumerId` | ObjectId | yes | ref `users._id` |
| `rating` | Number | yes | 1 to 5 |
| `comment` | String | no | |
| `status` | String enum | yes | `published`, `hidden` |
| `createdAt` | Date | yes | timestamps |
| `updatedAt` | Date | yes | timestamps |

Indexes:

- unique `{ orderItemId: 1, consumerId: 1 }`
- `{ listingId: 1, createdAt: -1 }`
- `{ farmerId: 1, rating: -1 }`
- `{ cropId: 1 }`

## 4. REST API Endpoint Contract

The response style below matches your current API shape using `success`, `message`, and `data`.

### 4.1 Profile APIs

#### GET `/api/profile/me`

Returns merged base user + role-specific profile.

Auth: required

#### PUT `/api/profile/me`

Creates or updates the current user profile.

Auth: required

#### GET `/api/profile/:userId`

Optional public farmer profile for marketplace display.

Auth: optional or protected depending on product rules

### 4.2 Marketplace APIs

#### GET `/api/marketplace/listings`

Public marketplace search with filters.

Query params:

- `search`
- `category`
- `minPrice`
- `maxPrice`
- `location`
- `sortBy=price|rating|createdAt`
- `order=asc|desc`
- `page`
- `limit`

#### GET `/api/marketplace/listings/:id`

Get listing details with farmer summary and reviews.

#### POST `/api/marketplace/listings`

Create listing from an owned crop.

Auth: farmer only

#### PUT `/api/marketplace/listings/:id`

Update own listing.

Auth: farmer only

#### PATCH `/api/marketplace/listings/:id/status`

Pause, publish, or mark sold out.

Auth: farmer only

#### GET `/api/marketplace/my-listings`

Farmer listing dashboard.

Auth: farmer only

#### POST `/api/orders`

Create consumer order from listing items.

Auth: consumer only

#### GET `/api/orders/my-orders`

Consumer order history.

Auth: consumer only

#### POST `/api/reviews`

Create review for delivered order item.

Auth: consumer only

### 4.3 Analytics APIs

#### GET `/api/analytics/farmer/overview`

Auth: farmer only

Query params:

- `from`
- `to`

Returns the exact shape your React dashboard already expects:

```json
{
  "totalCrops": 0,
  "activeCrops": 0,
  "totalRevenue": 0,
  "monthlyRevenue": 0,
  "cropStats": [],
  "monthlyTrends": [],
  "topProducts": []
}
```

#### GET `/api/analytics/farmer/revenue-trends`

Detailed chart endpoint if dashboard later grows.

#### GET `/api/analytics/farmer/top-products`

Detailed top-products endpoint if dashboard later grows.

## 5. Sample JSON Responses

### 5.1 GET `/api/profile/me`

```json
{
  "success": true,
  "data": {
    "id": "6612d7a1a22f1e0bd4567890",
    "role": "farmer",
    "name": "Ravi Patel",
    "email": "ravi@example.com",
    "phone": "9876543210",
    "address": "Village Rampura",
    "city": "Indore",
    "state": "Madhya Pradesh",
    "pincode": "452001",
    "farmSize": "12 acres",
    "experience": "8 years",
    "specialization": "Organic Vegetables"
  }
}
```

### 5.2 PUT `/api/profile/me`

Request:

```json
{
  "name": "Ravi Patel",
  "phone": "9876543210",
  "address": "Village Rampura",
  "city": "Indore",
  "state": "Madhya Pradesh",
  "pincode": "452001",
  "farmSize": "12 acres",
  "experience": "8 years",
  "specialization": "Organic Vegetables"
}
```

Response:

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "6612d7a1a22f1e0bd4567890",
    "role": "farmer",
    "name": "Ravi Patel",
    "email": "ravi@example.com",
    "phone": "9876543210",
    "address": "Village Rampura",
    "city": "Indore",
    "state": "Madhya Pradesh",
    "pincode": "452001",
    "farmSize": "12 acres",
    "experience": "8 years",
    "specialization": "Organic Vegetables"
  }
}
```

### 5.3 GET `/api/marketplace/listings`

```json
{
  "success": true,
  "data": {
    "listings": [
      {
        "id": "6612d9fea22f1e0bd4567801",
        "name": "Fresh Tomatoes",
        "farmer": "Ravi Patel",
        "location": "Indore, Madhya Pradesh",
        "price": 32,
        "unit": "kg",
        "quantity": 120,
        "category": "Vegetables",
        "description": "Naturally grown red tomatoes harvested this week.",
        "image": "https://cdn.example.com/listings/tomato-1.jpg",
        "rating": 4.6,
        "reviews": 28
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "pages": 1
    }
  }
}
```

### 5.4 GET `/api/marketplace/listings/:id`

```json
{
  "success": true,
  "data": {
    "id": "6612d9fea22f1e0bd4567801",
    "name": "Fresh Tomatoes",
    "farmer": {
      "id": "6612d7a1a22f1e0bd4567890",
      "name": "Ravi Patel",
      "location": "Indore, Madhya Pradesh",
      "rating": 4.7
    },
    "location": "Indore, Madhya Pradesh",
    "price": 32,
    "unit": "kg",
    "quantity": 120,
    "category": "Vegetables",
    "description": "Naturally grown red tomatoes harvested this week.",
    "images": [
      "https://cdn.example.com/listings/tomato-1.jpg"
    ],
    "rating": 4.6,
    "reviews": 28
  }
}
```

### 5.5 GET `/api/analytics/farmer/overview`

```json
{
  "success": true,
  "data": {
    "totalCrops": 14,
    "activeCrops": 9,
    "totalRevenue": 184500,
    "monthlyRevenue": 28600,
    "cropStats": [
      {
        "name": "Tomato",
        "count": 4,
        "revenue": 52000,
        "status": "active"
      },
      {
        "name": "Wheat",
        "count": 3,
        "revenue": 74000,
        "status": "active"
      }
    ],
    "monthlyTrends": [
      {
        "month": "Jan",
        "revenue": 12000,
        "crops": 3
      },
      {
        "month": "Feb",
        "revenue": 21000,
        "crops": 5
      }
    ],
    "topProducts": [
      {
        "name": "Wheat",
        "sales": 1800,
        "revenue": 74000
      },
      {
        "name": "Tomato",
        "sales": 1450,
        "revenue": 52000
      }
    ]
  }
}
```

### 5.6 POST `/api/orders`

Request:

```json
{
  "items": [
    {
      "listingId": "6612d9fea22f1e0bd4567801",
      "quantity": 5
    }
  ],
  "shippingAddress": {
    "name": "Aman Sharma",
    "phone": "9988776655",
    "address": "42 Market Road",
    "city": "Bhopal",
    "state": "Madhya Pradesh",
    "pincode": "462001"
  },
  "paymentMethod": "cod"
}
```

Response:

```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "orderId": "6612f0d7a22f1e0bd4567901",
    "orderNumber": "AGR-20260404-1001",
    "status": "pending",
    "paymentStatus": "pending",
    "grandTotal": 160
  }
}
```

## 6. How Analytics Aggregates Are Computed

Analytics should come from database aggregation pipelines, not cached frontend math.

### `totalCrops`

Count all `crops` where:

- `farmerId = currentUser._id`
- optionally filtered by date range

Mongo idea:

```js
db.crops.countDocuments({ farmerId })
```

### `activeCrops`

Count `crops` with:

- `farmerId = currentUser._id`
- `status = "active"`

### `totalRevenue`

Sum `order_items.lineTotal` where:

- `farmerId = currentUser._id`
- `status = "delivered"`

This is more accurate than using crop price because actual revenue belongs to fulfilled sales.

### `monthlyRevenue`

Sum `order_items.lineTotal` where:

- `farmerId = currentUser._id`
- `status = "delivered"`
- `deliveredAt` inside current month

### `cropStats`

Group by crop name or crop id:

1. Start from `crops` for the current farmer
2. Lookup matching `order_items`
3. Sum revenue per crop
4. Count crop records or listing count depending on the dashboard meaning

Suggested output mapping:

- `name`: crop name
- `count`: number of listings or crop batches
- `revenue`: sum of delivered order item revenue
- `status`: crop status, or `"active"` if any live listing exists

### `monthlyTrends`

Group delivered `order_items` by month:

- revenue = `sum(lineTotal)`
- crops = `countDistinct(cropId)` or `count(orderItem)` depending on chart meaning

Recommended:

- use `countDistinct(cropId)` if you want "number of crop products sold"
- use `count(orderItem)` if you want "sales transactions"

### `topProducts`

Group delivered `order_items` by `cropId` or `listingId`:

- `sales = sum(quantity)`
- `revenue = sum(lineTotal)`
- sort by revenue descending
- limit 5

### Reviews and ratings

Marketplace `rating` and `reviews` should not be typed manually.

- `rating` = average of published review ratings for a listing
- `reviews` = count of published reviews

These can be computed on demand or cached in `listings.averageRating` and `listings.reviewsCount`.

## 7. Frontend Integration Plan

The React frontend should stop using dummy arrays and move all data access into service files and hooks.

### Recommended frontend service structure

```text
src/
  services/
    apiClient.js
    auth.service.js
    profile.service.js
    marketplace.service.js
    analytics.service.js
    crop.service.js
    order.service.js
    review.service.js
  hooks/
    useAuth.js
    useProfile.js
    useMarketplace.js
    useFarmerAnalytics.js
    useMyCrops.js
    useMyListings.js
  features/
    profile/
    marketplace/
    analytics/
```

### `apiClient.js`

- Centralize `baseURL`
- Attach JWT token in `Authorization: Bearer <token>`
- Handle `401` globally

### Suggested service responsibilities

- `profile.service.js`
  - `getMyProfile()`
  - `updateMyProfile(payload)`

- `marketplace.service.js`
  - `getListings(params)`
  - `getListingById(id)`
  - `createListing(payload)`
  - `updateListing(id, payload)`
  - `changeListingStatus(id, status)`

- `analytics.service.js`
  - `getFarmerOverview(params)`

### State fetching recommendation

Use either:

- React Query / TanStack Query if available
- or custom hooks with `useEffect` + loading/error state

Recommended query keys:

- `['profile', userId]`
- `['marketplace', filters]`
- `['listing', listingId]`
- `['analytics', 'farmer-overview', dateRange]`
- `['my-crops', filters]`
- `['my-listings', filters]`

### Mapping backend response to current dummy shapes

Your current frontend can keep its view models with minimal changes:

- analytics API already returns the same shape
- marketplace listing API returns the same fields as the dummy product card
- profile API returns the same fields the profile page expects

## 8. Migration Steps From Dummy Data to Real APIs

### Step 1. Stabilize auth and user role handling

- Fix role default to always use `consumer`, not `user`
- Keep JWT payload as `{ id, role, email }`
- Add route guards for `farmer` and `consumer`

### Step 2. Normalize profile storage

- Keep base auth fields in `users`
- Move extended fields into `farmer_profiles` and `consumer_profiles`
- Implement `GET /api/profile/me` and `PUT /api/profile/me`

### Step 3. Split crop inventory from marketplace listing

- Keep `crops` as farmer inventory/ownership data
- Add `listings` for public sale records
- Do not expose raw crop docs directly as marketplace cards

### Step 4. Add transactional commerce tables

- Implement `orders` and `order_items`
- Reduce listing quantity on order confirmation
- Freeze price/name snapshots inside `order_items`

### Step 5. Add reviews

- Only allow reviews for delivered order items
- Recompute or cache listing rating metrics

### Step 6. Replace frontend dummy marketplace data

- Replace hardcoded product array with `GET /api/marketplace/listings`
- Replace detail page mock with `GET /api/marketplace/listings/:id`

### Step 7. Replace frontend dummy profile data

- Load profile from `GET /api/profile/me`
- Save edits via `PUT /api/profile/me`

### Step 8. Replace frontend analytics dummy data

- Load farmer dashboard from `GET /api/analytics/farmer/overview`
- Use query params for date filtering later if needed

### Step 9. Add seed data and migration scripts

- Create seeders for users, crops, listings, orders, reviews
- Backfill listing and review aggregates

## 9. Recommended Implementation Order In This Repo

Given the current codebase, the safest order is:

1. Fix `auth.service.js` role default from `user` to `consumer`
2. Extend `User` status fields and indexes
3. Add profile module
4. Add listing module
5. Add order and order item modules
6. Add review module
7. Add analytics module with aggregation pipelines
8. Update Swagger docs

## 10. Notes For Your Existing Codebase

- Your existing `Crop` model already contains some marketplace fields like price, quantity, unit, and location.
- For production, treat `Crop` as farmer inventory and introduce `Listing` for consumer-facing sale records.
- Your current auth code uses `role || 'user'` in registration and Google login, but the `User` schema only allows `farmer` or `consumer`. This should be corrected immediately to `consumer`.
- Your current `getMe` endpoint returns only the base user. Keep it for auth session checks, but add `/api/profile/me` for the full editable profile.
