package pe.piwi.agent;

import android.content.Context;
import android.content.SharedPreferences;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "ShareTarget")
public class ShareTargetPlugin extends Plugin {

    @PluginMethod
    public void getPendingShare(PluginCall call) {
        SharedPreferences prefs = getContext()
                .getSharedPreferences("share_target", Context.MODE_PRIVATE);
        String pending = prefs.getString("pending_share", null);
        prefs.edit().remove("pending_share").apply();

        JSObject result = new JSObject();
        result.put("text", pending);
        call.resolve(result);
    }
}