export const DestinationDomain = {
  calculateTotalPrice(destination, pax) {
    if (pax <= 0) return 0;
    return pax * destination.priceMin;
  },

  isPopular(destination) {
    return destination.rating >= 4.7 && destination.reviewCount >= 2000;
  },

  getShortLocation(destination) {
    return destination.location.split(",")[0].trim();
  }
};
export const FALLBACK_IMAGES = [
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQw8p4vVW46w8v2EDTYS5ZN08gcBlEyL2Hq2n-oDk588w&s=10",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ4HXrHCu5wU0hTKdf2vfJj5ZiXuH3LEUeh5s2vEDS6mYWKlFLeAP91yNQ&s=10",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80",
  "https://images.unsplash.com/photo-1522770179533-24471fcdba45?w=600&q=80",
];


export const DEFAULT_RATING = 5.0;

export function toDetail(dest) {
  return {
    id: dest.id,
    title: dest.name,
    image: FALLBACK_IMAGES[0],
    images: FALLBACK_IMAGES,
    location: dest.location || "Indonesia",
    category: dest.difficultyLevel || "Destinasi",
    rating: DEFAULT_RATING,
    reviewCount: 0,
    priceMin: 0,
    priceMax: 0,
    description: dest.description || "Belum ada deskripsi.",
    highlights: [dest.difficultyLevel, dest.accessibilityInfo].filter(Boolean),
    itinerary: [],
    meetingPoints: [],
    reviewsList: [],
  };
}
