# Spam Detection Backend API

A robust Node.js/Express REST API for detecting and reporting spam phone numbers. Built with Prisma ORM, PostgreSQL, and JWT authentication.

## Features

- ** Phone Number Spam Detection**: Report and check spam status of phone numbers
- ** JWT Authentication**: Secure user registration and login
- ** Contact Management**: Store and manage user contacts
- ** Smart Search**: Search by name or phone number with spam likelihood
- ** Security**: Rate limiting, CORS, Helmet middleware
- ** Analytics**: Spam report counting and likelihood calculation
- ** Production Ready**: Optimized for Vercel deployment

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with bcrypt
- **Validation**: Zod schema validation
- **Security**: Helmet, CORS, Rate limiting
- **Deployment**: Vercel ready

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn package manager

## �� Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/spam-detection-backend.git
cd spam-detection-backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/spam_detection"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-at-least-12-characters"
JWT_EXPIRES_IN="7d"

# Server Configuration
NODE_ENV="development"
PORT=3000

# CORS (optional)
ALLOWED_ORIGINS="http://localhost:3000,http://localhost:3001"
```

### 4. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# (Optional) Seed the database with sample data
npm run seed
```

### 5. Start the Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3000`

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "phoneNumber": "+1234567890",
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "phoneNumber": "+1234567890",
    "email": "john@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "phoneNumber": "+1234567890",
  "password": "securepassword"
}
```

### Search Endpoints

#### Search by Name
```http
GET /api/search/name?name=John
Authorization: Bearer <your-jwt-token>
```

**Response:**
```json
{
  "results": [
    {
      "name": "John Doe",
      "phoneNumber": "+1234567890",
      "spamLikelihood": 0,
      "isRegistered": true
    }
  ],
  "count": 1
}
```

#### Search by Phone Number
```http
GET /api/search/phone?phoneNumber=+1234567890
Authorization: Bearer <your-jwt-token>
```

### Spam Detection Endpoints

#### Report Spam
```http
POST /api/spam/report
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "phoneNumber": "+1234567890"
}
```

**Response:**
```json
{
  "message": "Phone number reported as spam successfully",
  "spamReport": {
    "id": 1,
    "phoneNumber": "+1234567890",
    "reportedAt": "2024-01-01T00:00:00.000Z"
  },
  "totalSpamReports": 1
}
```

#### Check Spam Status
```http
GET /api/spam/status?phoneNumber=+1234567890
Authorization: Bearer <your-jwt-token>
```

**Response:**
```json
{
  "phoneNumber": "+1234567890",
  "spamReports": 1,
  "spamLikelihood": 10,
  "isSpam": false
}
```

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🔧 Database Schema

### Users Table
- `id` (Primary Key)
- `name` (String)
- `phoneNumber` (String, Unique)
- `email` (String, Optional)
- `password` (String, Hashed)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

### Contacts Table
- `id` (Primary Key)
- `name` (String)
- `phoneNumber` (String)
- `userId` (Foreign Key to Users)

### Spam Reports Table
- `id` (Primary Key)
- `phoneNumber` (String)
- `reportedBy` (Foreign Key to Users)
- `createdAt` (DateTime)

## �� Deployment

### Deploy to Vercel

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Login to Vercel**
```bash
vercel login
```

3. **Deploy**
```bash
vercel --prod
```

4. **Set Environment Variables**
```bash
vercel env add DATABASE_URL
vercel env add JWT_SECRET
vercel env add JWT_EXPIRES_IN
vercel env add NODE_ENV
```

5. **Run Database Migrations**
```bash
vercel env pull .env.local
npx prisma migrate deploy
```

### Environment Variables for Production

Make sure to set these in your Vercel dashboard:
- `DATABASE_URL`: Your PostgreSQL connection string
- `JWT_SECRET`: Strong secret key (at least 12 characters)
- `JWT_EXPIRES_IN`: Token expiration (e.g., "7d")
- `NODE_ENV`: "production"
- `ALLOWED_ORIGINS`: Your frontend domain(s)

## 🔒 Security Features

- **Rate Limiting**: 100 requests per 15 minutes (general), 5 requests per 15 minutes (auth)
- **CORS Protection**: Configurable allowed origins
- **Helmet**: Security headers
- **Input Validation**: Zod schema validation
- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based auth

## �� Testing

```bash
# Run tests (if implemented)
npm test

# Health check
curl http://localhost:3000/health
```

## �� API Rate Limits

- **General endpoints**: 100 requests per 15 minutes
- **Authentication endpoints**: 5 requests per 15 minutes
- **Search endpoints**: 100 requests per 15 minutes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

If you encounter any issues:

1. Check the [Issues](../../issues) page
2. Create a new issue with detailed information
3. Include error logs and steps to reproduce

## 🔗 Links

- [Live Demo](https://your-app.vercel.app)
- [API Documentation](https://your-app.vercel.app/docs)
- [Vercel Dashboard](https://vercel.com/dashboard)

---

Made with ❤️ by [Your Name]
