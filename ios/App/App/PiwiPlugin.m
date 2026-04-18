//
//  PiwiPlugin.m
//  App
//
//  Created by Luis Noblecilla on 11/04/26.
//

#import <Capacitor/Capacitor.h>

CAP_PLUGIN(PiwiPlugin, "PiwiPlugin",
    CAP_PLUGIN_METHOD(printComanda, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(downloadFile, CAPPluginReturnPromise);
)
