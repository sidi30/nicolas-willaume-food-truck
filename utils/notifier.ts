export function notify(title: string, body?: string) {
  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'granted') {
      new Notification(title, { body });
      return;
    }
    if (Notification.permission !== 'denied') {
      Notification.requestPermission().then((perm) => {
        if (perm === 'granted') new Notification(title, { body });
        else if (body) alert(`${title}\n\n${body}`);
        else alert(title);
      });
      return;
    }
  }
  if (body) alert(`${title}\n\n${body}`);
  else alert(title);
}
