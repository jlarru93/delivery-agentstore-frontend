//
//  PiwiPlugin.swift
//  App
//
//  Created by Luis Noblecilla on 11/04/26.
//

import Foundation
import Capacitor
import WebKit

@objc(PiwiPlugin)
public class PiwiPlugin: CAPPlugin {
    var webViewForPrint: WKWebView?

    @objc func printComanda(_ call: CAPPluginCall) {
        guard let html = call.getString("html") else {
            call.reject("html requerido")
            return
        }

        DispatchQueue.main.async {
            // Creamos un WebView oculto para cargar el HTML
            self.webViewForPrint = WKWebView(frame: .zero)
            self.webViewForPrint?.loadHTMLString(html, baseURL: nil)
            
            // Damos un pequeño tiempo para que renderice
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                let printController = UIPrintInteractionController.shared
                let printInfo = UIPrintInfo(dictionary: nil)
                printInfo.outputType = .general
                printInfo.jobName = "Comanda_Piwi"
                printController.printInfo = printInfo
                
                let formatter = self.webViewForPrint?.viewPrintFormatter()
                printController.printFormatter = formatter
                
                printController.present(animated: true, completionHandler: nil)
                call.resolve()
            }
        }
    }

    @objc func downloadFile(_ call: CAPPluginCall) {
        guard let urlString = call.getString("url"), let url = URL(string: urlString) else {
            call.reject("url requerido")
            return
        }
        
        // En iOS, es mejor abrir Safari para que el sistema maneje la descarga del Excel/PDF
        DispatchQueue.main.async {
            UIApplication.shared.open(url)
            call.resolve(["ok": true])
        }
    }
}
