import { prisma } from "./prisma";

export async function dispatchWebhook(event: string, payload: any) {
  try {
    const webhooks = await prisma.webhook.findMany({
      where: {
        active: true,
        events: { has: event }
      }
    });

    const results = await Promise.allSettled(
      webhooks.map(hook => 
        fetch(hook.url, {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-OpenTrack-Event": event },
          body: JSON.stringify({
            event,
            timestamp: new Date().toISOString(),
            data: payload
          })
        })
      )
    );

    console.log(`📡 Dispatched ${event} to ${webhooks.length} endpoints`);
    return results;
  } catch (err) {
    console.error("Webhook Dispatch Error:", err);
  }
}
