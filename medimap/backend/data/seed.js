// Mock data for MediMap — Faridabad, Haryana
const mockPharmacies = [
  {
    name: "Apollo Pharmacy - Sector 16",
    address: "Sector 16 Market, Faridabad, Haryana 121002",
    phone: "+91-129-4567-890",
    location: { type: "Point", coordinates: [77.3178, 28.4089] },
    hours: "Mon-Sun: 7AM–10PM",
    rating: 4.5,
    isOpen: true,
    chain: "Apollo"
  },
  {
    name: "MedPlus Pharmacy - NIT Faridabad",
    address: "NIT Market, Faridabad, Haryana 121001",
    phone: "+91-129-4123-456",
    location: { type: "Point", coordinates: [77.3260, 28.3949] },
    hours: "Mon-Sat: 8AM–9PM, Sun: 9AM–6PM",
    rating: 4.3,
    isOpen: true,
    chain: "MedPlus"
  },
  {
    name: "Jan Aushadhi Store - Sector 21",
    address: "Sector 21C, Faridabad, Haryana 121001",
    phone: "+91-129-4098-765",
    location: { type: "Point", coordinates: [77.3050, 28.4200] },
    hours: "Mon-Sat: 9AM–8PM",
    rating: 4.2,
    isOpen: true,
    chain: "Jan Aushadhi"
  },
  {
    name: "Wellness Pharmacy - Old Faridabad",
    address: "Old Faridabad Market, Haryana 121002",
    phone: "+91-129-4321-987",
    location: { type: "Point", coordinates: [77.3310, 28.4150] },
    hours: "Mon-Sun: 8AM–10PM",
    rating: 4.1,
    isOpen: false,
    chain: "Independent"
  },
  {
    name: "NetMeds Store - Sector 46",
    address: "Sector 46, Faridabad, Haryana 121003",
    phone: "+91-129-4567-111",
    location: { type: "Point", coordinates: [77.3400, 28.3900] },
    hours: "Mon-Sun: 8AM–11PM",
    rating: 4.4,
    isOpen: true,
    chain: "Netmeds"
  },
  {
    name: "City Medical Store - Ballabhgarh",
    address: "Ballabhgarh Market, Faridabad, Haryana 121004",
    phone: "+91-129-4222-333",
    location: { type: "Point", coordinates: [77.3220, 28.3400] },
    hours: "Mon-Sat: 9AM–9PM",
    rating: 4.0,
    isOpen: true,
    chain: "Independent"
  }
];

const mockMedicines = [
  { name: "Paracetamol 500mg", genericName: "Acetaminophen", category: "Analgesic", description: "Pain reliever and fever reducer", manufacturer: "Cipla", dosage: "500mg", requiresPrescription: false },
  { name: "Amoxicillin 250mg", genericName: "Amoxicillin", category: "Antibiotic", description: "Broad-spectrum antibiotic", manufacturer: "Sun Pharma", dosage: "250mg", requiresPrescription: true },
  { name: "Metformin 500mg", genericName: "Metformin HCl", category: "Antidiabetic", description: "Type 2 diabetes medication", manufacturer: "USV Ltd", dosage: "500mg", requiresPrescription: true },
  { name: "Atorvastatin 10mg", genericName: "Atorvastatin", category: "Statin", description: "Cholesterol-lowering medication", manufacturer: "Pfizer", dosage: "10mg", requiresPrescription: true },
  { name: "Pantoprazole 40mg", genericName: "Pantoprazole", category: "PPI", description: "Acid reflux & ulcer treatment", manufacturer: "Zydus", dosage: "40mg", requiresPrescription: false },
  { name: "Cetirizine 10mg", genericName: "Cetirizine HCl", category: "Antihistamine", description: "Allergy relief medication", manufacturer: "Dr. Reddy's", dosage: "10mg", requiresPrescription: false },
  { name: "Aspirin 75mg", genericName: "Acetylsalicylic Acid", category: "Analgesic", description: "Blood thinner and pain reliever", manufacturer: "Bayer", dosage: "75mg", requiresPrescription: false },
  { name: "Azithromycin 500mg", genericName: "Azithromycin", category: "Antibiotic", description: "Z-Pack antibiotic", manufacturer: "Cipla", dosage: "500mg", requiresPrescription: true }
];

const priceMatrix = {
  "Paracetamol 500mg":   [18, 22, 15, 25, 20, 17],
  "Amoxicillin 250mg":   [85, 92, 78, 105, 88, 80],
  "Metformin 500mg":     [45, 52, 40, 60, 48, 43],
  "Atorvastatin 10mg":   [120, 135, 110, 145, 128, 115],
  "Pantoprazole 40mg":   [55, 62, 50, 70, 58, 52],
  "Cetirizine 10mg":     [30, 35, 28, 40, 32, 29],
  "Aspirin 75mg":        [25, 28, 22, 32, 26, 23],
  "Azithromycin 500mg":  [180, 195, 165, 210, 188, 172]
};

const stockMatrix = {
  "Paracetamol 500mg":   [true, true, true, true, true, true],
  "Amoxicillin 250mg":   [true, true, false, true, true, true],
  "Metformin 500mg":     [true, true, true, false, true, true],
  "Atorvastatin 10mg":   [true, false, true, true, true, true],
  "Pantoprazole 40mg":   [true, true, true, true, false, true],
  "Cetirizine 10mg":     [true, true, true, true, true, false],
  "Aspirin 75mg":        [true, true, true, true, true, true],
  "Azithromycin 500mg":  [true, false, true, true, true, true]
};

function getMockResults(medicineName, userLat = 28.4089, userLng = 77.3178) {
  const medicine = mockMedicines.find(m =>
    m.name.toLowerCase().includes(medicineName.toLowerCase()) ||
    (m.genericName && m.genericName.toLowerCase().includes(medicineName.toLowerCase()))
  );

  if (!medicine) return null;

  const prices = priceMatrix[medicine.name] || mockMedicines.map(() => Math.floor(Math.random() * 100) + 20);
  const stocks = stockMatrix[medicine.name] || mockMedicines.map(() => true);

  const results = mockPharmacies.map((pharmacy, i) => {
    const [lng, lat] = pharmacy.location.coordinates;
    const distance = calcDistance(userLat, userLng, lat, lng);
    return {
      _id: `pharmacy_${i}`,
      pharmacy: { ...pharmacy, _id: `pharmacy_${i}` },
      medicine: { ...medicine, _id: `medicine_${i}` },
      price: prices[i],
      inStock: stocks[i],
      distance: parseFloat(distance.toFixed(1)),
      lastUpdated: new Date(Date.now() - Math.random() * 86400000 * 3).toISOString(),
      priceHistory: generatePriceHistory(prices[i])
    };
  });

  const minPrice = Math.min(...results.filter(r => r.inStock).map(r => r.price));
  return results
    .map(r => ({ ...r, isCheapest: r.price === minPrice && r.inStock }))
    .sort((a, b) => a.distance - b.distance);
}

function calcDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = Math.sin(dLat/2)*Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1))*Math.cos(deg2rad(lat2))*Math.sin(dLon/2)*Math.sin(dLon/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}
function deg2rad(d) { return d * Math.PI / 180; }

function generatePriceHistory(currentPrice) {
  const history = [];
  for (let i = 6; i >= 0; i--) {
    const variance = (Math.random() - 0.5) * currentPrice * 0.15;
    history.push({
      price: parseFloat((currentPrice + variance).toFixed(2)),
      date: new Date(Date.now() - i * 30 * 24 * 3600000).toISOString()
    });
  }
  history.push({ price: currentPrice, date: new Date().toISOString() });
  return history;
}

async function seedDatabase() {
  try {
    const Medicine = require('../models/Medicine');
    const Pharmacy = require('../models/Pharmacy');
    const Price = require('../models/Price');

    const existingCount = await Medicine.countDocuments();
    if (existingCount > 0) {
      console.log('📦 Database already seeded');
      return;
    }

    const medicines = await Medicine.insertMany(mockMedicines);
    const pharmacies = await Pharmacy.insertMany(mockPharmacies);

    const priceEntries = [];
    medicines.forEach((medicine, mi) => {
      const prices = priceMatrix[medicine.name] || [];
      pharmacies.forEach((pharmacy, pi) => {
        const basePrice = prices[pi] || 50;
        priceEntries.push({
          medicine: medicine._id,
          pharmacy: pharmacy._id,
          price: basePrice,
          inStock: (stockMatrix[medicine.name] || [])[pi] !== false,
          priceHistory: generatePriceHistory(basePrice)
        });
      });
    });

    await Price.insertMany(priceEntries);
    console.log(`✅ Seeded ${medicines.length} medicines, ${pharmacies.length} pharmacies`);
  } catch (err) {
    console.log('Seed skipped:', err.message);
  }
}

module.exports = { mockPharmacies, mockMedicines, getMockResults, seedDatabase };
