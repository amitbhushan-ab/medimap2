// src/context/LanguageContext.jsx
import { createContext, useContext, useState } from 'react';

const translations = {
  en: {
    // Navbar
    home: 'Home',
    mapView: 'Map View',
    scanRx: '📋 Scan Rx',
    updatePrice: 'Update Price',
    submitPrice: '+ Submit Price',

    // HomePage
    heroTag: 'Real-time pharmacy prices near you',
    heroTitle: 'Find the Most Affordable',
    heroTitleHighlight: 'Medicine',
    heroTitleEnd: 'Nearby',
    heroSubtitle: 'Compare prices across pharmacies, find the cheapest option, and save on every prescription.',
    searchPlaceholder: 'Search medicines, e.g. Paracetamol...',
    uploadPrescription: 'Upload Prescription',
    popular: 'Popular:',
    statsPharmacies: 'Pharmacies',
    statsMedicines: 'Medicines',
    statsAvgSavings: 'Avg Savings',
    statsRating: 'User Rating',
    howItWorks: 'How MediMap Works',
    howSubtitle: 'Three steps to find the best medicine prices',
    step1Title: 'Search Medicine',
    step1Desc: 'Type the medicine name or scan the barcode on your packaging.',
    step2Title: 'Compare Nearby',
    step2Desc: 'See real-time prices at pharmacies closest to your location.',
    step3Title: 'Save Money',
    step3Desc: 'Pick the cheapest option or get a generic recommendation.',
    ctaTitle: 'Know a medicine price? Share it!',
    ctaSubtitle: 'Help the community by submitting price updates from your local pharmacy.',
    ctaButton: 'Submit a Price',

    // Search
    searchButton: 'Search',
    useMyLocation: 'Use My Location',
    enterCityPincode: 'Enter City / Pincode',
    noLocationSet: '📍 No location set',
    detecting: 'Detecting...',
    setLocation: 'Set Location',
    cityPlaceholder: 'e.g. Mumbai or 400001',
    cityNotFound: 'City not found. Try a major city name or 6-digit pincode.',

    // Results
    pharmaciesFound: 'pharmacies found',
    inStockOnly: 'In stock only',
    bestPrice: 'Best Price Available',
    perStrip: 'per strip',
    inStock: 'In Stock',
    outOfStock: 'Out of Stock',
    openNow: 'Open Now',
    closed: 'Closed',
    viewDetails: 'View Details',
    updatedJustNow: 'Updated just now',
    updatedHoursAgo: 'h ago',
    priceSummary: 'Price Summary',
    lowestPrice: 'Lowest Price',
    averagePrice: 'Average Price',
    highestPrice: 'Highest Price',
    potentialSavings: 'Potential Savings',
    knowBetterPrice: 'Know a better price?',
    helpCommunity: 'Help the community by updating prices at your local pharmacy.',
    submitPriceUpdate: 'Submit Price Update',
    awayKm: 'km away',

    // Generic AI
    genericAlternatives: '💊 Generic Alternatives',
    generic: 'Generic:',
    importantNote: 'Important note',
    hideNote: 'Hide note',

    // Submit Price
    submitPriceTitle: 'Submit a Price Update',
    submitPriceSubtitle: 'Help the community find affordable medicines by sharing real pharmacy prices.',
    medicineName: 'Medicine Name',
    pharmacyName: 'Pharmacy Name',
    price: 'Price (₹)',
    stockAvailability: 'Stock Availability',
    submitting: 'Submitting...',
    submitSuccess: 'Thank You! 🎉',
    submitSuccessMsg: 'Your price update has been submitted. Our team will verify it shortly.',
    submitAnother: 'Submit Another',
    backToHome: 'Back to Home',
    fillAllFields: 'Please fill in all required fields.',
    validPrice: 'Please enter a valid price.',

    // Pharmacy Detail
    backToResults: 'Back to results',
    pharmacyDetails: 'Medicine Details',
    priceHistory: 'Price History',
    priceHistorySubtitle: 'Last 7 months — community-sourced data',
    getDirections: '🗺️ Get Directions',

    // Scan
    scanTitle: 'Scan Prescription',
    scanSubtitle: 'Upload or photograph your prescription. Our AI will extract all medicines and help you find the best prices nearby.',
    tip1: 'Use good lighting',
    tip2: 'Keep image flat',
    tip3: 'Ensure text is sharp',
    privacy: '🔒 Your prescription image is processed securely and never stored permanently.',
    dropPrescription: 'Drop prescription here',
    browseFiles: 'or click to browse — JPG, PNG, WebP up to 10MB',
    uploadImage: 'Upload Image',
    useCamera: 'Use Camera',
    scanPrescription: 'Scan Prescription',
    medicinesDetected: 'medicines detected',
    scanNew: 'Scan New',
    findPharmacy: 'Find Pharmacy',
    findAll: '🗺️ Find All Medicines at Nearby Pharmacies',
    viewRawOcr: 'View raw OCR text',
    couldNotRead: 'Could not read prescription',
    tryAgain: 'Try again with a different image →',
  },

  hi: {
    // Navbar
    home: 'होम',
    mapView: 'मैप व्यू',
    scanRx: '📋 पर्ची स्कैन करें',
    updatePrice: 'कीमत अपडेट करें',
    submitPrice: '+ कीमत जमा करें',

    // HomePage
    heroTag: 'आपके पास रियल-टाइम फार्मेसी कीमतें',
    heroTitle: 'सबसे सस्ती',
    heroTitleHighlight: 'दवाई',
    heroTitleEnd: 'पास में खोजें',
    heroSubtitle: 'फार्मेसियों में कीमतें तुलना करें, सबसे सस्ता विकल्प खोजें और हर पर्ची पर बचत करें।',
    searchPlaceholder: 'दवाई खोजें, जैसे Paracetamol...',
    uploadPrescription: 'पर्ची अपलोड करें',
    popular: 'लोकप्रिय:',
    statsPharmacies: 'फार्मेसियां',
    statsMedicines: 'दवाइयां',
    statsAvgSavings: 'औसत बचत',
    statsRating: 'यूज़र रेटिंग',
    howItWorks: 'MediMap कैसे काम करता है',
    howSubtitle: 'सबसे अच्छी दवाई कीमत खोजने के तीन कदम',
    step1Title: 'दवाई खोजें',
    step1Desc: 'दवाई का नाम टाइप करें या पैकेजिंग पर बारकोड स्कैन करें।',
    step2Title: 'पास में तुलना करें',
    step2Desc: 'अपने स्थान के सबसे करीब फार्मेसियों में रियल-टाइम कीमतें देखें।',
    step3Title: 'पैसे बचाएं',
    step3Desc: 'सबसे सस्ता विकल्प चुनें या जेनेरिक दवाई की सिफारिश लें।',
    ctaTitle: 'कोई दवाई की कीमत पता है? शेयर करें!',
    ctaSubtitle: 'अपनी स्थानीय फार्मेसी से कीमत अपडेट सबमिट करके समुदाय की मदद करें।',
    ctaButton: 'कीमत जमा करें',

    // Search
    searchButton: 'खोजें',
    useMyLocation: 'मेरी लोकेशन उपयोग करें',
    enterCityPincode: 'शहर / पिनकोड दर्ज करें',
    noLocationSet: '📍 कोई लोकेशन नहीं',
    detecting: 'पता लगा रहे हैं...',
    setLocation: 'लोकेशन सेट करें',
    cityPlaceholder: 'जैसे दिल्ली या 110001',
    cityNotFound: 'शहर नहीं मिला। कोई बड़ा शहर या 6 अंकों का पिनकोड आज़माएं।',

    // Results
    pharmaciesFound: 'फार्मेसियां मिलीं',
    inStockOnly: 'केवल स्टॉक में',
    bestPrice: 'सबसे अच्छी कीमत उपलब्ध',
    perStrip: 'प्रति स्ट्रिप',
    inStock: 'स्टॉक में है',
    outOfStock: 'स्टॉक नहीं है',
    openNow: 'अभी खुला है',
    closed: 'बंद है',
    viewDetails: 'विवरण देखें',
    updatedJustNow: 'अभी अपडेट हुआ',
    updatedHoursAgo: 'घंटे पहले',
    priceSummary: 'कीमत सारांश',
    lowestPrice: 'सबसे कम कीमत',
    averagePrice: 'औसत कीमत',
    highestPrice: 'सबसे ज़्यादा कीमत',
    potentialSavings: 'संभावित बचत',
    knowBetterPrice: 'बेहतर कीमत पता है?',
    helpCommunity: 'अपनी स्थानीय फार्मेसी में कीमत अपडेट करके समुदाय की मदद करें।',
    submitPriceUpdate: 'कीमत अपडेट जमा करें',
    awayKm: 'किमी दूर',

    // Generic AI
    genericAlternatives: '💊 जेनेरिक विकल्प',
    generic: 'जेनेरिक:',
    importantNote: 'महत्वपूर्ण नोट',
    hideNote: 'नोट छुपाएं',

    // Submit Price
    submitPriceTitle: 'कीमत अपडेट जमा करें',
    submitPriceSubtitle: 'असली फार्मेसी कीमतें शेयर करके समुदाय को सस्ती दवाइयां खोजने में मदद करें।',
    medicineName: 'दवाई का नाम',
    pharmacyName: 'फार्मेसी का नाम',
    price: 'कीमत (₹)',
    stockAvailability: 'स्टॉक उपलब्धता',
    submitting: 'जमा हो रहा है...',
    submitSuccess: 'धन्यवाद! 🎉',
    submitSuccessMsg: 'आपका कीमत अपडेट जमा हो गया। हमारी टीम जल्द ही इसे सत्यापित करेगी।',
    submitAnother: 'और जमा करें',
    backToHome: 'होम पर वापस जाएं',
    fillAllFields: 'कृपया सभी आवश्यक फ़ील्ड भरें।',
    validPrice: 'कृपया एक मान्य कीमत दर्ज करें।',

    // Pharmacy Detail
    backToResults: 'परिणामों पर वापस जाएं',
    pharmacyDetails: 'दवाई विवरण',
    priceHistory: 'कीमत इतिहास',
    priceHistorySubtitle: 'पिछले 7 महीने — समुदाय-स्रोत डेटा',
    getDirections: '🗺️ रास्ता पाएं',

    // Scan
    scanTitle: 'पर्ची स्कैन करें',
    scanSubtitle: 'अपनी पर्ची अपलोड करें या फोटो लें। हमारी AI सभी दवाइयां निकालेगी और पास में सबसे अच्छी कीमत खोजने में मदद करेगी।',
    tip1: 'अच्छी रोशनी में रखें',
    tip2: 'कागज़ सीधा रखें',
    tip3: 'टेक्स्ट साफ हो',
    privacy: '🔒 आपकी पर्ची की तस्वीर सुरक्षित रूप से प्रोसेस की जाती है और कभी स्थायी रूप से संग्रहीत नहीं होती।',
    dropPrescription: 'पर्ची यहाँ छोड़ें',
    browseFiles: 'या क्लिक करके ब्राउज़ करें — JPG, PNG, 10MB तक',
    uploadImage: 'तस्वीर अपलोड करें',
    useCamera: 'कैमरा उपयोग करें',
    scanPrescription: 'पर्ची स्कैन करें',
    medicinesDetected: 'दवाइयां मिलीं',
    scanNew: 'नई स्कैन करें',
    findPharmacy: 'फार्मेसी खोजें',
    findAll: '🗺️ पास की फार्मेसियों में सभी दवाइयां खोजें',
    viewRawOcr: 'OCR टेक्स्ट देखें',
    couldNotRead: 'पर्ची नहीं पढ़ पाए',
    tryAgain: 'अलग तस्वीर के साथ फिर कोशिश करें →',
  }
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('en');
  const t = (key) => translations[lang][key] || translations['en'][key] || key;
  const toggleLang = () => setLang(l => l === 'en' ? 'hi' : 'en');

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}
