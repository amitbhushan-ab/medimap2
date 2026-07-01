// backend/scripts/generateCredentials.js — FIX #3
// Run: node backend/scripts/generateCredentials.js
// Creates hashed passwords and prints plain text for testing
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/medimap';

const DEFAULT_PHARMACISTS = [
  { name: 'Apollo Pharmacy - Sector 16', email: 'apollo@medimap.com', password: 'Apollo@123', phone: '9876543210', address: 'Sector 16 Market, Faridabad', gstin: '06AABCU9603R1ZP', licenseNo: 'HR-PH-2024-001', city: 'Faridabad' },
  { name: 'MedPlus - NIT Faridabad', email: 'medplus@medimap.com', password: 'MedPlus@123', phone: '9876543211', address: 'NIT Market, Faridabad', gstin: '06BBBCU9603R1ZQ', licenseNo: 'HR-PH-2024-002', city: 'Faridabad' },
  { name: 'Jan Aushadhi - Sector 9', email: 'janaushadhi@medimap.com', password: 'JanAushadhi@123', phone: '9876543212', address: 'Sector 9, Faridabad', gstin: '06CCCCU9603R1ZR', licenseNo: 'HR-PH-2024-003', city: 'Faridabad' },
];

async function generate() {
  console.log('\n🔑 Generating Pharmacist Credentials\n');
  console.log('='.repeat(60));

  await mongoose.connect(MONGO_URI);
  const Pharmacist = require('../models/Pharmacist');

  const results = [];
  for (const ph of DEFAULT_PHARMACISTS) {
    const hashed = await bcrypt.hash(ph.password, 12);
    let pharmacist = await Pharmacist.findOne({ email: ph.email });

    if (pharmacist) {
      // Update password if exists
      pharmacist.password = hashed;
      pharmacist.isSuspended = false;
      pharmacist.isListed = true;
      await pharmacist.save();
      console.log(`✅ Updated: ${ph.name}`);
    } else {
      pharmacist = await Pharmacist.create({
        name: ph.name, email: ph.email, password: hashed,
        phone: ph.phone, address: ph.address, gstin: ph.gstin,
        licenseNo: ph.licenseNo, city: ph.city,
        isListed: true, isVerified: true, isSuspended: false,
        source: 'seeded',
        location: { type: 'Point', coordinates: [77.3178, 28.4089] },
      });
      console.log(`✅ Created: ${ph.name}`);
    }

    results.push({ ...ph, id: pharmacist._id.toString() });
  }

  console.log('\n' + '='.repeat(60));
  console.log('📋 PLAIN TEXT CREDENTIALS (save these):');
  console.log('='.repeat(60));
  results.forEach(r => {
    console.log(`\n🏥 ${r.name}`);
    console.log(`   ID:       ${r.id}`);
    console.log(`   Email:    ${r.email}`);
    console.log(`   Password: ${r.password}`);
  });

  console.log('\n' + '='.repeat(60));
  console.log('🛡️  ADMIN CREDENTIALS:');
  console.log(`   Admin Key: ${process.env.ADMIN_KEY || 'admin123'}`);
  console.log(`   URL: http://localhost:3000/admin`);
  console.log('='.repeat(60) + '\n');

  await mongoose.disconnect();
  console.log('✅ Done!\n');
}

generate().catch(err => { console.error('Error:', err.message); process.exit(1); });
