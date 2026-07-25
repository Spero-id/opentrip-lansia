export function mockUUID(index = 1): string {
  return `00000000-0000-0000-0000-${String(index).padStart(12, "0")}`;
}

export function makeTrip(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: mockUUID(1),
    type: "open_trip",
    title: "Test Trip",
    slug: "test-trip",
    description: "A test trip",
    durationDays: 3,
    status: "published",
    thumbnailId: null,
    sourceRequestId: null,
    isFeatured: false,
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-01"),
    ...overrides,
  };
}

export function makeTripDeparture(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: mockUUID(2),
    tripId: mockUUID(1),
    startDate: "2025-06-01",
    endDate: "2025-06-03",
    maxParticipants: 20,
    minParticipants: 1,
    status: "scheduled",
    notes: null,
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-01"),
    ...overrides,
  };
}

export function makeTripPrice(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: mockUUID(3),
    departureId: mockUUID(2),
    name: "Standard",
    price: "1500000",
    currency: "IDR",
    quota: 20,
    quotaBooked: 0,
    validFrom: null,
    validUntil: null,
    isActive: true,
    ...overrides,
  };
}

export function makeUser(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: mockUUID(10),
    email: "user@test.com",
    emailVerified: false,
    name: "Test User",
    image: null,
    phone: "08123456789",
    role: "user",
    referralCode: "REF123",
    referredBy: null,
    loyaltyPoints: 0,
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-01"),
    ...overrides,
  };
}

export function makeBooking(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: mockUUID(20),
    bookingCode: "OTL-ABC123",
    userId: mockUUID(10),
    departureId: mockUUID(2),
    status: "pending",
    totalParticipants: 2,
    subtotal: "3000000",
    discountAmount: "0",
    totalAmount: "3000000",
    currency: "IDR",
    promoId: null,
    notes: null,
    bookingDate: new Date("2025-06-01"),
    createdAt: new Date("2025-06-01"),
    updatedAt: new Date("2025-06-01"),
    ...overrides,
  };
}

export function makeBookingItem(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: mockUUID(21),
    bookingId: mockUUID(20),
    tripPriceId: mockUUID(3),
    quantity: 2,
    unitPrice: "1500000",
    subtotal: "3000000",
    ...overrides,
  };
}

export function makePayment(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: mockUUID(30),
    bookingId: mockUUID(20),
    transactionId: null,
    idempotencyKey: "booking-20-1234567890",
    method: "bank_transfer",
    amount: "3000000",
    currency: "IDR",
    status: "pending",
    gatewayResponse: null,
    expiredAt: null,
    paidAt: null,
    createdAt: new Date("2025-06-01"),
    ...overrides,
  };
}

export function makeReview(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: mockUUID(40),
    bookingId: mockUUID(20),
    userId: mockUUID(10),
    tripId: mockUUID(1),
    departureId: mockUUID(2),
    rating: 5,
    content: "Great trip!",
    isVerifiedPurchase: true,
    isFeatured: false,
    status: "approved",
    createdAt: new Date("2025-06-05"),
    ...overrides,
  };
}

export function makePromotion(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: mockUUID(50),
    code: "PROMO10",
    title: "Promo 10%",
    type: "percentage",
    value: "10",
    minPurchase: "100000",
    maxDiscount: "50000",
    usageLimit: 100,
    usageCount: 0,
    usageLimitPerUser: 1,
    validFrom: "2025-01-01",
    validUntil: "2025-12-31",
    isActive: true,
    createdAt: new Date("2025-01-01"),
    ...overrides,
  };
}

export function makeBlog(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: mockUUID(60),
    title: "Test Blog",
    slug: "test-blog",
    content: "Blog content",
    excerpt: "Blog excerpt",
    authorId: mockUUID(10),
    categoryId: null,
    coverImageId: null,
    tags: null,
    status: "published",
    publishedAt: new Date("2025-01-15"),
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-01"),
    ...overrides,
  };
}

export function makeContactMessage(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: mockUUID(70),
    name: "Test Contact",
    email: "contact@test.com",
    phone: "08123456789",
    subject: "Test Inquiry",
    message: "This is a test message",
    isRead: false,
    createdAt: new Date("2025-01-01"),
    ...overrides,
  };
}

export function makePrivateTripRequest(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: mockUUID(80),
    userId: mockUUID(10),
    title: "Custom Trip",
    durationDays: 5,
    participantsCount: 4,
    destinationPreferences: "Bali",
    specialRequirements: null,
    budgetEstimate: "5000000",
    status: "submitted",
    submittedAt: new Date("2025-01-01"),
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-01"),
    ...overrides,
  };
}

export function makeCommission(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: mockUUID(90),
    agentId: mockUUID(10),
    referralId: null,
    bookingId: mockUUID(20),
    ruleId: null,
    amount: "150000",
    status: "pending",
    approvedAt: null,
    paidAt: null,
    createdAt: new Date("2025-06-01"),
    ...overrides,
  };
}

export function makeDestination(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: mockUUID(100),
    name: "Test Destination",
    slug: "test-destination",
    description: "A test destination",
    location: "Test Location",
    geoPoint: null,
    categoryId: null,
    difficultyLevel: "easy",
    accessibilityInfo: null,
    isActive: true,
    visitEstimateMinutes: 60,
    createdAt: new Date("2025-01-01"),
    ...overrides,
  };
}
