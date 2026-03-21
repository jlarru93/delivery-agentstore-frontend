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

    // Lee el uuid de la orden pendiente (llegó por notificación FCM)
    @PluginMethod
    public void getPendingOrderUuid(PluginCall call) {
        SharedPreferences prefs = getContext()
                .getSharedPreferences("fcm_data", Context.MODE_PRIVATE);
        String uuid = prefs.getString("pending_order_uuid", null);
        prefs.edit().remove("pending_order_uuid").apply();

        JSObject result = new JSObject();
        result.put("order", uuid);  // coincide con params['order'] en Angular
        call.resolve(result);
    }
}