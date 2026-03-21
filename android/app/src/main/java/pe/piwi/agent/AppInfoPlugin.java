package pe.piwi.agent;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "AppInfoPlugin")
public class AppInfoPlugin extends Plugin {

    @PluginMethod
    public void getVersionName(PluginCall call) {
        try {
            String versionName = getContext()
                    .getPackageManager()
                    .getPackageInfo(getContext().getPackageName(), 0)
                    .versionName;

            JSObject result = new JSObject();
            result.put("versionName", versionName);
            call.resolve(result);
        } catch (Exception e) {
            call.reject("Error obteniendo versionName: " + e.getMessage());
        }
    }
}