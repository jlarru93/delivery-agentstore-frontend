//
//  AppInfoPlugin.swift
//  App
//
//  Created by Luis Noblecilla on 11/04/26.
//

import Foundation
import Capacitor

@objc(AppInfoPlugin)
public class AppInfoPlugin: CAPPlugin {
    @objc func getVersionName(_ call: CAPPluginCall) {
        let version = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0.0"
        call.resolve([
            "versionName": version
        ])
    }
}
