//
//  BatteryOptimizationPlugin.swift
//  App
//
//  Created by Luis Noblecilla on 11/04/26.
//

import Foundation
import Capacitor

@objc(BatteryOptimizationPlugin)
public class BatteryOptimizationPlugin: CAPPlugin {
    @objc func isIgnoringBatteryOptimizations(_ call: CAPPluginCall) {
        call.resolve(["isIgnoring": true])
    }
    
    @objc func openBatterySettings(_ call: CAPPluginCall) {
        // En iOS lo mandamos a los ajustes generales de la app
        if let url = URL(string: UIApplication.openSettingsURLString) {
            DispatchQueue.main.async {
                UIApplication.shared.open(url)
            }
        }
        call.resolve()
    }
}
