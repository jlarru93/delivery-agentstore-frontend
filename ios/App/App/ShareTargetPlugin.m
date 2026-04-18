//
//  ShareTargetPlugin.m
//  App
//
//  Created by Luis Noblecilla on 11/04/26.
//

#import <Capacitor/Capacitor.h>

// El primer parámetro es la clase en Swift.
// El segundo es el nombre ("ShareTarget") que usaste en tu @CapacitorPlugin(name = "ShareTarget")
CAP_PLUGIN(ShareTargetPlugin, "ShareTarget",
    CAP_PLUGIN_METHOD(getPendingShare, CAPPluginReturnPromise);
)
