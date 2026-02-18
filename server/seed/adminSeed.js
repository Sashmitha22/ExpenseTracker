const User = require('../models/User');
const bcrypt = require('bcryptjs');

const seedAdmin = async () => {
  try {
    const adminEmail = 'sashmithasashmith70@gmail.com';
    const adminPassword = 'sabiya2209';

    const existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {
      const admin = new User({
        username: 'Admin',
        email: adminEmail,
        password: adminPassword,
        role: 'admin'
      });
      
      await admin.save();
      console.log('Admin user seeded successfully');
    } else {
      const isMatch = await existingAdmin.comparePassword(adminPassword);
      if (!isMatch) {
        existingAdmin.password = await bcrypt.hash(adminPassword, 12);
        await existingAdmin.save();
        console.log('Admin password updated');
      } else {
        console.log('Admin user already exists');
      }
    }
  } catch (error) {
    console.error('Error seeding admin:', error.message);
  }
};

module.exports = seedAdmin;
