package pe.piwi.agent;

import android.content.Intent;
import android.util.Log;
import androidx.core.content.ContextCompat;
import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

public class PiwiFirebaseMessagingService extends FirebaseMessagingService {

    private static final String TAG = "PiwiFCM";

    @Override
    public void onMessageReceived(RemoteMessage remoteMessage) {
        super.onMessageReceived(remoteMessage);
        Log.d(TAG, "FCM recibido data: " + remoteMessage.getData());

        String type = remoteMessage.getData().get("type");
        boolean isNewOrder = "NEW_ORDER".equals(type) || type == null;

        if (isNewOrder) {
            Log.d(TAG, "Nueva orden — lanzando AlarmService");
            String title = remoteMessage.getData().get("title");
            String body  = remoteMessage.getData().get("body");

            Intent alarmIntent = new Intent(this, AlarmService.class);
            alarmIntent.putExtra("title", title != null ? title : "Nueva orden recibida");
            alarmIntent.putExtra("body",  body  != null ? body  : "Toca para ver la orden");
            ContextCompat.startForegroundService(this, alarmIntent);
        }
    }

    @Override
    public void onNewToken(String token) {
        super.onNewToken(token);
        Log.d(TAG, "Nuevo FCM token: " + token);
    }
}