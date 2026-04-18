//
//  ShareTargetPlugin.swift
//  App
//
//  Created by Luis Noblecilla on 11/04/26.
//

import Foundation
import Capacitor

@objc(ShareTargetPlugin)
public class ShareTargetPlugin: CAPPlugin {
    
    // ⚠️ IMPORTANTE: Este ID debe ser EXACTAMENTE el mismo App Group
    // que configurarás en tu cuenta de Apple Developer y en Xcode.
    let appGroupID = "group.pe.piwi.agent"
    
    @objc func getPendingShare(_ call: CAPPluginCall) {
        // 1. Intentamos acceder a la "caja de arena" compartida
        guard let sharedDefaults = UserDefaults(suiteName: appGroupID) else {
            call.reject("No se pudo acceder al App Group. Verifica el ID.")
            return
        }
        
        // 2. Leemos el texto que la Extensión guardó (usamos la misma llave que en Android)
        let pendingText = sharedDefaults.string(forKey: "pending_share")
        
        // 3. Limpiamos la variable para no procesar la misma orden dos veces
        if pendingText != nil {
            sharedDefaults.removeObject(forKey: "pending_share")
        }
        
        // 4. Resolvemos la promesa devolviendo el JSON que espera tu Angular
        call.resolve([
            "text": pendingText ?? NSNull() // Devuelve el texto o nulo si no hay nada
        ])
    }
}
