package pe.piwi.agent;

import android.app.NotificationManager;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.media.AudioManager;
import android.os.Build;
import android.provider.Settings;

import androidx.core.content.ContextCompat;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "AlarmPlugin")
public class AlarmPlugin extends Plugin {

    static final String PREFS_NAME    = "alarm_config";
    static final String KEY_SOUND     = "sound";
    static final String KEY_VIBRATION = "vibration";

    @PluginMethod
    public void stopAlarm(PluginCall call) {
        Intent stopIntent = new Intent(getContext(), AlarmService.class);
        getContext().stopService(stopIntent);
        call.resolve();
    }

    @PluginMethod
    public void startAlarm(PluginCall call) {
        Intent startIntent = new Intent(getContext(), AlarmService.class);
        ContextCompat.startForegroundService(getContext(), startIntent);
        call.resolve();
    }

    @PluginMethod
    public void saveConfig(PluginCall call) {
        boolean sound     = call.getBoolean("sound",     true);
        boolean vibration = call.getBoolean("vibration", true);
        getContext()
                .getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
                .edit()
                .putBoolean(KEY_SOUND,     sound)
                .putBoolean(KEY_VIBRATION, vibration)
                .apply();
        call.resolve();
    }

    @PluginMethod
    public void getPendingOrderUuid(PluginCall call) {
        SharedPreferences prefs = getContext()
                .getSharedPreferences("fcm_data", Context.MODE_PRIVATE);
        String uuid = prefs.getString("pending_order_uuid", null);
        prefs.edit().remove("pending_order_uuid").apply();
        JSObject result = new JSObject();
        result.put("order", uuid);
        call.resolve(result);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Estado de audio + permisos especiales
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Retorna el estado completo del audio y permisos necesarios:
     * - ringerMode: 0=silent, 1=vibrate, 2=normal
     * - hasDndAccess: permiso para sobrevivir al modo No Molestar
     * - hasOverlayPermission: permiso para mostrar ventana flotante
     * - alarmVolume / alarmMaxVolume
     */
    @PluginMethod
    public void getAudioStatus(PluginCall call) {
        Context ctx = getContext();
        AudioManager am = (AudioManager) ctx.getSystemService(Context.AUDIO_SERVICE);

        int ringerMode     = am != null ? am.getRingerMode() : -1;
        int alarmVolume    = am != null ? am.getStreamVolume(AudioManager.STREAM_ALARM) : 0;
        int alarmMaxVolume = am != null ? am.getStreamMaxVolume(AudioManager.STREAM_ALARM) : 7;

        boolean hasDndAccess = false;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            NotificationManager nm =
                    (NotificationManager) ctx.getSystemService(Context.NOTIFICATION_SERVICE);
            hasDndAccess = nm != null && nm.isNotificationPolicyAccessGranted();
        } else {
            hasDndAccess = true;
        }

        // ✅ NUEVO: permiso de superposición (overlay) para el bypass de DND visual
        boolean hasOverlayPermission = Settings.canDrawOverlays(ctx);

        JSObject result = new JSObject();
        result.put("ringerMode",          ringerMode);
        result.put("hasDndAccess",        hasDndAccess);
        result.put("hasOverlayPermission", hasOverlayPermission);
        result.put("alarmVolume",         alarmVolume);
        result.put("alarmMaxVolume",      alarmMaxVolume);
        call.resolve(result);
    }

    /** Abre ajustes de No Molestar */
    @PluginMethod
    public void openDndSettings(PluginCall call) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            Intent intent = new Intent(Settings.ACTION_NOTIFICATION_POLICY_ACCESS_SETTINGS);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(intent);
        }
        call.resolve();
    }

    /** Abre ajustes de sonido del sistema */
    @PluginMethod
    public void openSoundSettings(PluginCall call) {
        Intent intent = new Intent(Settings.ACTION_SOUND_SETTINGS);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        getContext().startActivity(intent);
        call.resolve();
    }

    /**
     * ✅ NUEVO: abre ajustes de permiso de superposición (overlay).
     * Con este permiso el AlarmService puede mostrar el banner verde
     * encima de DND y de la pantalla bloqueada.
     */
    @PluginMethod
    public void openOverlaySettings(PluginCall call) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            Intent intent = new Intent(
                    Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                    android.net.Uri.parse("package:" + getContext().getPackageName())
            );
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(intent);
        }
        call.resolve();
    }
}