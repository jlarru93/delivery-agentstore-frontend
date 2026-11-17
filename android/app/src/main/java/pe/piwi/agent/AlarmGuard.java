package pe.piwi.agent;

import android.content.Context;
import android.content.SharedPreferences;

import java.util.Map;

/**
 * Recuerda qué órdenes ya fueron canceladas.
 *
 * FCM no garantiza el orden de entrega: el aviso "orden cancelada" puede llegar ANTES que "orden nueva"
 * (equipo en Doze, red lenta). Sin esta memoria, la orden nueva tardía hacía sonar la alarma por una orden que ya no existe
 * y nadie la detenía. Con ella, la orden nueva de una orden ya cancelada se ignora.
 */
final class AlarmGuard {

    private static final String PREFS = "alarm_guard";
    private static final long KEEP_MS = 2 * 60 * 60 * 1000L; // 2 h: de sobra para un aviso que vence a los 5 min

    private AlarmGuard() {}

    static void markCancelled(Context ctx, String orderUuid) {
        if (orderUuid == null || orderUuid.isEmpty()) return;
        SharedPreferences prefs = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        SharedPreferences.Editor ed = prefs.edit();
        long now = System.currentTimeMillis();
        // Limpia lo viejo para que la lista no crezca
        for (Map.Entry<String, ?> e : prefs.getAll().entrySet()) {
            Object v = e.getValue();
            if (v instanceof Long && now - (Long) v > KEEP_MS) ed.remove(e.getKey());
        }
        ed.putLong(orderUuid, now).apply();
    }

    static boolean isCancelled(Context ctx, String orderUuid) {
        if (orderUuid == null || orderUuid.isEmpty()) return false;
        return ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE).contains(orderUuid);
    }
}
