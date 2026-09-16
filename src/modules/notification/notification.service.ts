import { db } from "@/shared/db";
import { users } from "../auth/auth.schema";
import { eq } from "drizzle-orm";
import { notificationRepository } from "./notification.repository";
import { NOTIFICATION_TYPES } from "./notification.schema";

async function getAdminIds(): Promise<string[]> {
  const admins = await db.select({ id: users.id }).from(users).where(eq(users.role, "admin"));
  return admins.map((a) => a.id);
}

async function notifyAdmins(params: { title: string; message: string; type: string; link?: string | null }) {
  const adminIds = await getAdminIds();
  if (adminIds.length === 0) return [];
  return notificationRepository.createMany(
    adminIds.map((userId) => ({
      userId,
      title: params.title,
      message: params.message,
      type: params.type,
      link: params.link ?? null,
    }))
  );
}

export function getNotificationLink(type: string, link?: string | null): string {
  if (link) return link;
  switch (type) {
    case NOTIFICATION_TYPES.PAYMENT_PROOF:
      return "/admin/pesanan";
    case NOTIFICATION_TYPES.PRIVATE_TRIP_REQUEST:
      return "/admin/private-trips";
    case NOTIFICATION_TYPES.PARTICIPANT_ADDED:
      return "/admin/pesanan";
    default:
      return "/admin/notifications";
  }
}

export const notificationService = {
  // 1. Bukti pembayaran diupload -> ke halaman pesanan (verifikasi)
  async onPaymentProofUploaded(opts: { bookingCode: string; bookingId: string; userName: string }) {
    return notifyAdmins({
      type: NOTIFICATION_TYPES.PAYMENT_PROOF,
      title: "Bukti Pembayaran Baru",
      message: `${opts.userName} mengirim bukti pembayaran untuk ${opts.bookingCode}.`,
      link: `/admin/pesanan?highlight=${opts.bookingCode}`,
    });
  },

  // 2. Request Private Trip baru -> ke detail request
  async onPrivateTripRequested(opts: { requestId: string; userName: string }) {
    return notifyAdmins({
      type: NOTIFICATION_TYPES.PRIVATE_TRIP_REQUEST,
      title: "Request Private Trip Baru",
      message: `${opts.userName} mengajukan private trip #${opts.requestId.slice(0, 8)}.`,
      link: `/admin/private-trips/${opts.requestId}`,
    });
  },

  // 3. Penambahan peserta baru -> ke halaman pesanan
  async onParticipantAdded(opts: { bookingCode: string; bookingId?: string; participantName: string; tripTitle?: string }) {
    return notifyAdmins({
      type: NOTIFICATION_TYPES.PARTICIPANT_ADDED,
      title: "Peserta Baru Ditambahkan",
      message: `${opts.participantName} ditambahkan ke ${opts.bookingCode}${opts.tripTitle ? ` (${opts.tripTitle})` : ""}.`,
      link: `/admin/pesanan?highlight=${opts.bookingCode}`,
    });
  },
};
