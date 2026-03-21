package pe.piwi.agent;

import android.content.Intent;
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
        androidx.core.content.ContextCompat.startForegroundService(getContext(), startIntent);
        call.resolve();
    }
}
