//
//  ViewController.swift
//  BridgeDemoIOS
//
//  Created by Viethai Pham on 1/4/19.
//  Copyright © 2019 Viet Hai Pham. All rights reserved.
//

import UIKit
import WebKit

class ViewController: UIViewController {
  override func loadView() {
    super.loadView()
    let module = ExampleModule()
    let bridge = ExampleModuleBridge(module: module, delegate: self)
    let contentController = WKUserContentController()
    let config = WKWebViewConfiguration()
    contentController.add(bridge, name: "ExampleModule")
    config.userContentController = contentController
    
    let webView = WKWebView(frame: self.view!.bounds, configuration: config)
    self.view!.addSubview(webView)
    
    // Load local web page.
    let url = URL(string: "http://127.0.0.1:8000")!
    let request = URLRequest(url: url)
    webView.load(request)
  }
}

extension ViewController: BridgeDelegate {
  func evaluateJavaScript(_ javascript: String, completionHandler: ((Any?, Error?) -> Void)?) {
    DispatchQueue.main.async {
      (self.view!.subviews.first(where: {$0 is WKWebView}) as! WKWebView)
        .evaluateJavaScript(javascript, completionHandler: completionHandler)
    }
  }
}
