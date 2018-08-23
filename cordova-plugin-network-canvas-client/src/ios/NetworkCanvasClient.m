//
//  NetworkCanvasClient.m
//  NetworkCanvas
//
//  Created by Bryan Fox on 8/13/18.
//  Copyright © 2018 Codaco. All rights reserved.
//

#import "NetworkCanvasClient.h"

typedef void(^DataTaskCompletion)(NSData *data, NSURLResponse *response, NSError *error);

NSString const *kDeviceIdKey = @"deviceId";

@interface NetworkCanvasClient()

@property NSMutableDictionary *taskMetadata;
@property NSOperationQueue *operationQueue;
@property NSData *acceptableCert;

@end


@implementation NetworkCanvasClient

- (void)pluginInitialize
{
    self.operationQueue = [NSOperationQueue new];
    self.taskMetadata = [NSMutableDictionary new];
}

#pragma mark - NSURLSessionTaskDelegate

// Challenge for HTTP basic auth: provide the deviceID as the username
// Only sent for HTTPS requests to protect confidentiality of ID.
// TODO: Review. Possibly require IP, and not hostname? Else DNS is attack vector for revealing deviceId...
- (void)URLSession:(NSURLSession *)session
              task:(NSURLSessionTask *)task
didReceiveChallenge:(NSURLAuthenticationChallenge *)challenge
 completionHandler:(void (^)(NSURLSessionAuthChallengeDisposition disposition, NSURLCredential *credential))completionHandler
{
    NSURLProtectionSpace *protectionSpace = challenge.protectionSpace;
    if (
        [protectionSpace.authenticationMethod isEqualToString:NSURLAuthenticationMethodHTTPBasic] &&
        [protectionSpace.protocol isEqualToString:NSURLProtectionSpaceHTTPS]
        ) {
        NSDictionary *meta = [self.taskMetadata objectForKey:task.taskDescription];
        NSString *deviceId = [meta objectForKey:kDeviceIdKey];
        NSURLCredential *cred = [NSURLCredential credentialWithUser:deviceId
                                                           password:@""
                                                        persistence:NSURLCredentialPersistenceForSession];
        completionHandler(NSURLSessionAuthChallengeUseCredential, cred);
    } else {
        completionHandler(NSURLSessionAuthChallengePerformDefaultHandling, nil);
    }
}

#pragma mark - NSURLSessionDelegate

// Server certificate challenge
- (void)URLSession:(NSURLSession *)session
didReceiveChallenge:(NSURLAuthenticationChallenge *)challenge
 completionHandler:(void (^)(NSURLSessionAuthChallengeDisposition disposition, NSURLCredential *credential))completionHandler
{
    if (![challenge.protectionSpace.authenticationMethod isEqualToString:NSURLAuthenticationMethodServerTrust]) {
        completionHandler(NSURLSessionAuthChallengePerformDefaultHandling, nil);
        return;
    }

    NSLog(@"ProtectHost %@", challenge.protectionSpace.host);

    SecTrustRef trust = challenge.protectionSpace.serverTrust;

    // 1. Update trust policy to require loopback addr (even if another IP/name
    //    is used to address the Server.
    //    Server certs [must] include 127.0.0.1 as CN or in SAN.
    SecPolicyRef localhostPolicy = SecPolicyCreateSSL(true, CFSTR("127.0.0.1"));
    SecTrustSetPolicies(trust, localhostPolicy);
    CFRelease(localhostPolicy);

    // 2. Add OOB trusted cert to chain
    CFDataRef cert = (__bridge CFDataRef)self.acceptableCert;
    SecCertificateRef pretrustedCert = SecCertificateCreateWithData(kCFAllocatorDefault,
                                                                    cert);
    if (pretrustedCert) {
        SecCertificateRef preTrustedCerts[1];
        preTrustedCerts[0] = pretrustedCert;
        CFArrayRef certs = CFArrayCreate(kCFAllocatorDefault,
                                         (const void **)preTrustedCerts, 1,
                                         &kCFTypeArrayCallBacks);
        SecTrustSetAnchorCertificates(trust, certs);
        CFRelease(certs);
        CFRelease(pretrustedCert);
    } else {
        NSLog(@"WARN Couldn't create trusted cert ref (probably invalid format)");
    }

    // 3. Evaluate the trust policy
    SecTrustResultType evaluationResult = kSecTrustResultInvalid;

    if (SecTrustEvaluate(trust, &evaluationResult) != errSecSuccess) {
        NSLog(@"WARN Cert could not be evaluated");
    }

    switch (evaluationResult) {
        case kSecTrustResultUnspecified: // OS trusts this certificate
            completionHandler(NSURLSessionAuthChallengeUseCredential,
                              [NSURLCredential credentialForTrust:challenge.protectionSpace.serverTrust]);
            break;
        default:
            NSLog(@"Invalid cert");
            completionHandler(NSURLSessionAuthChallengeCancelAuthenticationChallenge, NULL);
    }
}

#pragma mark - Cordova Interface

- (void)acceptCertificate:(CDVInvokedUrlCommand*)command
{
    if (command.arguments.count < 1) {
        [self sendErrorMessage:@"Missing certificate" toCallbackId:command.callbackId];
        return;
    }

    // Strip first line & last 2 lines (e.g. "-----END CERTIFICATE-----\n\n")
    NSString *fullCert = [command.arguments objectAtIndex:0];
    NSString *normalizedCert = [fullCert stringByReplacingOccurrencesOfString:@"\r\n" withString:@"\n"];
    NSArray *lines = [normalizedCert componentsSeparatedByCharactersInSet:[NSCharacterSet newlineCharacterSet]];
    if (lines.count < 4) {
        [self sendErrorMessage:@"Invalid certificate" toCallbackId:command.callbackId];
        return;
    }
    NSString *certificate = [[lines subarrayWithRange:NSMakeRange(1,lines.count - 3)] componentsJoinedByString:@"\n"];

    self.acceptableCert = [[NSData alloc] initWithBase64EncodedString:certificate
                                                              options:NSDataBase64DecodingIgnoreUnknownCharacters];
    CDVPluginResult *pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK
                                                      messageAsString:@"OK"];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

- (void)send:(CDVInvokedUrlCommand*)command
{
    if (command.arguments.count < 2) {
        [self sendErrorMessage:@"DeviceID, URL, and method are required" toCallbackId:command.callbackId];
        return;
    }

    NSString *deviceId = [command.arguments objectAtIndex:0];
    NSString *urlStr = [command.arguments objectAtIndex:1];
    NSString *method = [command.arguments objectAtIndex:2];

    NSString *body = nil;
    if (command.arguments.count > 3) {
        body = [command.arguments objectAtIndex:3];
    }

    NSURL *url = [NSURL URLWithString:urlStr];
    NSMutableURLRequest *req = [NSMutableURLRequest requestWithURL:url];
    req.HTTPMethod = method;
    [req setValue:@"application/json" forHTTPHeaderField:@"Content-Type"];
    if (body) {
        [req setHTTPBody:[body dataUsingEncoding:NSUTF8StringEncoding]];
    }
    [self fulfillRequestWithDeviceId: deviceId
                             request:req
                          callbackId:command.callbackId];
}

- (void)onReset
{
    [self.operationQueue cancelAllOperations];
    [self.taskMetadata removeAllObjects];
}

#pragma mark - private

- (void)sendErrorMessage:(NSString *)message toCallbackId:(NSString *)callbackId
{
    [self.commandDelegate sendPluginResult:[self errorResult:message]
                                callbackId:callbackId];
}

- (CDVPluginResult *)errorResult:(NSString *)message
{
    // Matches server Error object format
    NSDictionary *errorDict = @{
                                @"status": @"error",
                                @"message": message,
                                };
    return [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsDictionary:errorDict];
}

- (void)fulfillRequestWithDeviceId:(NSString *)deviceId request:(NSURLRequest *)req callbackId:(NSString *)callbackId
{
    NSDictionary *meta = @{ kDeviceIdKey: deviceId };
    [self.taskMetadata setObject:meta forKey:callbackId];

    NSURLSessionConfiguration *config = [NSURLSessionConfiguration defaultSessionConfiguration];
    NSURLSession *session = [NSURLSession sessionWithConfiguration:config delegate:self delegateQueue:self.operationQueue];

    DataTaskCompletion completionHandler = ^(NSData *data, NSURLResponse *response, NSError *error) {
        NSHTTPURLResponse *httpResponse = (NSHTTPURLResponse *)response;
        CDVPluginResult *pluginResult = nil;

        if (error) {
            NSLog(@"Network Error: %@", error);
            pluginResult = [self errorResult:error.localizedDescription];
        } else {
            NSString *resp = [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
            CDVCommandStatus cdvStatus = (httpResponse.statusCode >= 400) ? CDVCommandStatus_ERROR : CDVCommandStatus_OK;
            pluginResult = [CDVPluginResult resultWithStatus:cdvStatus messageAsString:resp];
        }

        [self.commandDelegate sendPluginResult:pluginResult callbackId:callbackId];
        [self.taskMetadata removeObjectForKey:callbackId];
    };

    NSURLSessionTask *reqTask = [session dataTaskWithRequest:req completionHandler:completionHandler];
    [reqTask setTaskDescription:callbackId];

    // TODO: Cancel token support. (Send a cancellation ID, but keep result open for normal resolution.)
    //    CDVPluginResult *cancelToken = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:callbackId];
    //    // API accepts NSNumber, but is converted to bool internally
    //    cancelToken.keepCallback = @1;
    //    [self.commandDelegate sendPluginResult:cancelToken callbackId:callbackId];
    [reqTask resume];
}

@end
