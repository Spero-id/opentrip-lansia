export const OrderDomain = {
  generateOrderId() {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `TRV-${timestamp}-${random}`;
  },

  generateParticipantId() {
    return `pax-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
  },

  calculateTotal(item) {
    return item.pricePerPax * item.pax;
  },

  formatPrice(amount) {
    return "Rp " + Math.floor(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  },
};

export const MEETING_POINTS = [
  {
    id: "hotel_pickup",
    label: "Hotel Pickup",
    description: "Dijemput langsung di hotel Anda",
    additionalCost: 150000,
  },
  {
    id: "main_office",
    label: "Kantor Pusat",
    description: "Jl. Raya Kuta No. 88, Bali",
    additionalCost: 0,
  },
  {
    id: "airport",
    label: "Bandara Ngurah Rai",
    description: "Terminal Kedatangan Internasional",
    additionalCost: 200000,
  },
  {
    id: "seminyak",
    label: "Seminyak Square",
    description: "Area Seminyak, Bali Selatan",
    additionalCost: 75000,
  },
];

export const AVAILABLE_VOUCHERS = [
  {
    code: "NEWTRIP10",
    label: "Diskon 10% untuk Pelanggan Baru",
    discount: 0,
    minOrder: 200000,
    type: "percentage",
    percentageValue: 10,
  },
  {
    code: "SAVE50K",
    label: "Hemat Rp 50.000",
    discount: 50000,
    minOrder: 500000,
    type: "fixed",
  },
  {
    code: "WEEKEND15",
    label: "Diskon Weekend 15%",
    discount: 0,
    minOrder: 1000000,
    type: "percentage",
    percentageValue: 15,
  },
];
