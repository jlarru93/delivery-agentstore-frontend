package pe.piwi.agent;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Intent;
import android.os.Build;
import android.util.Log;
import androidx.core.app.NotificationCompat;
import androidx.core.content.ContextCompat;
import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

public class PiwiFirebaseMessagingService extends FirebaseMessagingService {

    private static final String TAG = "PiwiFCM";
    private static final String CHANNEL_ID = "piwi_fcm_channel";
    private static final int PUSH_TTL_SECONDS = 300; // 5 minutos fallback

    @Override
    public void onMessageReceived(RemoteMessage remoteMessage) {
        super.onMessageReceived(remoteMessage);
        Log.d(TAG, "FCM recibido: " + remoteMessage.getData());

        String type         = remoteMessage.getData().get("type");
        String title        = remoteMessage.getData().get("title");
        String body         = remoteMessage.getData().get("body");
        String orderUuid    = remoteMessage.getData().get("orderUuid");
        String expiresAtStr = remoteMessage.getData().get("pushExpiresAt");
        String createdAtStr = remoteMessage.getData().get("pushCreatedAt");

        // ── CANCEL_ORDER: detener alarma si está sonando ────────────
        if ("CANCEL_ORDER".equals(type)) {
            Log.d(TAG, "CANCEL_ORDER recibido — deteniendo AlarmService");
            stopService(new Intent(this, AlarmService.class));
            return;
        }

        boolean isNewOrder = "NEW_ORDER".equals(type) || type == null;
        if (!isNewOrder) return;

        // ── Verificar si el push sigue vigente ──────────────────────
        long nowSeconds = System.currentTimeMillis() / 1000;

        if (expiresAtStr != null && !expiresAtStr.isEmpty()) {
            try {
                long expiresAt = Long.parseLong(expiresAtStr);
                if (nowSeconds > expiresAt) {
                    Log.d(TAG, "Push expirado — ignorando alarma. expiresAt=" + expiresAt + " now=" + nowSeconds);
                    return; // Push caducado: no sonar, no notificar
                }
            } catch (NumberFormatException e) {
                Log.w(TAG, "pushExpiresAt inválido: " + expiresAtStr);
            }
        } else if (createdAtStr != null && !createdAtStr.isEmpty()) {
            // Fallback: si no hay expiresAt, calcular desde createdAt
            try {
                long createdAt = Long.parseLong(createdAtStr);
                if (nowSeconds > createdAt + PUSH_TTL_SECONDS) {
                    Log.d(TAG, "Push expirado (fallback TTL) — ignorando alarma.");
                    return;
                }
            } catch (NumberFormatException e) {
                Log.w(TAG, "pushCreatedAt inválido: " + createdAtStr);
            }
        }
        // ────────────────────────────────────────────────────────────

        Log.d(TAG, "Push vigente — lanzando AlarmService. orderUuid=" + orderUuid);

        // 1. Lanzar AlarmService (sonido + vibración en bucle)
        Intent alarmIntent = new Intent(this, AlarmService.class);
        alarmIntent.putExtra("title", title != null ? title : "Nueva orden recibida");
        alarmIntent.putExtra("body",  body  != null ? body  : "Toca para ver la orden");
        ContextCompat.startForegroundService(this, alarmIntent);

        // 2. Notificación tappable → abre app con el uuid
        showOrderNotification(title, body, orderUuid);
    }

    private void showOrderNotification(String title, String body, String orderUuid) {
        createNotificationChannel();

        Intent openIntent = new Intent(this, MainActivity.class);
        openIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        if (orderUuid != null) {
            openIntent.putExtra("orderUuid", orderUuid);
        }

        PendingIntent pendingIntent = PendingIntent.getActivity(
                this, 0, openIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle(title != null ? title : "Nueva orden recibida")
                .setContentText(body  != null ? body  : "Toca para ver la orden")
                .setSmallIcon(android.R.drawable.ic_dialog_info)
                .setContentIntent(pendingIntent)
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setAutoCancel(true);

        NotificationManager nm = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
        if (nm != null) nm.notify(1002, builder.build());
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID, "Órdenes nuevas", NotificationManager.IMPORTANCE_HIGH
            );
            NotificationManager nm = getSystemService(NotificationManager.class);
            if (nm != null) nm.createNotificationChannel(channel);
        }
    }

    @Override
    public void onNewToken(String token) {
        super.onNewToken(token);
        Log.d(TAG, "Nuevo FCM token: " + token);
    }
}