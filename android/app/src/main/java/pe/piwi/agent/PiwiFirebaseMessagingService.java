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

    @Override
    public void onMessageReceived(RemoteMessage remoteMessage) {
        super.onMessageReceived(remoteMessage);
        Log.d(TAG, "FCM recibido: " + remoteMessage.getData());

        String type      = remoteMessage.getData().get("type");
        String title     = remoteMessage.getData().get("title");
        String body      = remoteMessage.getData().get("body");
        String orderUuid = remoteMessage.getData().get("orderUuid");

        boolean isNewOrder = "NEW_ORDER".equals(type) || type == null;
        if (!isNewOrder) return;

        Log.d(TAG, "Nueva orden uuid=" + orderUuid);

        // 1. Lanzar AlarmService (sonido en bucle)
        Intent alarmIntent = new Intent(this, AlarmService.class);
        alarmIntent.putExtra("title", title != null ? title : "Nueva orden recibida");
        alarmIntent.putExtra("body",  body  != null ? body  : "Toca para ver la orden");
        ContextCompat.startForegroundService(this, alarmIntent);

        // 2. Notificación tappable → abre app con el uuid
        showOrderNotification(title, body, orderUuid);
    }

    private void showOrderNotification(String title, String body, String orderUuid) {
        createNotificationChannel();

        // Al tocar → MainActivity recibe el orderUuid via intent extra
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