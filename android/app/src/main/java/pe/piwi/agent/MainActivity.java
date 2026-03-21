package pe.piwi.agent;

import android.content.Intent;
import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        registerPlugin(ShareTargetPlugin.class);
        registerPlugin(AlarmPlugin.class);
        super.onCreate(savedInstanceState);
        handleShareIntent(getIntent());
        handleOrderIntent(getIntent());
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        handleShareIntent(intent);
        handleOrderIntent(intent);
    }

    // ── Share Target ──────────────────────────────────────────────
    private void handleShareIntent(Intent intent) {
        if (Intent.ACTION_SEND.equals(intent.getAction()) &&
                intent.getType() != null &&
                intent.getType().startsWith("text/plain")) {
            String text = intent.getStringExtra(Intent.EXTRA_TEXT);
            if (text != null) {
                getSharedPreferences("share_target", MODE_PRIVATE)
                        .edit()
                        .putString("pending_share", text)
                        .apply();
            }
        }
    }

    // ── Orden desde notificación FCM ──────────────────────────────
    private void handleOrderIntent(Intent intent) {
        if (intent == null) return;
        String orderUuid = intent.getStringExtra("orderUuid");
        if (orderUuid != null && !orderUuid.isEmpty()) {
            // Guardar en SharedPreferences — Angular lo lee al estar listo
            getSharedPreferences("fcm_data", MODE_PRIVATE)
                    .edit()
                    .putString("pending_order_uuid", orderUuid)
                    .apply();
            // Limpiar el extra para no procesarlo dos veces
            intent.removeExtra("orderUuid");
        }
    }
}