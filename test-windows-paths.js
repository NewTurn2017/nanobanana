/**
 * Node.js Test Script for Windows Path Handling
 * Run this with node to test Windows-specific path issues
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

// Color output for better readability
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(colors[color] + message + colors.reset);
}

// ===== Configuration =====
const SIMULATE_WINDOWS = true; // Set to true to simulate Windows behavior
const isWindows = process.platform === 'win32' || SIMULATE_WINDOWS;

log('\n========================================', 'cyan');
log('   NANO-BANANA WINDOWS PATH TESTER', 'cyan');
log('========================================\n', 'cyan');

log(`Platform: ${process.platform}`, 'yellow');
log(`Simulating Windows: ${SIMULATE_WINDOWS}`, 'yellow');
log(`Testing as: ${isWindows ? 'Windows' : 'macOS/Linux'}\n`, 'yellow');

// ===== Test 1: Path Conversion =====
function testPathConversion() {
    log('\n=== TEST 1: Path Conversion ===', 'blue');
    
    const unixPath = '/var/folders/temp/test_file.jpg';
    const windowsPath = 'C:\\var\\folders\\temp\\test_file.jpg';
    
    log('Unix path: ' + unixPath);
    log('Windows path: ' + windowsPath);
    
    // Simulate ExtendScript fsName behavior
    if (isWindows) {
        // On Windows, fsName returns Windows-style paths
        const converted = unixPath.replace(/\//g, '\\');
        log('Converted (Unix -> Windows): ' + converted, 'green');
        
        // Test reverse conversion
        const reversed = windowsPath.replace(/\\/g, '/');
        log('Reversed (Windows -> Unix): ' + reversed, 'green');
    } else {
        log('No conversion needed on Unix systems', 'green');
    }
    
    // Test with @ reference (curl payload)
    const payloadPath = isWindows 
        ? 'C:\\temp\\payload.json'
        : '/tmp/payload.json';
    
    const atReference = '@"' + payloadPath + '"';
    log('\n@ reference format: ' + atReference);
    
    // Test path in curl command
    const curlArgs = `-d ${atReference}`;
    log('Curl args: ' + curlArgs);
    
    if (isWindows) {
        // Windows path replacement in curl args
        const processedArgs = curlArgs.replace(/@"([^"]+)"/g, (match, path) => {
            const windowsPath = path.replace(/\//g, '\\');
            log('Path in @ reference: ' + path + ' -> ' + windowsPath, 'yellow');
            return '@"' + windowsPath + '"';
        });
        log('Processed curl args: ' + processedArgs, 'green');
    }
}

// ===== Test 2: File Operations =====
async function testFileOperations() {
    log('\n=== TEST 2: File Operations ===', 'blue');
    
    const tempDir = os.tmpdir();
    const testFile = path.join(tempDir, 'nano_test_' + Date.now() + '.jpg');
    
    // Create test file
    fs.writeFileSync(testFile, 'TEST_IMAGE_DATA');
    log('Created test file: ' + testFile, 'green');
    
    // Test file copy (simulating ExtendScript's file.copy())
    const copyDest = path.join(tempDir, 'nano_copy_' + Date.now() + '.jpg');
    
    try {
        fs.copyFileSync(testFile, copyDest);
        log('File copy successful: ' + copyDest, 'green');
    } catch (err) {
        log('File copy failed: ' + err.message, 'red');
        
        // Simulate Windows fallback
        if (isWindows) {
            log('Attempting Windows copy command...', 'yellow');
            const srcPath = testFile.replace(/\//g, '\\');
            const dstPath = copyDest.replace(/\//g, '\\');
            const copyCmd = `copy /Y "${srcPath}" "${dstPath}"`;
            log('Command: ' + copyCmd);
        }
    }
    
    // Cleanup
    try {
        fs.unlinkSync(testFile);
        if (fs.existsSync(copyDest)) fs.unlinkSync(copyDest);
        log('Cleanup completed', 'green');
    } catch (err) {
        log('Cleanup error: ' + err.message, 'yellow');
    }
}

// ===== Test 3: Base64 Encoding =====
async function testBase64Encoding() {
    log('\n=== TEST 3: Base64 Encoding ===', 'blue');
    
    const tempDir = os.tmpdir();
    const imageFile = path.join(tempDir, 'test_image_' + Date.now() + '.jpg');
    
    // Create dummy image file
    fs.writeFileSync(imageFile, Buffer.from('FFD8FFE0', 'hex')); // JPEG header
    log('Created image file: ' + imageFile);
    
    if (isWindows) {
        log('\nWindows Base64 Process:', 'yellow');
        
        // Get file extension
        const ext = path.extname(imageFile);
        log('Extension: ' + ext);
        
        // Create temp copy path
        const tempCopy = path.join(tempDir, 'temp_encode_' + Date.now() + ext);
        log('Temp copy path: ' + tempCopy);
        
        // Simulate copy
        try {
            fs.copyFileSync(imageFile, tempCopy);
            log('Copy successful', 'green');
            
            // Simulate certutil command
            const outputFile = path.join(tempDir, 'base64_output.txt');
            const srcPath = tempCopy.replace(/\//g, '\\');
            const dstPath = outputFile.replace(/\//g, '\\');
            
            const certCmd = `certutil -encode "${srcPath}" "${dstPath}"`;
            log('Certutil command: ' + certCmd);
            
            // Cleanup
            fs.unlinkSync(tempCopy);
        } catch (err) {
            log('Error: ' + err.message, 'red');
        }
    } else {
        log('\nmacOS/Linux Base64 Process:', 'yellow');
        const base64Cmd = `base64 -i "${imageFile}"`;
        log('Base64 command: ' + base64Cmd);
    }
    
    // Cleanup
    try {
        fs.unlinkSync(imageFile);
    } catch (err) {}
}

// ===== Test 4: Multiple Reference Files =====
async function testMultipleReferences() {
    log('\n=== TEST 4: Multiple Reference Files ===', 'blue');
    
    const tempDir = os.tmpdir();
    const referenceFiles = [];
    
    // Create multiple reference files
    for (let i = 0; i < 3; i++) {
        const refFile = path.join(tempDir, `ref_image_${i}_${Date.now()}.jpg`);
        fs.writeFileSync(refFile, `REFERENCE_IMAGE_${i}`);
        referenceFiles.push(refFile);
        log(`Reference file ${i + 1}: ${refFile}`);
    }
    
    // Process each reference file
    for (let i = 0; i < referenceFiles.length; i++) {
        log(`\nProcessing reference ${i + 1}:`, 'yellow');
        const refFile = referenceFiles[i];
        
        if (isWindows) {
            // Windows processing
            const ext = path.extname(refFile);
            const tempCopy = path.join(tempDir, `temp_ref_${Date.now()}_${i}${ext}`);
            
            log('Original: ' + refFile);
            log('Will copy to: ' + tempCopy);
            
            try {
                fs.copyFileSync(refFile, tempCopy);
                log('Copy successful', 'green');
                
                // Simulate base64 encoding
                const base64Output = path.join(tempDir, `base64_ref_${i}.txt`);
                const srcPath = tempCopy.replace(/\//g, '\\');
                const dstPath = base64Output.replace(/\//g, '\\');
                
                const certCmd = `certutil -encode "${srcPath}" "${dstPath}"`;
                log('Certutil command: ' + certCmd);
                
                // Cleanup temp copy
                fs.unlinkSync(tempCopy);
            } catch (err) {
                log('Error: ' + err.message, 'red');
                
                // Fallback command
                const srcPath = refFile.replace(/\//g, '\\');
                const dstPath = tempCopy.replace(/\//g, '\\');
                const copyCmd = `copy /Y "${srcPath}" "${dstPath}"`;
                log('Fallback copy command: ' + copyCmd, 'yellow');
            }
        } else {
            log('macOS processing: base64 -i "' + refFile + '"');
        }
    }
    
    // Cleanup
    for (const file of referenceFiles) {
        try {
            fs.unlinkSync(file);
        } catch (err) {}
    }
    log('\nCleanup completed', 'green');
}

// ===== Test 5: Curl Payload with Multiple Images =====
async function testCurlPayload() {
    log('\n=== TEST 5: Curl Payload Construction ===', 'blue');
    
    const tempDir = os.tmpdir();
    const payloadFile = path.join(tempDir, 'payload_' + Date.now() + '.json');
    
    // Simulate payload with multiple base64 images
    const payload = {
        contents: [{
            role: "user",
            parts: [
                { text: "Generate an image" },
                { inlineData: { mime_type: "image/jpeg", data: "BASE64_REF_1" } },
                { inlineData: { mime_type: "image/jpeg", data: "BASE64_REF_2" } },
                { inlineData: { mime_type: "image/jpeg", data: "BASE64_MAIN" } }
            ]
        }]
    };
    
    fs.writeFileSync(payloadFile, JSON.stringify(payload, null, 2));
    log('Payload file created: ' + payloadFile);
    log('Payload size: ' + fs.statSync(payloadFile).size + ' bytes');
    
    if (isWindows) {
        // Windows curl command
        const windowsPath = payloadFile.replace(/\//g, '\\');
        const curlArgs = `-s -X POST -H "Content-Type: application/json" -d @"${windowsPath}" "https://api.example.com"`;
        log('\nWindows curl args:', 'yellow');
        log(curlArgs);
        
        // Full command
        const outputFile = path.join(tempDir, 'response.json');
        const outputPath = outputFile.replace(/\//g, '\\');
        const fullCmd = `cmd.exe /c "curl.exe ${curlArgs} > "${outputPath}" 2>&1"`;
        log('\nFull Windows command:', 'yellow');
        log(fullCmd);
    } else {
        const curlArgs = `-s -X POST -H "Content-Type: application/json" -d @"${payloadFile}" "https://api.example.com"`;
        log('\nmacOS/Linux curl args:', 'yellow');
        log(curlArgs);
    }
    
    // Cleanup
    fs.unlinkSync(payloadFile);
}

// ===== Run all tests =====
async function runAllTests() {
    try {
        testPathConversion();
        await testFileOperations();
        await testBase64Encoding();
        await testMultipleReferences();
        await testCurlPayload();
        
        log('\n========================================', 'cyan');
        log('   ALL TESTS COMPLETED SUCCESSFULLY', 'green');
        log('========================================\n', 'cyan');
        
        log('Key findings for Windows:', 'yellow');
        log('1. File paths must use backslashes in Windows commands');
        log('2. @ references in curl need proper escaping');
        log('3. File.copy() may fail - need system fallback');
        log('4. Certutil requires proper quote handling');
        log('5. Multiple reference files need individual processing');
        
    } catch (err) {
        log('\nTest failed: ' + err.message, 'red');
        console.error(err);
    }
}

// Execute tests
runAllTests();