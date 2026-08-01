// Zain Automation PWA & Native Platform Manager Service

export interface VersionInfo {
  version: string;
  buildTimestamp: number;
  buildDate: string;
  releaseNotes: string;
  minSupportedVersion: string;
}

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

class PwaService {
  private deferredPrompt: BeforeInstallPromptEvent | null = null;
  private isOnlineStatus: boolean = navigator.onLine;
  private currentVersion: string = '2.4.0-prod';
  private updateAvailable: boolean = false;
  private swRegistration: ServiceWorkerRegistration | null = null;

  private onlineListeners: Set<(isOnline: boolean) => void> = new Set();
  private updateListeners: Set<(versionInfo: VersionInfo) => void> = new Set();
  private installableListeners: Set<(canInstall: boolean) => void> = new Set();

  constructor() {
    this.initNetworkListeners();
  }

  // Initialize Network listeners
  private initNetworkListeners() {
    window.addEventListener('online', () => {
      this.isOnlineStatus = true;
      this.notifyOnlineListeners(true);
    });

    window.addEventListener('offline', () => {
      this.isOnlineStatus = false;
      this.notifyOnlineListeners(false);
    });

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e as BeforeInstallPromptEvent;
      this.notifyInstallableListeners(true);
    });

    window.addEventListener('appinstalled', () => {
      this.deferredPrompt = null;
      this.notifyInstallableListeners(false);
      console.log('[PWA] Zain Automation app installed successfully');
    });
  }

  // Register Service Worker
  public async registerServiceWorker(): Promise<void> {
    if (!('serviceWorker' in navigator)) {
      console.log('[PWA] Service Workers not supported');
      return;
    }

    try {
      const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      this.swRegistration = reg;
      console.log('[PWA] ServiceWorker registered with scope:', reg.scope);

      // Listen for updates
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('[PWA] New version available!');
              this.updateAvailable = true;
              this.checkVersionUpdate();
            }
          });
        }
      });

      // Periodically check version every 15 minutes
      setInterval(() => {
        this.checkVersionUpdate();
      }, 15 * 60 * 1000);

      // Check version on initial load
      this.checkVersionUpdate();
    } catch (err) {
      console.warn('[PWA] ServiceWorker registration failed:', err);
    }
  }

  // Check version.json for updates
  public async checkVersionUpdate(): Promise<VersionInfo | null> {
    try {
      const res = await fetch(`/version.json?t=${Date.now()}`);
      if (!res.ok) return null;
      const data: VersionInfo = await res.json();

      if (data.version && data.version !== this.currentVersion) {
        this.updateAvailable = true;
        this.notifyUpdateListeners(data);
        return data;
      }
    } catch (err) {
      console.warn('[PWA] Version check fetch error:', err);
    }
    return null;
  }

  // Prompt PWA installation
  public async promptInstall(): Promise<boolean> {
    if (!this.deferredPrompt) {
      console.log('[PWA] No deferred install prompt available');
      return false;
    }

    try {
      await this.deferredPrompt.prompt();
      const choice = await this.deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        this.deferredPrompt = null;
        this.notifyInstallableListeners(false);
        return true;
      }
    } catch (err) {
      console.warn('[PWA] Install prompt failed:', err);
    }
    return false;
  }

  // Reload to update application
  public reloadToUpdate() {
    if (this.swRegistration && this.swRegistration.waiting) {
      this.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
    window.location.reload();
  }

  // Push Notifications handling
  public async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted' && this.swRegistration) {
      this.swRegistration.showNotification('Zain Automation - التنبيهات مفعّلة', {
        body: 'تم تفعيل إشعارات مسارات العمل بنجاح على هذا الجهاز.',
        icon: '/icons/icon.svg',
        dir: 'rtl',
        lang: 'ar'
      });
    }
    return permission;
  }

  // Getters & Event Subscription
  public isOnline(): boolean {
    return this.isOnlineStatus;
  }

  public canInstall(): boolean {
    return Boolean(this.deferredPrompt);
  }

  public getCurrentVersion(): string {
    return this.currentVersion;
  }

  public onOnlineChange(callback: (isOnline: boolean) => void) {
    this.onlineListeners.add(callback);
    callback(this.isOnlineStatus);
    return () => { this.onlineListeners.delete(callback); };
  }

  public onUpdateAvailable(callback: (info: VersionInfo) => void) {
    this.updateListeners.add(callback);
    return () => { this.updateListeners.delete(callback); };
  }

  public onInstallableChange(callback: (canInstall: boolean) => void) {
    this.installableListeners.add(callback);
    callback(this.canInstall());
    return () => { this.installableListeners.delete(callback); };
  }

  private notifyOnlineListeners(isOnline: boolean) {
    this.onlineListeners.forEach((fn) => fn(isOnline));
  }

  private notifyUpdateListeners(info: VersionInfo) {
    this.updateListeners.forEach((fn) => fn(info));
  }

  private notifyInstallableListeners(canInstall: boolean) {
    this.installableListeners.forEach((fn) => fn(canInstall));
  }
}

export const pwaService = new PwaService();
