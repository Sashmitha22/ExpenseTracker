# Advanced Expense Tracker with Secure Admin Panel

A full-stack expense tracker application with React.js frontend, Node.js/Express backend, and MongoDB Atlas database.

## Features

- **Authentication**: JWT-based auth with bcrypt password hashing
- **Admin Panel**: Full CRUD on users, view stats
- **User Features**: Add/Edit/Delete expenses, category-wise charts, date filtering, CSV export
- **UI**: Dark/Light mode, responsive design, toast notifications, pagination

## Prerequisites

- Node.js (v14+)
- MongoDB Atlas account

## Setup Instructions

### 1. Configure MongoDB

Create a MongoDB Atlas cluster and get your connection string. Update the `.env` file in `server/`:

```
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/expense-tracker?retryWrites=true&w=majority
JWT_SECRET=your_secret_key_here
PORT=5000
```

### 2. Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Run the Application

**Terminal 1 - Backend:**
```bash
cd server
npm start
```

**Terminal 2 - Frontend:**
```bash
cd client
npm start
```

The app will open at `http://localhost:3000`

## Default Admin Credentials

- **Email**: sashmithasashmith70@gmail.com
- **Password**: sabiya2209

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Expenses (Protected)
- `GET /api/expenses` - List expenses (with pagination & filters)
- `POST /api/expenses` - Add expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense
- `GET /api/expenses/category` - Get category stats
- `GET /api/expenses/export` - Export to CSV

### Users (Admin only)
- `GET /api/users` - List all users
- `GET /api/users/stats` - Get stats
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## Project Structure

```
ExpenseTracker/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── context/      # React context
│   │   └── utils/        # Utilities
│   └── public/
├── server/                # Express backend
│   ├── controllers/      # Route handlers
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   ├── middleware/       # Auth middleware
│   ├── config/          # Database config
│   └── seed/            # Admin seed script
└── package.json
```
