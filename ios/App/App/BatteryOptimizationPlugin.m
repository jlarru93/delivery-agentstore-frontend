//
//  BatteryOptimizationPlugin.m
//  App
//
//  Created by Luis Noblecilla on 11/04/26.
//

#import <Capacitor/Capacitor.h>

CAP_PLUGIN(BatteryOptimizationPlugin, "BatteryOptimizationPlugin",
    CAP_PLUGIN_METHOD(isIgnoringBatteryOptimizations, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(openBatterySettings, CAPPluginReturnPromise);
)
