//
//  AlarmPlugin.swift
//  App
//
//  Created by Luis Noblecilla on 11/04/26.
//

import Foundation
import Capacitor
import AVFoundation

@objc(AlarmPlugin)
public class AlarmPlugin: CAPPlugin {
    
    var audioPlayer: AVAudioPlayer?
    let userDefaults = UserDefaults.standard
    
    // Constantes (iguales a las de Android)
    let PREFS_NAME = "alarm_config"
    let KEY_SOUND = "sound"
    let KEY_VIBRATION = "vibration"
    let KEY_BYPASS_SILENT = "bypassSilent"

    @objc func startAlarm(_ call: CAPPluginCall) {
        let soundEnabled = userDefaults.bool(forKey: KEY_SOUND)
        let bypassSilent = userDefaults.bool(forKey: KEY_BYPASS_SILENT)
        
        // Si el usuario desactivó el sonido en la config de tu app, no hacemos nada
        guard soundEnabled else {
            call.resolve()
            return
        }
        
        // 1. Configurar la sesión de audio
        do {
            let session = AVAudioSession.sharedInstance()
            
            if bypassSilent {
                // IGNORAR BOTÓN DE SILENCIO (Juega como si fuera Spotify o un video)
                try session.setCategory(.playback, mode: .default, options: [])
            } else {
                // RESPETA EL BOTÓN DE SILENCIO
                try session.setCategory(.ambient, mode: .default, options: [])
            }
            try session.setActive(true)
            
        } catch {
            print("Error configurando AVAudioSession: \(error.localizedDescription)")
        }
        
        // 2. Cargar y reproducir el sonido en bucle infinito
        // ⚠️ IMPORTANTE: El archivo audio.caf debe estar arrastrado a tu proyecto Xcode
        if let soundURL = Bundle.main.url(forResource: "audio", withExtension: "caf") {
            do {
                audioPlayer = try AVAudioPlayer(contentsOf: soundURL)
                audioPlayer?.numberOfLoops = -1 // -1 significa bucle infinito
                audioPlayer?.prepareToPlay()
                audioPlayer?.play()
            } catch {
                print("Error reproduciendo audio: \(error.localizedDescription)")
            }
        } else {
            print("No se encontró audio.caf en el Bundle principal")
        }
        
        call.resolve()
    }

    @objc func stopAlarm(_ call: CAPPluginCall) {
        // Detener el reproductor
        if let player = audioPlayer, player.isPlaying {
            player.stop()
        }
        
        // Desactivar la sesión de audio para liberar recursos
        do {
            try AVAudioSession.sharedInstance().setActive(false)
        } catch {
            print("Error desactivando AVAudioSession: \(error.localizedDescription)")
        }
        
        call.resolve()
    }

    @objc func saveConfig(_ call: CAPPluginCall) {
        let sound = call.getBool("sound", true)
        let vibration = call.getBool("vibration", true)
        let bypassSilent = call.getBool("bypassSilent", false)
        
        userDefaults.set(sound, forKey: KEY_SOUND)
        userDefaults.set(vibration, forKey: KEY_VIBRATION)
        userDefaults.set(bypassSilent, forKey: KEY_BYPASS_SILENT)
        
        call.resolve()
    }

    @objc func getAudioStatus(_ call: CAPPluginCall) {
        // En iOS, no podemos leer el volumen de la alarma nativa ni si el DND está activo
        // de la misma manera que en Android. Devolvemos valores mock o la configuración guardada.
        let bypassSilent = userDefaults.bool(forKey: KEY_BYPASS_SILENT)
        
        call.resolve([
            "ringerMode": -1, // No soportado en iOS público
            "hasDndAccess": true, // iOS lo maneja automático
            "hasOverlayPermission": true, // No existe en iOS, Angular dibuja el overlay
            "alarmVolume": 7,
            "alarmMaxVolume": 7,
            "bypassSilent": bypassSilent
        ])
    }

    @objc func openSoundSettings(_ call: CAPPluginCall) {
        // Abre los ajustes generales del dispositivo
        if let url = URL(string: UIApplication.openSettingsURLString) {
            DispatchQueue.main.async {
                UIApplication.shared.open(url)
            }
        }
        call.resolve()
    }

    // Estos métodos no aplican a iOS, los dejamos para que Angular no falle
    @objc func getPendingOrderUuid(_ call: CAPPluginCall) { call.resolve(["order": NSNull()]) }
    @objc func openDndSettings(_ call: CAPPluginCall) { openSoundSettings(call) }
    @objc func openOverlaySettings(_ call: CAPPluginCall) { openSoundSettings(call) }
}
