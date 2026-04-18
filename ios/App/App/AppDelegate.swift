import UIKit
import Capacitor
import FirebaseCore
import FirebaseMessaging
import UserNotifications

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate, UNUserNotificationCenterDelegate, MessagingDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {

        // ── Firebase ──────────────────────────────────────────────
        FirebaseApp.configure()

        // ── Push Notifications ────────────────────────────────────
        UNUserNotificationCenter.current().delegate = self
        Messaging.messaging().delegate = self

        // Registrar para notificaciones remotas
        application.registerForRemoteNotifications()

        return true
    }

    // ── APNS token → FCM ──────────────────────────────────────────
    func application(_ application: UIApplication,
                     didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        Messaging.messaging().apnsToken = deviceToken
    }

    func application(_ application: UIApplication,
                     didFailToRegisterForRemoteNotificationsWithError error: Error) {
        print("[FCM] Failed to register for remote notifications: \(error)")
    }

    // ── FCM Token actualizado ─────────────────────────────────────
    func messaging(_ messaging: Messaging, didReceiveRegistrationToken fcmToken: String?) {
        print("[FCM] Token: \(fcmToken ?? "nil")")
        // Capacitor Firebase Messaging lo captura automáticamente
        NotificationCenter.default.post(
            name: Notification.Name("FCMToken"),
            object: nil,
            userInfo: ["token": fcmToken ?? ""]
        )
    }

    // ── Push recibido en foreground ───────────────────────────────
    func userNotificationCenter(_ center: UNUserNotificationCenter,
                                willPresent notification: UNNotification,
                                withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
        // Verificar tiempo de vida del push
        let userInfo = notification.request.content.userInfo
        if isPushExpired(userInfo: userInfo) {
            print("[FCM] Push expirado — ignorando")
            completionHandler([])
            return
        }
        // Mostrar banner + sonido en foreground
        if let bridgeVC = self.window?.rootViewController as? CAPBridgeViewController,
           let bridge = bridgeVC.bridge {
            bridge.notificationRouter.userNotificationCenter(center, willPresent: notification, withCompletionHandler: completionHandler)
        } else {
            // Fallback por si Capacitor aún no carga
            if #available(iOS 14.0, *) {
                completionHandler([.banner, .sound, .badge])
            } else {
                completionHandler([.alert, .sound, .badge])
            }
        }
    }

    // ── Push tocado por el usuario ────────────────────────────────
    func userNotificationCenter(_ center: UNUserNotificationCenter,
                                didReceive response: UNNotificationResponse,
                                withCompletionHandler completionHandler: @escaping () -> Void) {
        // Capacitor maneja el routing
        if let bridgeVC = self.window?.rootViewController as? CAPBridgeViewController,
           let bridge = bridgeVC.bridge {
            bridge.notificationRouter.userNotificationCenter(center, didReceive: response, withCompletionHandler: completionHandler)
        } else {
            completionHandler()
        }
    }

    // ── Verificar si el push sigue vigente (5 min TTL) ───────────
    private func isPushExpired(userInfo: [AnyHashable: Any]) -> Bool {
        let nowSeconds = Int(Date().timeIntervalSince1970)

        if let expiresAtStr = userInfo["pushExpiresAt"] as? String,
           let expiresAt = Int(expiresAtStr) {
            return nowSeconds > expiresAt
        }

        if let createdAtStr = userInfo["pushCreatedAt"] as? String,
           let createdAt = Int(createdAtStr) {
            return nowSeconds > createdAt + 300
        }

        return false
    }

    // ── Deep links ────────────────────────────────────────────────
    func application(_ app: UIApplication, open url: URL,
                     options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication,
                     continue userActivity: NSUserActivity,
                     restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        return ApplicationDelegateProxy.shared.application(
            application, continue: userActivity, restorationHandler: restorationHandler
        )
    }

    func applicationWillResignActive(_ application: UIApplication) {}
    func applicationDidEnterBackground(_ application: UIApplication) {}
    func applicationWillEnterForeground(_ application: UIApplication) {}
    func applicationDidBecomeActive(_ application: UIApplication) {}
    func applicationWillTerminate(_ application: UIApplication) {}
}
