package pe.piwi.agent;

import android.content.Intent;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;

import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        registerPlugin(ShareTargetPlugin.class);
        registerPlugin(AlarmPlugin.class);
        registerPlugin(AppInfoPlugin.class);
        registerPlugin(BatteryOptimizationPlugin.class);
        registerPlugin(PiwiPlugin.class);
        super.onCreate(savedInstanceState);

        // ✅ Fix Android 15 edge-to-edge: restaurar comportamiento clásico
        applyStatusBarFix();

        handleShareIntent(getIntent());
        handleOrderIntent(getIntent());
    }

    /**
     * Android 15 (API 35+) fuerza edge-to-edge y hace que el contenido
     * quede detrás de la status bar. Este método restaura el comportamiento
     * correcto: status bar verde PIWI, contenido debajo de ella.
     */
    private void applyStatusBarFix() {
        Window window = getWindow();

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.VANILLA_ICE_CREAM) {
            // Android 15+ (API 35)
            // Decirle al sistema que el layout NO se extiende detrás de las barras del sistema
            WindowCompat.setDecorFitsSystemWindows(window, true);

            // Forzar color de status bar verde PIWI
            window.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS);
            window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
            window.setStatusBarColor(Color.parseColor("#398E3C"));

            // Iconos claros (blancos) sobre fondo verde oscuro
            WindowInsetsControllerCompat controller =
                    new WindowInsetsControllerCompat(window, window.getDecorView());
            controller.setAppearanceLightStatusBars(false); // false = iconos blancos

        } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            // Android 5–14: comportamiento estándar ya controlado por el tema,
            // pero forzamos por si Capacitor lo sobreescribe
            window.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS);
            window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
            window.setStatusBarColor(Color.parseColor("#398E3C"));
        }
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        handleShareIntent(intent);
        handleOrderIntent(intent);
    }

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

    private void handleOrderIntent(Intent intent) {
        if (intent == null) return;
        String orderUuid = intent.getStringExtra("orderUuid");
        if (orderUuid != null && !orderUuid.isEmpty()) {
            getSharedPreferences("fcm_data", MODE_PRIVATE)
                    .edit()
                    .putString("pending_order_uuid", orderUuid)
                    .apply();
            intent.removeExtra("orderUuid");
        }
    }
}