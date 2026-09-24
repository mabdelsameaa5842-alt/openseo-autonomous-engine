// VORDER SEO Service Worker: Cross-Platform Web Push Engine (Desktop, iOS, Android)
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: "VORDER SEO", body: event.data.text() };
    }
  }

  const title = data.title || "VORDER SEO - تنبيه فوري";
  const options = {
    body: data.body || "تم تسجيل نشاط جديد في منظومة السيو والأتمتة الذاتية.",
    icon: data.icon || "/vorder_seo_logo.png",
    badge: data.badge || "/favicon-32x32.png",
    vibrate: [100, 50, 100],
    data: {
      url: data.url || "/p/cc58e018-8ef9-4be7-8f3a-2af2bc158d62/skills-hub",
      timestamp: Date.now(),
    },
    actions: [
      { action: "explore", title: "عرض التفاصيل" },
      { action: "close", title: "إغلاق" },
    ],
    tag: "vorder-seo-notification",
    renotify: true,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  if (event.action === "close") return;

  const targetUrl = event.notification.data?.url || "/p/cc58e018-8ef9-4be7-8f3a-2af2bc158d62/skills-hub";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url && "focus" in client) {
          return client.focus().then(() => client.navigate(targetUrl));
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
