//
//  ShareViewController.swift
//  ShareExtension
//
//  Created by Luis Noblecilla on 11/04/26.
//

import UIKit
import Social

class ShareViewController: SLComposeServiceViewController {
    
    let appGroupID = "group.pe.piwi.agent"

    override func isContentValid() -> Bool {
        return !self.contentText.isEmpty
    }

    override func didSelectPost() {
        if let sharedDefaults = UserDefaults(suiteName: appGroupID) {
            sharedDefaults.set(self.contentText, forKey: "pending_share")
            sharedDefaults.synchronize()
        }
        
        self.extensionContext!.completeRequest(returningItems: [], completionHandler: nil)
    }

    override func configurationItems() -> [Any]! {
        return []
    }

}
