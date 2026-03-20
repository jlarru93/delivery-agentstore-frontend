package pe.piwi.agent;

import android.content.Intent;
import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        registerPlugin(ShareTargetPlugin.class);
        super.onCreate(savedInstanceState);
        handleShareIntent(getIntent());
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        handleShareIntent(intent);
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
}