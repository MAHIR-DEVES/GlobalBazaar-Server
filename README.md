# GlobalBazaar Server Documentation

🌐 Global Bazaar Live Site: https://windy-cast.surge.sh

## 📌 Table of Contents

- [Technologies Used](#-technologies-used)
- [Server Features](#-server-features)
- [API Endpoints](#-api-endpoints)
- [Setup Instructions](#-setup-instructions)
- [Environment Variables](#-environment-variables)
- [Authentication Flow](#-authentication-flow)
- [Database Structure](#-database-structure)

## 🛠 Technologies Used

### Core Technologies

- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database (Atlas cloud)
- **Firebase Admin SDK** - For authentication

### Key Packages

- `cors` - Cross-Origin Resource Sharing
- `dotenv` - Environment variables
- `jsonwebtoken` - JWT authentication
- `cookie-parser` - Cookie handling
- `mongodb` - Official MongoDB driver

## 🌟 Server Features

1. **Product Management**

   - CRUD operations for products
   - Category-based filtering
   - Quantity management system

2. **Order System**

   - Order creation and tracking
   - Order history with product details
   - Order cancellation

3. **Authentication**

   - Firebase JWT verification
   - Protected routes
   - Email-based authorization

4. **Data Operations**
   - Complex aggregations
   - Document referencing
   - Bulk operations

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description        |
| ------ | -------- | ------------------ |
| POST   | `/jwt`   | Generate JWT token |

### Products

| Method | Endpoint              | Description                  |
| ------ | --------------------- | ---------------------------- |
| GET    | `/get-allProducts`    | Get all products (protected) |
| GET    | `/singleProduct/:id`  | Get single product details   |
| POST   | `/products`           | Add new product              |
| PUT    | `/updatedProduct/:id` | Update product               |
| DELETE | `/myProduct/:id`      | Delete product               |

### Orders

| Method | Endpoint              | Description         |
| ------ | --------------------- | ------------------- |
| POST   | `/orders`             | Create new order    |
| GET    | `/getAllOrder/:email` | Get user's orders   |
| DELETE | `/orders/:id`         | Cancel/delete order |

### Categories

| Method | Endpoint          | Description        |
| ------ | ----------------- | ------------------ |
| GET    | `/categories`     | Get all categories |
| GET    | `/filterCategory` | Filter by category |

### Quantity Management

| Method | Endpoint                 | Description               |
| ------ | ------------------------ | ------------------------- |
| PATCH  | `/updateQuantity/:id`    | Reduce product quantity   |
| PATCH  | `/addUpdateQuantity/:id` | Increase product quantity |

## 🚀 Setup Instructions

### Prerequisites

- Node.js (v14 or later)
- MongoDB Atlas account
- Firebase project with Service Account

### Installation Steps

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd project-directory
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables** Create a `.env` file in root directory with
   these variables:

   ```
   PORT=3000
   DB_USER=your_mongodb_username
   DB_PASS=your_mongodb_password
   JWT_SECRET_KEY=your_jwt_secret
   FB_SERVICE_KEY=your_firebase_service_account_base64
   ```

4. **Run the server**

   ```bash
   npm start
   # or for development
   npm run dev
   ```

5. **Test the server** The server should be running at:
   ```
   http://localhost:3000
   ```

## 🔐 Environment Variables

| Variable         | Required | Description                             |
| ---------------- | -------- | --------------------------------------- |
| `PORT`           | Yes      | Server port (default: 3000)             |
| `DB_USER`        | Yes      | MongoDB Atlas username                  |
| `DB_PASS`        | Yes      | MongoDB Atlas password                  |
| `JWT_SECRET_KEY` | Yes      | Secret for JWT signing                  |
| `FB_SERVICE_KEY` | Yes      | Base64 encoded Firebase service account |

## 🔄 Authentication Flow

1. Client authenticates with Firebase
2. Server generates JWT token
3. Token stored in HTTP-only cookie
4. For protected routes:
   - Client sends token in Authorization header
   - Server verifies token with Firebase Admin
   - Access granted if valid

## 🗃 Database Structure

### Collections

1. **Products**

   - \_id (ObjectId)
   - name (String)
   - category (String)
   - price (Number)
   - quantity (Number)
   - imageUrl (String)
   - email (String) [owner]
   - ...other product details

2. **Orders**

   - \_id (ObjectId)
   - orderId (ObjectId) [references Products]
   - customerEmail (String)
   - orderDate (Date)
   - status (String)

3. **Categories**

   - \_id (ObjectId)
   - name (String)
   - image (String)

4. **Slides**
   - For homepage marquee content

## 🚨 Troubleshooting

If you encounter issues:

1. Verify MongoDB connection string
2. Check Firebase service account key
3. Ensure all environment variables are set
4. Check CORS settings match your client URLs

For additional help, please open an issue in the repository.
