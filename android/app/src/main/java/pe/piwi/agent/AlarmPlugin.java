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

    static final String PREFS_NAME         = "alarm_config";
    static final String KEY_SOUND          = "sound";
    static final String KEY_VIBRATION      = "vibration";
    // ✅ NUEVO: controla si la alarma bypasea silencio/DND
    static final String KEY_BYPASS_SILENT  = "bypassSilent";

    /** Una orden que ya suena lleva esto como mínimo antes de que la lista de órdenes pueda detenerla. */
    private static final long RECONCILE_GRACE_MS = 30_000L;

    // La instancia viva (con la app abierta) para avisar a Angular cuando la alarma empieza o termina
    private static AlarmPlugin instance;

    @Override
    public void load() {
        instance = this;
    }

    /**
     * AlarmService avisa aquí: el topbar muestra el botón "Silenciar" mientras haya una alarma sonando.
     *   AlarmPlugin.addListener('alarmState', ({ ringing }) => ...)
     */
    static void emitState(boolean ringing) {
        AlarmPlugin plugin = instance;
        if (plugin == null) return;
        JSObject data = new JSObject();
        data.put("ringing", ringing);
        plugin.notifyListeners("alarmState", data);
    }

    /** Estado actual, para pintar el botón al abrir la app con la alarma ya sonando. */
    @PluginMethod
    public void isRinging(PluginCall call) {
        JSObject result = new JSObject();
        result.put("ringing", AlarmService.alive);
        call.resolve(result);
    }

    @PluginMethod
    public void stopAlarm(PluginCall call) {
        // Si viene el uuid, es porque esa orden fue cancelada: se recuerda para que un "orden nueva" tardío no suene
        AlarmGuard.markCancelled(getContext(), call.getString("orderUuid"));
        Intent stopIntent = new Intent(getContext(), AlarmService.class);
        getContext().stopService(stopIntent);
        call.resolve();
    }

    @PluginMethod
    public void startAlarm(PluginCall call) {
        JSObject result = new JSObject();
        String orderUuid = call.getString("orderUuid");

        // La orden ya fue cancelada: no hay nada que atender
        if (AlarmGuard.isCancelled(getContext(), orderUuid)) {
            result.put("started", false);
            result.put("reason", "cancelled");
            call.resolve(result);
            return;
        }
        // El servicio nativo ya la hizo sonar con el mismo aviso: no se reinicia el audio
        if (AlarmService.orderRinging) {
            result.put("started", false);
            result.put("reason", "already");
            call.resolve(result);
            return;
        }

        Intent startIntent = new Intent(getContext(), AlarmService.class);
        ContextCompat.startForegroundService(getContext(), startIntent);
        result.put("started", true);
        call.resolve(result);
    }

    /**
     * La app compara con la lista de órdenes: si NO hay ninguna orden pendiente de aceptar y una alarma de orden lleva sonando
     * más de 30 s, se apaga (la orden se canceló o la atendió otro y el aviso nunca llegó).
     * Si hay al menos una orden pendiente, o la alarma es reciente, no se toca.
     */
    @PluginMethod
    public void reconcile(PluginCall call) {
        int openOrders = call.getInt("openOrders", 1);
        boolean stopped = false;
        if (openOrders <= 0 && AlarmService.orderRinging
                && System.currentTimeMillis() - AlarmService.orderRingingSince > RECONCILE_GRACE_MS) {
            getContext().stopService(new Intent(getContext(), AlarmService.class));
            stopped = true;
        }
        JSObject result = new JSObject();
        result.put("stopped", stopped);
        call.resolve(result);
    }

    @PluginMethod
    public void saveConfig(PluginCall call) {
        boolean sound        = call.getBoolean("sound",        true);
        boolean vibration    = call.getBoolean("vibration",    true);
        boolean bypassSilent = call.getBoolean("bypassSilent", false);

        getContext()
                .getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
                .edit()
                .putBoolean(KEY_SOUND,         sound)
                .putBoolean(KEY_VIBRATION,     vibration)
                .putBoolean(KEY_BYPASS_SILENT, bypassSilent)
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

        boolean hasOverlayPermission = Settings.canDrawOverlays(ctx);

        // Leer si el bypass está activado para mostrarlo en la UI
        boolean bypassSilent = ctx
                .getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
                .getBoolean(KEY_BYPASS_SILENT, false);

        JSObject result = new JSObject();
        result.put("ringerMode",           ringerMode);
        result.put("hasDndAccess",         hasDndAccess);
        result.put("hasOverlayPermission", hasOverlayPermission);
        result.put("alarmVolume",          alarmVolume);
        result.put("alarmMaxVolume",       alarmMaxVolume);
        result.put("bypassSilent",         bypassSilent);
        call.resolve(result);
    }

    @PluginMethod
    public void openDndSettings(PluginCall call) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            Intent intent = new Intent(Settings.ACTION_NOTIFICATION_POLICY_ACCESS_SETTINGS);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(intent);
        }
        call.resolve();
    }

    @PluginMethod
    public void openSoundSettings(PluginCall call) {
        Intent intent = new Intent(Settings.ACTION_SOUND_SETTINGS);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        getContext().startActivity(intent);
        call.resolve();
    }

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