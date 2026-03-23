package pe.piwi.agent;

import android.annotation.SuppressLint;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.PixelFormat;
import android.graphics.Typeface;
import android.media.AudioAttributes;
import android.media.AudioManager;
import android.media.MediaPlayer;
import android.os.Build;
import android.os.IBinder;
import android.os.PowerManager;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.provider.Settings;
import android.view.Gravity;
import android.view.WindowManager;
import android.widget.LinearLayout;
import android.widget.TextView;

import androidx.core.app.NotificationCompat;

public class AlarmService extends Service {

    private static final String CHANNEL_ID     = "piwi_alarm_channel";
    private static final int    NOTIFICATION_ID = 1001;

    private MediaPlayer           mediaPlayer;
    private Vibrator              vibrator;
    private PowerManager.WakeLock wakeLock;
    private WindowManager         windowManager;
    private LinearLayout          overlayView;

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

        SharedPreferences config = getSharedPreferences(AlarmPlugin.PREFS_NAME, MODE_PRIVATE);
        boolean soundEnabled     = config.getBoolean(AlarmPlugin.KEY_SOUND,     true);
        boolean vibrationEnabled = config.getBoolean(AlarmPlugin.KEY_VIBRATION, true);

        // ── 1. Foreground notification (obligatoria para el service) ──────
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
                .setPriority(NotificationCompat.PRIORITY_MAX)
                .setCategory(NotificationCompat.CATEGORY_ALARM)
                .setAutoCancel(false)
                .setOngoing(true)
                .build();

        startForeground(NOTIFICATION_ID, notification);

        // ── 2. WakeLock: enciende pantalla aunque esté bloqueada ──────────
        acquireWakeLock();

        // ── 3. Overlay: banner verde flotante encima de DND/lockscreen ────
        //    Solo si el usuario concedió el permiso de superposición
        if (Settings.canDrawOverlays(this)) {
            showOverlay(title, body);
        }

        // ── 4. Sonido STREAM_ALARM (suena en silencio y vibrar) ───────────
        if (soundEnabled) {
            playAlarmSound();
        }

        // ── 5. Vibración ──────────────────────────────────────────────────
        if (vibrationEnabled) {
            startVibration();
        }

        return START_STICKY;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // WakeLock — enciende la pantalla al recibir la alarma
    // ─────────────────────────────────────────────────────────────────────────

    @SuppressLint("WakelockTimeout")
    private void acquireWakeLock() {
        try {
            PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
            if (pm != null) {
                wakeLock = pm.newWakeLock(
                        PowerManager.FULL_WAKE_LOCK        |
                                PowerManager.ACQUIRE_CAUSES_WAKEUP |
                                PowerManager.ON_AFTER_RELEASE,
                        "PiwiAgent::AlarmWakeLock"
                );
                wakeLock.acquire(3 * 60 * 1000L); // máximo 3 minutos
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Overlay — ventana flotante visible sobre DND y pantalla bloqueada
    // ─────────────────────────────────────────────────────────────────────────

    private void showOverlay(String title, String body) {
        try {
            if (overlayView != null) return;

            windowManager = (WindowManager) getSystemService(WINDOW_SERVICE);

            // Banner verde PIWI con título y cuerpo
            overlayView = new LinearLayout(this);
            overlayView.setOrientation(LinearLayout.VERTICAL);
            overlayView.setBackgroundColor(0xFF398E3C); // verde PIWI
            overlayView.setPadding(48, 36, 48, 36);

            TextView tvTitle = new TextView(this);
            tvTitle.setText(title);
            tvTitle.setTextColor(0xFFFFFFFF);
            tvTitle.setTextSize(17f);
            tvTitle.setTypeface(null, Typeface.BOLD);

            TextView tvBody = new TextView(this);
            tvBody.setText(body);
            tvBody.setTextColor(0xFFCCEECC);
            tvBody.setTextSize(14f);

            TextView tvHint = new TextView(this);
            tvHint.setText("Toca para abrir ›");
            tvHint.setTextColor(0xFFFFFFFF);
            tvHint.setTextSize(12f);
            tvHint.setPadding(0, 12, 0, 0);

            overlayView.addView(tvTitle);
            overlayView.addView(tvBody);
            overlayView.addView(tvHint);

            int overlayType = Build.VERSION.SDK_INT >= Build.VERSION_CODES.O
                    ? WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
                    : WindowManager.LayoutParams.TYPE_SYSTEM_ALERT;

            WindowManager.LayoutParams params = new WindowManager.LayoutParams(
                    WindowManager.LayoutParams.MATCH_PARENT,
                    WindowManager.LayoutParams.WRAP_CONTENT,
                    overlayType,
                    WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE
                            | WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON
                            | WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED
                            | WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON,
                    PixelFormat.TRANSLUCENT
            );
            params.gravity = Gravity.TOP | Gravity.CENTER_HORIZONTAL;

            // Tocar el banner → abrir app y detener alarma
            overlayView.setOnClickListener(v -> {
                Intent open = new Intent(this, MainActivity.class);
                open.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
                startActivity(open);
                stopSelf();
            });

            windowManager.addView(overlayView, params);

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void removeOverlay() {
        try {
            if (windowManager != null && overlayView != null) {
                windowManager.removeView(overlayView);
                overlayView = null;
            }
        } catch (Exception ignored) {}
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Sonido — STREAM_ALARM bypasea el modo silencio y vibrar
    // ─────────────────────────────────────────────────────────────────────────

    private void playAlarmSound() {
        try {
            if (mediaPlayer != null) {
                mediaPlayer.stop();
                mediaPlayer.release();
            }

            android.content.res.AssetFileDescriptor afd =
                    getAssets().openFd("public/assets/audio/audio.mp3");

            mediaPlayer = new MediaPlayer();
            mediaPlayer.setAudioAttributes(
                    new AudioAttributes.Builder()
                            .setUsage(AudioAttributes.USAGE_ALARM)
                            .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                            .build()
            );

            // Subir volumen de alarma al máximo automáticamente
            AudioManager am = (AudioManager) getSystemService(AUDIO_SERVICE);
            if (am != null) {
                int maxVol = am.getStreamMaxVolume(AudioManager.STREAM_ALARM);
                am.setStreamVolume(AudioManager.STREAM_ALARM, maxVol, 0);
            }

            mediaPlayer.setDataSource(afd.getFileDescriptor(), afd.getStartOffset(), afd.getLength());
            afd.close();
            mediaPlayer.setLooping(true);
            mediaPlayer.prepare();
            mediaPlayer.start();

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Vibración
    // ─────────────────────────────────────────────────────────────────────────

    private void startVibration() {
        vibrator = (Vibrator) getSystemService(VIBRATOR_SERVICE);
        if (vibrator != null && vibrator.hasVibrator()) {
            long[] pattern = {0, 500, 500};
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                vibrator.vibrate(VibrationEffect.createWaveform(pattern, 1));
            } else {
                //noinspection deprecation
                vibrator.vibrate(pattern, 1);
            }
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Cleanup
    // ─────────────────────────────────────────────────────────────────────────

    @Override
    public void onDestroy() {
        super.onDestroy();
        if (mediaPlayer != null) { mediaPlayer.stop(); mediaPlayer.release(); mediaPlayer = null; }
        if (vibrator != null)    { vibrator.cancel(); vibrator = null; }
        if (wakeLock != null && wakeLock.isHeld()) { wakeLock.release(); wakeLock = null; }
        removeOverlay();
        NotificationManager nm = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
        if (nm != null) nm.cancel(NOTIFICATION_ID);
    }

    @Override
    public IBinder onBind(Intent intent) { return null; }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID, "Alarma de nuevas órdenes", NotificationManager.IMPORTANCE_HIGH
            );
            channel.setDescription("Suena cuando llega una nueva orden");
            channel.setSound(null, new AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_ALARM).build());
            channel.enableVibration(false);
            NotificationManager nm = getSystemService(NotificationManager.class);
            if (nm != null) nm.createNotificationChannel(channel);
        }
    }
}