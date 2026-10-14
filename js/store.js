// Firebase Credentials
export const firebaseConfig = {
  apiKey: "AIzaSyBE04f1-vwEbhkCxX-o_xU62aXTTok-AB4",
  authDomain: "sri-sai-home-foods-30fdb.firebaseapp.com",
  projectId: "sri-sai-home-foods-30fdb",
  storageBucket: "sri-sai-home-foods-30fdb.firebasestorage.app",
  messagingSenderId: "626791846753",
  appId: "1:626791846753:web:524fa5121115ef122f2b20"
};

export let dbCloud = null;
try {
  if (typeof firebase !== 'undefined') {
    firebase.initializeApp(firebaseConfig);
    dbCloud = firebase.firestore();
  }
} catch(e) {
  console.log("Firebase fallback mode.");
}

export const STORAGE_KEY = 'srisai_modular_v2';

export const initialData = {
  settings: {
    businessName: "Sri Sai Home Foods",
    ownerPhone: "9842100000",
    upiId: "srisaihomefoods@upi",
    hideConfidential: false,
    language: "en"
  },
  customers: [
    { id: 'c1', name: 'Hotel Annapoorna', type: 'hotel', ownerPhone: '9842100001', unitRate: 7, defaultMorningQty: 100, defaultEveningQty: 80, address: 'Main Road, Town Center', isActive: true },
    { id: 'c2', name: 'Hotel Saravana Bhavan', type: 'hotel', ownerPhone: '9842100002', unitRate: 6, defaultMorningQty: 150, defaultEveningQty: 120, address: 'Bus Stand Complex', isActive: true },
    { id: 'c3', name: 'Sangeetha Restaurant', type: 'restaurant', ownerPhone: '9842100003', unitRate: 6, defaultMorningQty: 80, defaultEveningQty: 60, address: 'Bypass Junction', isActive: true },
    { id: 'c4', name: 'Sri Ram Caterers', type: 'catering', ownerPhone: '9842100004', unitRate: 7, defaultMorningQty: 200, defaultEveningQty: 0, address: 'Gandhi Nagar', isActive: true }
  ],
  orders: [
    { id: 'o1', customerId: 'c1', date: '2026-10-12', shift: 'morning', pieces: 100, unitRateApplied: 7, amount: 700, deliveryStatus: 'delivered', rapidoCharge: 40 },
    { id: 'o2', customerId: 'c2', date: '2026-10-12', shift: 'morning', pieces: 150, unitRateApplied: 6, amount: 900, deliveryStatus: 'delivered', rapidoCharge: 50 },
    { id: 'o3', customerId: 'c1', date: '2026-10-13', shift: 'morning', pieces: 100, unitRateApplied: 7, amount: 700, deliveryStatus: 'delivered', rapidoCharge: 40 },
    { id: 'o4', customerId: 'c2', date: '2026-10-13', shift: 'morning', pieces: 150, unitRateApplied: 6, amount: 900, deliveryStatus: 'delivered', rapidoCharge: 50 },
    { id: 'o5', customerId: 'c3', date: '2026-10-13', shift: 'morning', pieces: 80, unitRateApplied: 6, amount: 480, deliveryStatus: 'delivered', rapidoCharge: 30 },
    { id: 'o6', customerId: 'c1', date: '2026-10-14', shift: 'morning', pieces: 100, unitRateApplied: 7, amount: 700, deliveryStatus: 'delivered', rapidoCharge: 40 },
    { id: 'o7', customerId: 'c2', date: '2026-10-14', shift: 'morning', pieces: 150, unitRateApplied: 6, amount: 900, deliveryStatus: 'delivered', rapidoCharge: 50 },
    { id: 'o8', customerId: 'c4', date: '2026-10-14', shift: 'morning', pieces: 120, unitRateApplied: 7, amount: 840, deliveryStatus: 'delivered', rapidoCharge: 0 }
  ],
  payments: [
    { id: 'p1', customerId: 'c1', date: '2026-10-12', amount: 700, mode: 'UPI' },
    { id: 'p2', customerId: 'c2', date: '2026-10-10', amount: 1000, mode: 'Cash' }
  ],
  expenses: [
    { id: 'e1', category: 'Rice Flour', amount: 1200, date: '2026-10-10', customerId: '', note: '50kg Bag' },
    { id: 'e2', category: 'Rapido / Porter', amount: 210, date: '2026-10-12', customerId: 'c2', note: 'Delivery charges for Saravana Bhavan' },
    { id: 'e3', category: 'Shop Rent', amount: 5000, date: '2026-10-01', customerId: '', note: 'Monthly shop rent' }
  ]
};

export function loadDB() {
  try {
    var str = localStorage.getItem(STORAGE_KEY);
    return str ? JSON.parse(str) : initialData;
  } catch(e) {
    return initialData;
  }
}

export function saveDB(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  if (dbCloud) {
    dbCloud.collection('app_data').doc('main_store').set(data).catch(function(err){});
  }
}

export var appState = {
  db: loadDB(),
  tab: 'dashboard',
  orderDate: '2026-10-14',
  orderShift: 'morning',
  dashShop: 'all',
  dashDateMode: 'all',
  dashStartDate: '2026-10-01',
  dashEndDate: '2026-10-14',
  billShop: 'c1',
  showModal: false,
  editingShopId: null,
  showExpenseModal: false,
  expenseFilterCategory: 'all'
};

export function formatMoney(num) {
  if (appState.db.settings.hideConfidential) return '••••••';
  return '₹' + Number(num || 0).toLocaleString('en-IN');
}