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

export async function checkSubscriptionExpirations() {
  try {
    const now = new Date();
    const in3Days = new Date(now);
    in3Days.setDate(in3Days.getDate() + 3);

    const clients = await prisma.client.findMany({
      where: { isActive: true },
      select: {
        id: true,
        fullName: true,
        activity: true,
        subscriptionStartDate: true,
        subscriptionDurationDays: true,
      },
    });

    const expiredClients: typeof clients = [];
    const expiringSoonClients: typeof clients = [];

    for (const client of clients) {
      const endDate = new Date(client.subscriptionStartDate);
      endDate.setDate(endDate.getDate() + client.subscriptionDurationDays);
      if (endDate <= now) {
        expiredClients.push(client);
      } else if (endDate <= in3Days) {
        expiringSoonClients.push(client);
      }
    }

    const existingExpirations = await prisma.notification.findMany({
      where: { entity: "Client", type: "EXPIRATION" },
      select: { entityId: true },
    });
    const expiredNotified = new Set(
      existingExpirations.filter((n) => n.entityId !== null).map((n) => n.entityId)
    );

    for (const client of expiredClients) {
      if (expiredNotified.has(client.id)) continue;
      const endDate = new Date(client.subscriptionStartDate);
      endDate.setDate(endDate.getDate() + client.subscriptionDurationDays);
      await createNotification({
        type: "EXPIRATION",
        title: "Abonnement expiré",
        message: `Membre: ${client.fullName}\nActivité: ${client.activity}\nDate d'expiration: ${endDate.toLocaleDateString("fr-FR")}`,
        entity: "Client",
        entityId: client.id,
      });
    }

    const existingWarnings = await prisma.notification.findMany({
      where: { entity: "Client", type: "WARNING" },
      select: { entityId: true },
    });
    const warnedNotified = new Set(
      existingWarnings.filter((n) => n.entityId !== null).map((n) => n.entityId)
    );

    for (const client of expiringSoonClients) {
      if (warnedNotified.has(client.id)) continue;
      const endDate = new Date(client.subscriptionStartDate);
      endDate.setDate(endDate.getDate() + client.subscriptionDurationDays);
      const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      await createNotification({
        type: "WARNING",
        title: "Abonnement bientôt expiré",
        message: `Membre: ${client.fullName}\nActivité: ${client.activity}\nExpire dans ${daysLeft} jour(s) (${endDate.toLocaleDateString("fr-FR")})`,
        entity: "Client",
        entityId: client.id,
      });
    }
  } catch (e) {
    console.error("Subscription expiration check failed:", e);
  }
}
