//
//  AppInfoPlugin.m
//  App
//
//  Created by Luis Noblecilla on 11/04/26.
//

#import <Capacitor/Capacitor.h>

CAP_PLUGIN(AppInfoPlugin, "AppInfoPlugin",
    CAP_PLUGIN_METHOD(getVersionName, CAPPluginReturnPromise);
)
