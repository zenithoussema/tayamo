import { prisma } from "./db";

export async function createNotification(params: {
  type?: "INFO" | "WARNING" | "SUCCESS" | "EXPIRATION" | "PAYMENT";
  title: string;
  message: string;
  entity?: string;
  entityId?: number;
}) {
  try {
    return await prisma.notification.create({ data: params });
  } catch (e) {
    console.error("Notification creation failed:", e);
    return null;
  }
}

export async function getUnreadCount() {
  try {
    return await prisma.notification.count({ where: { read: false } });
  } catch {
    return 0;
  }
}
