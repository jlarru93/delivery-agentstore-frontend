//
//  AlarmPlugin.m
//  App
//
//  Created by Luis Noblecilla on 11/04/26.
//

#import <Capacitor/Capacitor.h>

CAP_PLUGIN(AlarmPlugin, "AlarmPlugin",
    CAP_PLUGIN_METHOD(startAlarm, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(stopAlarm, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(saveConfig, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(getAudioStatus, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(openSoundSettings, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(getPendingOrderUuid, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(openDndSettings, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(openOverlaySettings, CAPPluginReturnPromise);
)
