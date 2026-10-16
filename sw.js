// Service worker della tier list: riceve le notifiche sul telefono (Web Push) e, quando se ne tocca una,
// apre la pagina giusta. Non salva pagine in memoria: la classifica arriva sempre fresca dal sito.

self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (evento) { evento.waitUntil(self.clients.claim()); });

self.addEventListener('push', function (evento) {
  var dati = {};
  try {
    dati = evento.data ? evento.data.json() : {};
  } catch (e) {
    dati = { body: evento.data ? evento.data.text() : '' };
  }
  var opzioni = {
    body: dati.body || '',
    icon: 'icona-192.png',
    badge: 'badge-96.png',
    lang: 'it',
    data: { url: dati.url || 'tierlist.html' },
  };
  if (dati.tag) {
    // stessa etichetta (es. "partite"): la notifica nuova prende il posto della vecchia
    opzioni.tag = dati.tag;
    opzioni.renotify = true;
  }
  evento.waitUntil(self.registration.showNotification(dati.title || 'Tier list ARAM', opzioni));
});

self.addEventListener('notificationclick', function (evento) {
  evento.notification.close();
  var destinazione = (evento.notification.data && evento.notification.data.url) || 'tierlist.html';
  var url = new URL(destinazione, self.registration.scope).href;
  evento.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (finestre) {
    for (var i = 0; i < finestre.length; i++) {
      if ('navigate' in finestre[i]) {
        return finestre[i].navigate(url).then(function (f) { return f ? f.focus() : self.clients.openWindow(url); });
      }
    }
    return self.clients.openWindow(url);
  }));
});
