import { Component } from "@angular/core";

@Component({
  selector: 'app-dialogUpdate-web',
  templateUrl: './dialogUpdateWeb.component.html'
})
export class DialogUpdateWebComponent {
  isShowAlert:boolean = false

  async updatePage(){
    // Quita SW antiguos (ngsw) y sus cachés antes de recargar, para no volver
    // a servir el index.html viejo. Se conserva el SW de Firebase (push).
    try {
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(
          regs
            .filter(r => !(r.active?.scriptURL || r.installing?.scriptURL || r.waiting?.scriptURL || '')
              .includes('firebase-messaging-sw'))
            .map(r => r.unregister())
        );
      }
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.filter(k => k.startsWith('ngsw:')).map(k => caches.delete(k)));
      }
    } catch (_) { /* ignore */ }
    window.location.reload()
  }

  showMessage(){
    this.isShowAlert = true
  }
}
