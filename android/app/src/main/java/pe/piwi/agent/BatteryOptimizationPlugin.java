package pe.piwi.agent;

import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.PowerManager;
import android.provider.Settings;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "BatteryOptimizationPlugin")
public class BatteryOptimizationPlugin extends Plugin {

    /**
     * Verifica si la app está ignorando optimizaciones de batería
     * (es decir, si ya tiene "Sin restricciones")
     */
    @PluginMethod
    public void isIgnoringBatteryOptimizations(PluginCall call) {
        boolean isIgnoring = false;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            PowerManager pm = (PowerManager) getContext().getSystemService(getContext().POWER_SERVICE);
            if (pm != null) {
                isIgnoring = pm.isIgnoringBatteryOptimizations(getContext().getPackageName());
            }
        } else {
            isIgnoring = true; // Versiones anteriores no tienen esta restricción
        }
        JSObject result = new JSObject();
        result.put("isIgnoring", isIgnoring);
        call.resolve(result);
    }

    /**
     * Abre la pantalla de ajustes de batería de la app
     * En MIUI abre directamente "Ahorro de batería" de la app
     */
    @PluginMethod
    public void openBatterySettings(PluginCall call) {
        try {
            Intent intent = null;

            // Intentar abrir ajustes específicos de MIUI primero
            String manufacturer = Build.MANUFACTURER.toLowerCase();
            if (manufacturer.contains("xiaomi") || manufacturer.contains("redmi") || manufacturer.contains("poco")) {
                // MIUI: pantalla de uso de batería de la app específica
                intent = new Intent("miui.intent.action.POWER_HIDE_MODE_APP_LIST");
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                if (isIntentAvailable(intent)) {
                    getContext().startActivity(intent);
                    call.resolve();
                    return;
                }

                // Fallback MIUI: ajustes de la app
                intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
                intent.setData(Uri.parse("package:" + getContext().getPackageName()));
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                getContext().startActivity(intent);
                call.resolve();
                return;
            }

            // Android estándar: solicitar ignorar optimizaciones de batería
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                intent = new Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS);
                intent.setData(Uri.parse("package:" + getContext().getPackageName()));
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                getContext().startActivity(intent);
            } else {
                intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
                intent.setData(Uri.parse("package:" + getContext().getPackageName()));
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                getContext().startActivity(intent);
            }
            call.resolve();
        } catch (Exception e) {
            call.reject("Error abriendo ajustes de batería: " + e.getMessage());
        }
    }

    private boolean isIntentAvailable(Intent intent) {
        return getContext().getPackageManager()
                .queryIntentActivities(intent, 0).size() > 0;
    }
}