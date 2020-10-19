//
//  NetworkCanvasClientPluginTests.m
//  NetworkCanvasClientPluginTests
//
//  See LICENSE file at project root or https://github.com/complexdatacollective/Network-Canvas/blob/master/LICENSE
//

#import <XCTest/XCTest.h>
#import "NetworkCanvasClient.h"


@interface NetworkCanvasClientPluginTests : XCTestCase
@property NetworkCanvasClient *client;
@end

@implementation NetworkCanvasClientPluginTests

- (void)setUp {
    [super setUp];
    // Put setup code here. This method is called before the invocation of each test method in the class.
    self.client = [NetworkCanvasClient new];
}

- (void)tearDown {
    // Put teardown code here. This method is called after the invocation of each test method in the class.
    [super tearDown];
}

#pragma - helpers

- (CDVInvokedUrlCommand *)commandWithArgs:(NSArray *)args {
    NSArray *cdvArgs = @[@"callbackId", @"ClassName", @"methodName", args];
    return [CDVInvokedUrlCommand commandFromJson:cdvArgs];
}

#pragma - tests

- (void)testAcceptDoesNotThrowWhenMissingCert {
    CDVInvokedUrlCommand *cmd = [self commandWithArgs:@[]];
    XCTAssertNoThrow([self.client acceptCertificate:cmd]);
}

- (void)testAcceptDoesNotThrowWithInvalidCert {
    CDVInvokedUrlCommand *cmd = [self commandWithArgs:@[@"mock-cert"]];
    XCTAssertNoThrow([self.client acceptCertificate:cmd]);
}

- (void)testSendDoesNotThrowWhenMissingArgs {
    CDVInvokedUrlCommand *cmd = [self commandWithArgs:@[]];
    XCTAssertNoThrow([self.client send:cmd]);
}

@end
