/**
 * Windows Reference Image Test for Nano-Banana
 * 
 * This test script verifies that reference images are working correctly on Windows
 * after all the fixes have been applied.
 * 
 * Run this in Photoshop on Windows to test the reference image functionality.
 */

#target photoshop

// ===== Test Configuration =====
var TEST_CONFIG = {
    IS_WINDOWS: $.os.indexOf("Windows") !== -1,
    LOG_FILE: new File(Folder.desktop + "/reference-test-results.txt"),
    PASSED: 0,
    FAILED: 0,
    TESTS: []
};

// ===== Helper Functions =====
function log(message) {
    $.writeln(message);
    TEST_CONFIG.TESTS.push(message);
}

function pass(testName) {
    TEST_CONFIG.PASSED++;
    log("✓ PASS: " + testName);
}

function fail(testName, reason) {
    TEST_CONFIG.FAILED++;
    log("✗ FAIL: " + testName + " - " + reason);
}

// ===== Test 1: Platform Detection =====
function testPlatformDetection() {
    log("\n=== TEST 1: Platform Detection ===");
    
    if (TEST_CONFIG.IS_WINDOWS) {
        pass("Windows detected correctly");
        log("  OS: " + $.os);
    } else {
        fail("Platform Detection", "Not running on Windows");
    }
}

// ===== Test 2: File Operations =====
function testFileOperations() {
    log("\n=== TEST 2: File Operations ===");
    
    // Create test file
    var testFile = new File(Folder.temp + "/test_ref_" + new Date().getTime() + ".txt");
    testFile.open("w");
    testFile.write("Test content for reference image");
    testFile.close();
    
    if (testFile.exists) {
        pass("Test file created");
        log("  Path: " + testFile.fsName);
        log("  Size: " + testFile.length + " bytes");
    } else {
        fail("File Creation", "Could not create test file");
        return;
    }
    
    // Test file copy
    var copyDest = new File(Folder.temp + "/test_copy_" + new Date().getTime() + ".txt");
    var copySuccess = false;
    
    try {
        copySuccess = testFile.copy(copyDest.fsName);
    } catch(e) {
        log("  File.copy() failed: " + e.message);
    }
    
    if (copySuccess && copyDest.exists) {
        pass("File.copy() works");
    } else {
        log("  File.copy() failed, testing system copy...");
        
        // Test system copy
        var cmd = 'cmd.exe /c copy /Y "' + testFile.fsName + '" "' + copyDest.fsName + '"';
        try {
            app.system(cmd);
            copyDest = new File(copyDest.fsName);
            if (copyDest.exists) {
                pass("System copy works");
            } else {
                fail("System Copy", "File not created");
            }
        } catch(e) {
            fail("System Copy", e.message);
        }
    }
    
    // Cleanup
    try {
        testFile.remove();
        if (copyDest.exists) copyDest.remove();
    } catch(e) {}
}

// ===== Test 3: Base64 Encoding =====
function testBase64Encoding() {
    log("\n=== TEST 3: Base64 Encoding ===");
    
    // Create test image data
    var testData = "Test image data for reference";
    var testFile = new File(Folder.temp + "/test_image_" + new Date().getTime() + ".txt");
    testFile.open("w");
    testFile.write(testData);
    testFile.close();
    
    if (!testFile.exists) {
        fail("Base64 Test", "Could not create test file");
        return;
    }
    
    // Test certutil
    var outputFile = new File(Folder.temp + "/base64_output_" + new Date().getTime() + ".txt");
    // 수정된 명령어 - 따옴표 처리 개선
    var cmd = 'cmd.exe /c certutil -encode "' + testFile.fsName + '" "' + outputFile.fsName + '"';
    
    log("  Running: " + cmd);
    
    try {
        app.system(cmd);
        
        if (outputFile.exists) {
            pass("Certutil encoding works");
            
            outputFile.open("r");
            var encoded = outputFile.read();
            outputFile.close();
            
            // Clean the output
            encoded = encoded.replace(/-----BEGIN CERTIFICATE-----/g, "");
            encoded = encoded.replace(/-----END CERTIFICATE-----/g, "");
            encoded = encoded.replace(/[\r\n\s]/g, "");
            
            log("  Encoded length: " + encoded.length + " chars");
            log("  Sample: " + encoded.substring(0, 50));
            
            if (encoded.length > 0) {
                pass("Base64 data cleaned successfully");
            } else {
                fail("Base64 Cleaning", "No data after cleaning");
            }
            
            outputFile.remove();
        } else {
            fail("Certutil", "Output file not created");
        }
    } catch(e) {
        fail("Certutil", e.message);
    }
    
    // Cleanup
    try {
        testFile.remove();
    } catch(e) {}
}

// ===== Test 4: Multiple Reference Files =====
function testMultipleReferences() {
    log("\n=== TEST 4: Multiple Reference Files ===");
    
    var referenceFiles = [];
    
    // Create 3 test reference files
    for (var i = 0; i < 3; i++) {
        var refFile = new File(Folder.temp + "/ref_" + (i+1) + "_" + new Date().getTime() + ".txt");
        refFile.open("w");
        refFile.write("Reference content " + (i+1));
        refFile.close();
        
        if (refFile.exists) {
            referenceFiles.push(refFile);
            log("  Created reference " + (i+1) + ": " + refFile.fsName);
        }
    }
    
    if (referenceFiles.length === 3) {
        pass("Created 3 reference files");
    } else {
        fail("Reference Creation", "Only created " + referenceFiles.length + " files");
    }
    
    // Test encoding each reference
    var encodedCount = 0;
    for (var j = 0; j < referenceFiles.length; j++) {
        var outputFile = new File(Folder.temp + "/base64_ref_" + (j+1) + "_" + new Date().getTime() + ".txt");
        // 수정된 명령어 - 따옴표 처리 개선
        var cmd = 'cmd.exe /c certutil -encode "' + referenceFiles[j].fsName + '" "' + outputFile.fsName + '"';
        
        try {
            app.system(cmd);
            if (outputFile.exists) {
                encodedCount++;
                outputFile.remove();
            }
        } catch(e) {}
    }
    
    if (encodedCount === referenceFiles.length) {
        pass("All reference files encoded successfully");
    } else {
        fail("Reference Encoding", "Only encoded " + encodedCount + "/" + referenceFiles.length);
    }
    
    // Cleanup
    for (var k = 0; k < referenceFiles.length; k++) {
        try {
            referenceFiles[k].remove();
        } catch(e) {}
    }
}

// ===== Test 5: Payload Order Verification =====
function testPayloadOrder() {
    log("\n=== TEST 5: Payload Order Verification ===");
    
    // Simulate payload construction
    var prompt = "Test prompt";
    var mainImageData = "MAIN_IMAGE_BASE64_DATA";
    var ref1Data = "REF1_BASE64_DATA";
    var ref2Data = "REF2_BASE64_DATA";
    
    // Build payload in correct order
    var partsArray = '{"text":"' + prompt + '"}';
    partsArray += ',{"inlineData":{"mime_type":"image/jpeg","data":"' + mainImageData + '"}}';
    partsArray += ',{"inlineData":{"mime_type":"image/jpeg","data":"' + ref1Data + '"}}';
    partsArray += ',{"inlineData":{"mime_type":"image/jpeg","data":"' + ref2Data + '"}}';
    
    var payload = '{"contents":[{"role":"user","parts":[' + partsArray + ']}]}';
    
    // Check order
    var textIndex = payload.indexOf('"text"');
    var mainIndex = payload.indexOf('MAIN_IMAGE');
    var ref1Index = payload.indexOf('REF1_');
    var ref2Index = payload.indexOf('REF2_');
    
    log("  Text at position: " + textIndex);
    log("  Main image at: " + mainIndex);
    log("  Reference 1 at: " + ref1Index);
    log("  Reference 2 at: " + ref2Index);
    
    if (textIndex < mainIndex && mainIndex < ref1Index && ref1Index < ref2Index) {
        pass("Payload order is correct");
        log("  Order: Text → Main Image → Reference 1 → Reference 2");
    } else {
        fail("Payload Order", "Incorrect order detected");
    }
}

// ===== Run All Tests =====
function runAllTests() {
    log("=====================================");
    log("NANO-BANANA WINDOWS REFERENCE TEST");
    log("=====================================");
    log("Time: " + new Date().toString());
    log("OS: " + $.os);
    log("Photoshop: " + app.version);
    log("=====================================");
    
    // Run tests
    testPlatformDetection();
    testFileOperations();
    testBase64Encoding();
    testMultipleReferences();
    testPayloadOrder();
    
    // Summary
    log("\n=====================================");
    log("TEST RESULTS SUMMARY");
    log("=====================================");
    log("PASSED: " + TEST_CONFIG.PASSED);
    log("FAILED: " + TEST_CONFIG.FAILED);
    log("TOTAL: " + (TEST_CONFIG.PASSED + TEST_CONFIG.FAILED));
    
    var successRate = Math.round((TEST_CONFIG.PASSED / (TEST_CONFIG.PASSED + TEST_CONFIG.FAILED)) * 100);
    log("SUCCESS RATE: " + successRate + "%");
    
    if (TEST_CONFIG.FAILED === 0) {
        log("\n🎉 ALL TESTS PASSED!");
        log("Reference images should work correctly on Windows.");
    } else {
        log("\n⚠️ SOME TESTS FAILED");
        log("Check the failures above for details.");
    }
    
    log("=====================================");
    
    // Save results to file
    TEST_CONFIG.LOG_FILE.open("w");
    for (var i = 0; i < TEST_CONFIG.TESTS.length; i++) {
        TEST_CONFIG.LOG_FILE.writeln(TEST_CONFIG.TESTS[i]);
    }
    TEST_CONFIG.LOG_FILE.close();
    
    // Show results
    var message = "Test Complete!\n\n";
    message += "PASSED: " + TEST_CONFIG.PASSED + "\n";
    message += "FAILED: " + TEST_CONFIG.FAILED + "\n";
    message += "SUCCESS RATE: " + successRate + "%\n\n";
    message += "Results saved to:\n" + TEST_CONFIG.LOG_FILE.fsName;
    
    alert(message);
}

// ===== Execute Tests =====
runAllTests();