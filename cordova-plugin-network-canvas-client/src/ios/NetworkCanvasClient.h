//
//  NetworkCanvasClient.h
//  NetworkCanvas
//
//  Created by Bryan Fox on 8/13/18.
//  Copyright © 2018 Codaco. All rights reserved.
//

#import <Cordova/CDV.h>

@interface NetworkCanvasClient : CDVPlugin <NSURLSessionDelegate, NSURLSessionTaskDelegate>

/**
 Supply a public Server certificate to be considered trusted.
 Async.

 Arguments to the cordova command:
 1. {string} The PEM-formatted certificate
 */
- (void)acceptCertificate:(CDVInvokedUrlCommand*)command;

/**
 Send a request to a Server and receive the response.
 Async.

 Arguments to the cordova command:
 1. {string} deviceId, used for auth
 2. {string} URL
 3. {string} HTTP method
 4. {string} (optional) POST body
 */
- (void)send:(CDVInvokedUrlCommand*)command;

/**
 Send a request to a Server and save the response data to the specifed local file URL.
 Async.

 Arguments to the cordova command:
 1. {string} deviceId, used for auth
 2. {string} sourceURL of data to download
 3. {string} targetURL local filesystem URL to save file
 */
- (void)download:(CDVInvokedUrlCommand*)command;

@end
