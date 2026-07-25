import { bookingService } from "@/modules/booking/booking.service";
import { db } from "@/shared/db";
import { users } from "@/modules/auth/auth.schema";
import { eq } from "drizzle-orm";
import { ProfileClientView, UserProfile, UserBooking } from "./profile-client";

const DEFAULT_USER_ID = "00000000-0000-0000-0000-000000000000";

interface RawBooking {
  id: string;
  bookingCode: string;
  status: string;
  totalAmount: string;
  bookingDate?: Date | string;
  totalParticipants?: number;
}

export default async function ProfilePage(props: { searchParams?: Promise<{ tab?: string }> } = {}) {
  let user: UserProfile | null = null;
  let userBookings: UserBooking[] = [];

  try {
    const [foundUser] = await db.select().from(users).where(eq(users.id, DEFAULT_USER_ID)).limit(1);
    if (foundUser) {
      user = {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        phone: foundUser.phone,
        image: foundUser.image,
        loyaltyPoints: foundUser.loyaltyPoints,
        createdAt: foundUser.createdAt,
      };
    }

    const bookingsData = await bookingService.getUserBookings(DEFAULT_USER_ID);
    if (Array.isArray(bookingsData)) {
      userBookings = (bookingsData as RawBooking[]).map((b) => ({
        id: b.id,
        bookingCode: b.bookingCode,
        status: b.status,
        totalAmount: b.totalAmount,
        bookingDate: b.bookingDate,
        totalParticipants: b.totalParticipants,
      }));
    }
  } catch {
    user = null;
    userBookings = [];
  }

  // Resolve searchParams
  const searchParams = await props.searchParams;
  const initialTab = searchParams?.tab || undefined;

  return <ProfileClientView user={user} userBookings={userBookings} initialTab={initialTab} />;
}
