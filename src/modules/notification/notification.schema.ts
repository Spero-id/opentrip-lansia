export { notifications } from "@/db/schema/notifications";
export type { Notification, NewNotification } from "@/db/schema/notifications";

export const NOTIFICATION_TYPES = {
  PAYMENT_PROOF: "payment_proof",
  PRIVATE_TRIP_REQUEST: "private_trip_request",
  PARTICIPANT_ADDED: "participant_added",
} as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];
