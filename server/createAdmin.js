const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = 'mongodb+srv://sashmithasashmitha70_db_user:sabiya123@expenditure.oasu6ix.mongodb.net/expensetracker?retryWrites=true&w=majority';

async function createAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const result = await mongoose.connection.db.collection('users').insertOne({
      username: 'admin',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin',
      createdAt: new Date()
    });

    console.log('Admin created! ID:', result.insertedId);
    console.log('Login with: admin@example.com / admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

createAdmin();
