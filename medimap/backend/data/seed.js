// backend/data/seed.js — NO auto-seeding, only mock data export
// Pharmacies are seeded ONCE only if DB is empty

const mongoose = require('mongoose');

// ── Mock data for fallback (when MongoDB not connected) ───────
const mockMedicines = [
  { name:'Paracetamol 500mg', genericName:'Acetaminophen', category:'Analgesic', requiresPrescription:false, manufacturer:'Cipla', dosage:'500mg' },
  { name:'Amoxicillin 250mg', genericName:'Amoxicillin', category:'Antibiotic', requiresPrescription:true, manufacturer:'Sun Pharma', dosage:'250mg' },
  { name:'Metformin 500mg', genericName:'Metformin HCl', category:'Antidiabetic', requiresPrescription:true, manufacturer:'USV Ltd', dosage:'500mg' },
  { name:'Cetirizine 10mg', genericName:'Cetirizine HCl', category:'Antihistamine', requiresPrescription:false, manufacturer:"Dr. Reddy's", dosage:'10mg' },
  { name:'Azithromycin 500mg', genericName:'Azithromycin', category:'Antibiotic', requiresPrescription:true, manufacturer:'Cipla', dosage:'500mg' },
  { name:'Omeprazole 20mg', genericName:'Omeprazole', category:'Antacid', requiresPrescription:false, manufacturer:'Sun Pharma', dosage:'20mg' },
  { name:'Atorvastatin 10mg', genericName:'Atorvastatin', category:'Antilipemic', requiresPrescription:true, manufacturer:'Ranbaxy', dosage:'10mg' },
  { name:'Aspirin 75mg', genericName:'Acetylsalicylic acid', category:'Antiplatelet', requiresPrescription:false, manufacturer:'Bayer', dosage:'75mg' },
  { name:'Pantoprazole 40mg', genericName:'Pantoprazole', category:'Antacid', requiresPrescription:false, manufacturer:'Sun Pharma', dosage:'40mg' },
  { name:'Levothyroxine 50mcg', genericName:'Levothyroxine', category:'Thyroid', requiresPrescription:true, manufacturer:'Abbott', dosage:'50mcg' },
];

const mockPharmacies = [
  { _id:'p1', name:'Apollo Pharmacy - Sector 16', address:'Sector 16 Market, Faridabad', phone:'9876543210', rating:4.5, reviewCount:124, isOpen:true, chain:'Apollo', location:{ lat:28.4089, lng:77.3178, coordinates:[77.3178,28.4089] } },
  { _id:'p2', name:'MedPlus - NIT Faridabad', address:'NIT Market, Faridabad', phone:'9876543211', rating:4.3, reviewCount:89, isOpen:true, chain:'MedPlus', location:{ lat:28.4120, lng:77.3210, coordinates:[77.3210,28.4120] } },
  { _id:'p3', name:'Jan Aushadhi - Sector 9', address:'Sector 9, Faridabad', phone:'9876543212', rating:4.1, reviewCount:56, isOpen:true, chain:'Jan Aushadhi', location:{ lat:28.4050, lng:77.3150, coordinates:[77.3150,28.4050] } },
  { _id:'p4', name:'Wellness Forever - Old Faridabad', address:'Old Faridabad Market', phone:'9876543213', rating:4.2, reviewCount:45, isOpen:false, chain:'Wellness', location:{ lat:28.4000, lng:77.3100, coordinates:[77.3100,28.4000] } },
];

function getMockResults(query, userLat = 28.4089, userLng = 77.3178) {
  const lowerQ = query.toLowerCase();
  const medicine = mockMedicines.find(m =>
    m.name.toLowerCase().includes(lowerQ) ||
    (m.genericName && m.genericName.toLowerCase().includes(lowerQ))
  );
  if (!medicine) return null;

  const calcDist = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2-lat1)*Math.PI/180, dLon = (lon2-lon1)*Math.PI/180;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
    return parseFloat((R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a))).toFixed(1));
  };

  const basePrices = { 'Paracetamol 500mg':18, 'Amoxicillin 250mg':85, 'Metformin 500mg':45, 'Cetirizine 10mg':30, 'Azithromycin 500mg':175, 'Omeprazole 20mg':55, 'Atorvastatin 10mg':95, 'Aspirin 75mg':22, 'Pantoprazole 40mg':60, 'Levothyroxine 50mcg':110 };
  const basePrice = basePrices[medicine.name] || 50;

  const results = mockPharmacies.map((ph, i) => {
    const variation = [0, 0.15, 0.25, -0.1][i] || (Math.random()*0.3 - 0.05);
    const price = Math.round(basePrice * (1 + variation));
    return {
      _id: `mock_${ph._id}_${medicine.name}`,
      pharmacy: ph,
      medicine,
      price,
      inStock: i !== 2,
      distance: calcDist(userLat, userLng, ph.location.lat, ph.location.lng),
      lastUpdated: new Date(Date.now() - i*86400000).toISOString(),
      priceHistory: [],
    };
  });

  const minPrice = Math.min(...results.filter(r => r.inStock).map(r => r.price));
  return results.map(r => ({ ...r, isCheapest: r.price === minPrice && r.inStock }));
}

// ── ONE-TIME DB seed (only if collections are empty) ──────────
let seeded = false;
async function seedIfEmpty() {
  if (seeded) return; // Never seed twice in same process
  try {
    if (mongoose.connection.readyState !== 1) return;
    const Medicine = require('../models/Medicine');
    const Pharmacy = require('../models/Pharmacy');
    const count = await Medicine.countDocuments();
    if (count > 0) { seeded = true; return; } // Already has data
    console.log('🌱 Seeding database (first time only)...');
    await Medicine.insertMany(mockMedicines.map(({ name, genericName, category, requiresPrescription, manufacturer, dosage }) => ({ name, genericName, category, requiresPrescription, manufacturer, dosage })));
    await Pharmacy.insertMany(mockPharmacies.map(({ name, address, phone, rating, isOpen, chain, location }) => ({
      name, address, phone, rating, isOpen, chain,
      location: { type:'Point', coordinates: location.coordinates },
    })));
    seeded = true;
    console.log('✅ Database seeded successfully (one-time)');
  } catch (err) {
    console.error('Seed error:', err.message);
  }
}

module.exports = { mockMedicines, mockPharmacies, getMockResults, seedIfEmpty };
