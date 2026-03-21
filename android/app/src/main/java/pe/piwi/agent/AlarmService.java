package pe.piwi.agent;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.content.SharedPreferences;
import android.media.MediaPlayer;
import android.os.Build;
import android.os.IBinder;
import android.os.VibrationEffect;
import android.os.Vibrator;
import androidx.core.app.NotificationCompat;

public class AlarmService extends Service {

    private static final String CHANNEL_ID   = "piwi_alarm_channel";
    private static final int    NOTIFICATION_ID = 1001;
    private MediaPlayer mediaPlayer;
    private Vibrator vibrator;

    @Override
    public void onCreate() {
        super.onCreate();
        createNotificationChannel();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        String title = intent != null && intent.getStringExtra("title") != null
            ? intent.getStringExtra("title") : "Nueva orden recibida";
        String body  = intent != null && intent.getStringExtra("body") != null
            ? intent.getStringExtra("body")  : "Toca para ver la orden";

        // Leer config guardada por Angular
        SharedPreferences config = getSharedPreferences(
            AlarmPlugin.PREFS_NAME, MODE_PRIVATE
        );
        boolean soundEnabled     = config.getBoolean(AlarmPlugin.KEY_SOUND,     true);
        boolean vibrationEnabled = config.getBoolean(AlarmPlugin.KEY_VIBRATION, true);

        // Notificación persistente (requerida por foreground service)
        Intent openApp = new Intent(this, MainActivity.class);
        openApp.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pendingIntent = PendingIntent.getActivity(
            this, 0, openApp,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle(title)
            .setContentText(body)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentIntent(pendingIntent)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setAutoCancel(false)
            .setOngoing(true)
            .build();

        startForeground(NOTIFICATION_ID, notification);

        // ── Sonido ────────────────────────────────────────────────
        if (soundEnabled) {
            try {
                if (mediaPlayer != null) {
                    mediaPlayer.stop();
                    mediaPlayer.release();
                }
                android.content.res.AssetFileDescriptor afd =
                    getAssets().openFd("public/assets/audio/audio.mp3");
                mediaPlayer = new MediaPlayer();
                mediaPlayer.setDataSource(
                    afd.getFileDescriptor(),
                    afd.getStartOffset(),
                    afd.getLength()
                );
                afd.close();
                mediaPlayer.setLooping(true);
                mediaPlayer.prepare();
                mediaPlayer.start();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        // ── Vibración ─────────────────────────────────────────────
        if (vibrationEnabled) {
            vibrator = (Vibrator) getSystemService(VIBRATOR_SERVICE);
            if (vibrator != null && vibrator.hasVibrator()) {
                // Patrón: espera 0ms, vibra 500ms, pausa 500ms, repite desde índice 1
                long[] pattern = {0, 500, 500};
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    vibrator.vibrate(VibrationEffect.createWaveform(pattern, 1));
                } else {
                    vibrator.vibrate(pattern, 1);
                }
            }
        }

        return START_STICKY;
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        // Parar sonido
        if (mediaPlayer != null) {
            mediaPlayer.stop();
            mediaPlayer.release();
            mediaPlayer = null;
        }
        // Parar vibración
        if (vibrator != null) {
            vibrator.cancel();
            vibrator = null;
        }
        // Quitar notificación
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager nm = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
            if (nm != null) nm.cancel(NOTIFICATION_ID);
        }
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "Alarma de nuevas órdenes",
                NotificationManager.IMPORTANCE_HIGH
            );
            channel.setDescription("Suena cuando llega una nueva orden");
            channel.enableVibration(false); // vibración la manejamos nosotros
            NotificationManager nm = getSystemService(NotificationManager.class);
            if (nm != null) nm.createNotificationChannel(channel);
        }
    }
}