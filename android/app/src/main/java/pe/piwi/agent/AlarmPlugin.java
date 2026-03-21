package pe.piwi.agent;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import androidx.core.content.ContextCompat;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "AlarmPlugin")
public class AlarmPlugin extends Plugin {

    static final String PREFS_NAME = "alarm_config";
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

    // Angular llama esto cada vez que el usuario guarda la config
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

    // Lee el uuid de la orden pendiente
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
}