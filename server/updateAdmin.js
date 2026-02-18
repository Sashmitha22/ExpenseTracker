const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = 'mongodb+srv://sashmithasashmitha70_db_user:sabiya123@expenditure.oasu6ix.mongodb.net/expensetracker?retryWrites=true&w=majority';

async function updateAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const hashedPassword = await bcrypt.hash('sabiya2209', 12);
    
    await mongoose.connection.db.collection('users').updateOne(
      { role: 'admin' },
      { 
        $set: { 
          email: 'sashmithasashmitha70@gmail.com',
          password: hashedPassword,
          username: 'admin'
        }
      }
    );

    console.log('Admin updated!');
    console.log('Login with: sashmithasashmitha70@gmail.com / sabiya2209');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

updateAdmin();
