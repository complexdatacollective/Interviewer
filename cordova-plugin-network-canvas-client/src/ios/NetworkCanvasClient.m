//
//  NetworkCanvasClient.m
//  NetworkCanvas
//
//  This plugin requires the Cordova File Plugin:
//  https://cordova.apache.org/docs/en/latest/reference/cordova-plugin-file/
//
//  See LICENSE file at project root or https://github.com/complexdatacollective/Network-Canvas/blob/master/LICENSE
//

#import "NetworkCanvasClient.h"
#import "CDVFile.h"

NSString const *kDeviceIdKey = @"deviceId";

@interface NetworkCanvasClient()

@property NSMutableDictionary *taskMetadata;
@property NSOperationQueue *operationQueue;
@property NSData *acceptableCert;
@property CDVFile *cdvFilePlugin;

@end


@implementation NetworkCanvasClient

- (void)pluginInitialize
{
    self.operationQueue = [NSOperationQueue new];
    self.taskMetadata = [NSMutableDictionary new];
    self.cdvFilePlugin = [self.commandDelegate getCommandInstance:@"File"];
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

    SecTrustRef trust = challenge.protectionSpace.serverTrust;

    // 1. Update trust policy to require loopback addr (even if another IP/name
    //    is used to address the Server.
    //    Server certs [must] include 127.0.0.1 as CN or in SAN.
    SecPolicyRef localhostPolicy = SecPolicyCreateSSL(true, CFSTR("127.0.0.1"));
    SecTrustSetPolicies(trust, localhostPolicy);
    CFRelease(localhostPolicy);

    // 2. Add OOB trusted cert to chain
    CFDataRef cert = (__bridge CFDataRef)self.acceptableCert;
    SecCertificateRef pretrustedCert = SecCertificateCreateWithData(kCFAllocatorDefault, cert);
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
    [self sendRequestFromCommand:command isFileDownload:NO];
}

- (void)download:(CDVInvokedUrlCommand*)command
{
    [self sendRequestFromCommand:command isFileDownload:YES];
}

- (void)onReset
{
    [self.operationQueue cancelAllOperations];
    [self.taskMetadata removeAllObjects];
}

#pragma mark - private

- (void)sendRequestFromCommand:(CDVInvokedUrlCommand*)command isFileDownload:(BOOL)isFileDownload
{
    if (command.arguments.count < 3) {
        [self sendErrorMessage:@"DeviceID, URL, and method are required" toCallbackId:command.callbackId];
        return;
    }

    NSString *deviceId = [command.arguments objectAtIndex:0];
    NSString *urlStr = [command.arguments objectAtIndex:1];
    NSString *method = nil;
    NSString *body = nil;
    NSString *downloadTargetUrl = nil;

    if (isFileDownload) {
        downloadTargetUrl = [command.arguments objectAtIndex:2];
        method = @"GET";
    } else {
        method = [command.arguments objectAtIndex:2];
    }

    if (command.arguments.count > 3) {
        body = [command.arguments objectAtIndex:3];
    }

    NSMutableURLRequest *req = [NSMutableURLRequest requestWithURL:[NSURL URLWithString:urlStr]];
    req.HTTPMethod = method;
    [req addValue:@"2" forHTTPHeaderField:@"X-Device-API-Version"];
    if (!isFileDownload) {
        [req setValue:@"application/json" forHTTPHeaderField:@"Content-Type"];
    }
    if (body) {
        [req setHTTPBody:[body dataUsingEncoding:NSUTF8StringEncoding]];
    }
    [self fulfillRequest:req
            withDeviceId:deviceId
              callbackId:command.callbackId
          toDestinationFile:downloadTargetUrl];
}

- (void)sendErrorMessage:(NSString *)message toCallbackId:(NSString *)callbackId
{
    [self.commandDelegate sendPluginResult:[self errorResultWithMessage:message]
                                callbackId:callbackId];
}

- (CDVPluginResult *)errorResultWithMessage:(NSString *)message
{
    // Matches server Error object format
    NSDictionary *errorDict = @{
      @"status": @"error",
      @"message": message,
    };
    return [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsDictionary:errorDict];
}

- (void)fulfillRequest:(NSURLRequest *)req withDeviceId:(NSString *)deviceId callbackId:(NSString *)callbackId toDestinationFile:(NSString *)destinationFile
{
    NSDictionary *meta = @{ kDeviceIdKey: deviceId };
    [self.taskMetadata setObject:meta forKey:callbackId];

    NSURLSessionConfiguration *config = [NSURLSessionConfiguration defaultSessionConfiguration];
    NSURLSession *session = [NSURLSession sessionWithConfiguration:config delegate:self delegateQueue:self.operationQueue];

    NSURLSessionTask *reqTask = nil;
    if (destinationFile) {
        CDVFilesystemURL *cdvUrl = [CDVFilesystemURL fileSystemURLWithString:destinationFile];
        NSObject<CDVFileSystem> *fs = [self.cdvFilePlugin filesystemForURL:cdvUrl];
        NSString *destinationFilepath = [fs filesystemPathForURL:cdvUrl];
        if (!destinationFilepath) {
            [self sendErrorMessage:@"Invalid destination file" toCallbackId:callbackId];
            return;
        }
        NSURL *destURL = [NSURL fileURLWithPath:destinationFilepath];
        reqTask = [self downloadTaskForSession:session
                                   withRequest:req
                                    callbackId:callbackId
                                 toDestination:destURL];
    } else {
        reqTask = [self dataTaskForSession:session withRequest:req callbackId:callbackId];
    }

    [reqTask setTaskDescription:callbackId];

    // TODO: Cancel token support. (Send a cancellation ID, but keep result open for normal resolution.)
    //    CDVPluginResult *cancelToken = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:callbackId];
    //    // API accepts NSNumber, but is converted to bool internally
    //    cancelToken.keepCallback = @1;
    //    [self.commandDelegate sendPluginResult:cancelToken callbackId:callbackId];
    [reqTask resume];
}

- (NSURLSessionTask *)dataTaskForSession:(NSURLSession *)session withRequest:(NSURLRequest *)req callbackId:(NSString *)callbackId
{
    return [session dataTaskWithRequest:req completionHandler:^(NSData *data, NSURLResponse *response, NSError *error) {
        NSHTTPURLResponse *httpResponse = (NSHTTPURLResponse *)response;
        CDVPluginResult *pluginResult = nil;

        if (error) {
            pluginResult = [self errorResultWithMessage:error.localizedDescription];
        } else {
            NSString *resp = [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
            CDVCommandStatus cdvStatus = (httpResponse.statusCode >= 400) ? CDVCommandStatus_ERROR : CDVCommandStatus_OK;
            pluginResult = [CDVPluginResult resultWithStatus:cdvStatus messageAsString:resp];
        }

        [self.commandDelegate sendPluginResult:pluginResult callbackId:callbackId];
        [self.taskMetadata removeObjectForKey:callbackId];
    }];
}

- (NSURLSessionTask *)downloadTaskForSession:(NSURLSession *)session withRequest:(NSURLRequest*)req callbackId:(NSString *)callbackId toDestination:(NSURL *)destination
{
    return [session downloadTaskWithRequest:req completionHandler:^(NSURL *location, NSURLResponse *response, NSError *error) {
        NSHTTPURLResponse *httpResponse = (NSHTTPURLResponse *)response;
        CDVPluginResult *pluginResult = nil;
        if (error) {
            pluginResult = [self errorResultWithMessage:error.localizedDescription];
        } else if (httpResponse.statusCode >= 400) {
            pluginResult = [self errorResultWithMessage:@"File download failed"];
        } else {
            NSFileManager *fileManager = [NSFileManager defaultManager];

            BOOL success = [fileManager moveItemAtURL:location toURL:destination error:nil];
            if (success) {
                NSDictionary *fileInfo = [self.cdvFilePlugin makeEntryForURL:destination];
                pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:fileInfo];
            } else {
                pluginResult = [self errorResultWithMessage:@"Error processing downloaded file"];
            }
        }

        [self.commandDelegate sendPluginResult:pluginResult callbackId:callbackId];
        [self.taskMetadata removeObjectForKey:callbackId];
    }];
}

@end
