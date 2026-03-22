package pe.piwi.agent;

import android.app.DownloadManager;
import android.content.Context;
import android.net.Uri;
import android.os.Environment;
import android.print.PrintAttributes;
import android.print.PrintDocumentAdapter;
import android.print.PrintManager;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * PiwiPlugin — Capacitor plugin para impresión y descarga.
 *
 * Registrar en MainActivity.java:
 *   registerPlugin(PiwiPlugin.class);
 *
 * Angular lo llama via:
 *   const PiwiPlugin = registerPlugin('PiwiPlugin');
 *   PiwiPlugin.printComanda({ html: '...' });
 *   PiwiPlugin.downloadFile({ url: '...', fileName: '...' });
 */
@CapacitorPlugin(name = "PiwiPlugin")
public class PiwiPlugin extends Plugin {

    /**
     * Recibe el HTML de la comanda y abre el diálogo de impresión del sistema.
     */
    @PluginMethod
    public void printComanda(PluginCall call) {
        String html = call.getString("html");
        if (html == null || html.isEmpty()) {
            call.reject("html requerido");
            return;
        }

        // El WebView de impresión debe crearse en el hilo UI
        getActivity().runOnUiThread(() -> {
            WebView printWebView = new WebView(getContext());
            printWebView.getSettings().setJavaScriptEnabled(true);

            printWebView.setWebViewClient(new WebViewClient() {
                @Override
                public void onPageFinished(WebView view, String url) {
                    PrintManager printManager =
                            (PrintManager) getContext().getSystemService(Context.PRINT_SERVICE);

                    String jobName = "Comanda_Piwi";
                    PrintDocumentAdapter adapter = view.createPrintDocumentAdapter(jobName);

                    PrintAttributes attributes = new PrintAttributes.Builder()
                            .setMediaSize(PrintAttributes.MediaSize.ISO_A4)
                            .setResolution(new PrintAttributes.Resolution("pdf", "pdf", 600, 600))
                            .setMinMargins(PrintAttributes.Margins.NO_MARGINS)
                            .build();

                    printManager.print(jobName, adapter, attributes);
                    call.resolve();
                }
            });

            printWebView.loadDataWithBaseURL(null, html, "text/html", "UTF-8", null);
        });
    }

    /**
     * Descarga un archivo remoto usando DownloadManager del sistema.
     */
    @PluginMethod
    public void downloadFile(PluginCall call) {
        String url      = call.getString("url");
        String fileName = call.getString("fileName", "reporte.xlsx");

        if (url == null || url.isEmpty()) {
            call.reject("url requerido");
            return;
        }

        DownloadManager.Request request = new DownloadManager.Request(Uri.parse(url));
        request.setTitle(fileName);
        request.setDescription("Descargando reporte Piwi");
        request.setNotificationVisibility(
                DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
        request.setDestinationInExternalPublicDir(
                Environment.DIRECTORY_DOWNLOADS, fileName);

        DownloadManager dm =
                (DownloadManager) getContext().getSystemService(Context.DOWNLOAD_SERVICE);
        dm.enqueue(request);

        JSObject result = new JSObject();
        result.put("ok", true);
        call.resolve(result);
    }
}