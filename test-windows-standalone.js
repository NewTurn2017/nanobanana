/**
 * Standalone Windows Test for Nano-Banana Image Processing
 * Run this in Parallels Windows without Photoshop
 * 
 * Requirements:
 * - Node.js installed in Windows
 * - Run in Windows Command Prompt or PowerShell
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync, exec } = require('child_process');

// ===== Color output =====
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
    console.log(colors[color] + message + colors.reset);
}

// ===== Configuration =====
const IS_WINDOWS = process.platform === 'win32';
const TEMP_DIR = os.tmpdir();

log('\n========================================', 'cyan');
log('   NANO-BANANA WINDOWS STANDALONE TEST', 'cyan');
log('========================================\n', 'cyan');

log(`Platform: ${process.platform}`, 'yellow');
log(`Temp Directory: ${TEMP_DIR}`, 'yellow');
log(`Node Version: ${process.version}`, 'yellow');
log(`Is Windows: ${IS_WINDOWS}\n`, 'yellow');

// ===== Helper Functions =====

/**
 * Create a dummy JPEG file with proper header
 */
function createDummyJPEG(filePath) {
    // JPEG magic bytes: FF D8 FF E0
    const jpegHeader = Buffer.from([
        0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46,
        0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01,
        0x00, 0x01, 0x00, 0x00
    ]);
    
    // Add some dummy data
    const dummyData = Buffer.alloc(1024, 0xFF);
    const jpegData = Buffer.concat([jpegHeader, dummyData]);
    
    fs.writeFileSync(filePath, jpegData);
    return filePath;
}

/**
 * Execute command and return output
 */
function executeCommand(command, silent = false) {
    try {
        if (!silent) log(`Executing: ${command}`, 'cyan');
        const output = execSync(command, { encoding: 'utf8', shell: true });
        return { success: true, output: output.trim() };
    } catch (error) {
        return { success: false, error: error.message, stderr: error.stderr };
    }
}

// ===== Test 1: Windows Path Handling =====
function testWindowsPaths() {
    log('\n=== TEST 1: Windows Path Handling ===', 'blue');
    
    // Test various path formats
    const testPaths = [
        'C:/Users/Test/image.jpg',
        'C:\\Users\\Test\\image.jpg',
        '/c/Users/Test/image.jpg',
        TEMP_DIR + '/test.jpg',
        path.join(TEMP_DIR, 'test.jpg')
    ];
    
    log('Testing path conversions:', 'yellow');
    testPaths.forEach(testPath => {
        const normalized = path.normalize(testPath);
        const windowsPath = normalized.replace(/\//g, '\\');
        const posixPath = normalized.replace(/\\/g, '/');
        
        log(`Original: ${testPath}`);
        log(`  → Normalized: ${normalized}`, 'green');
        log(`  → Windows: ${windowsPath}`, 'green');
        log(`  → Posix: ${posixPath}`, 'green');
    });
    
    // Test @ reference for curl
    const payloadPath = path.join(TEMP_DIR, 'payload.json');
    const atReference = `@"${payloadPath}"`;
    const windowsAtReference = `@"${payloadPath.replace(/\//g, '\\')}"`;
    
    log('\nCurl @ reference format:', 'yellow');
    log(`  Standard: ${atReference}`);
    log(`  Windows: ${windowsAtReference}`, 'green');
}

// ===== Test 2: File Copy Operations =====
function testFileCopyOperations() {
    log('\n=== TEST 2: File Copy Operations ===', 'blue');
    
    const sourceFile = path.join(TEMP_DIR, 'source_' + Date.now() + '.jpg');
    const destFile = path.join(TEMP_DIR, 'dest_' + Date.now() + '.jpg');
    
    // Create source file
    createDummyJPEG(sourceFile);
    log(`Created source file: ${sourceFile}`, 'green');
    log(`File size: ${fs.statSync(sourceFile).size} bytes`);
    
    // Test 1: Node.js fs.copyFileSync
    try {
        fs.copyFileSync(sourceFile, destFile);
        log('✓ fs.copyFileSync successful', 'green');
        fs.unlinkSync(destFile);
    } catch (err) {
        log('✗ fs.copyFileSync failed: ' + err.message, 'red');
    }
    
    // Test 2: Windows copy command
    if (IS_WINDOWS) {
        const srcPath = sourceFile.replace(/\//g, '\\');
        const dstPath = destFile.replace(/\//g, '\\');
        const copyCmd = `copy /Y "${srcPath}" "${dstPath}"`;
        
        const result = executeCommand(copyCmd);
        if (result.success) {
            log('✓ Windows copy command successful', 'green');
            if (fs.existsSync(destFile)) {
                fs.unlinkSync(destFile);
            }
        } else {
            log('✗ Windows copy command failed: ' + result.error, 'red');
        }
        
        // Test 3: xcopy command
        const xcopyCmd = `xcopy "${srcPath}" "${dstPath}" /Y`;
        const xcopyResult = executeCommand(xcopyCmd);
        if (xcopyResult.success) {
            log('✓ Windows xcopy command successful', 'green');
        } else {
            log('✗ Windows xcopy command failed', 'red');
        }
    }
    
    // Cleanup
    if (fs.existsSync(sourceFile)) fs.unlinkSync(sourceFile);
    if (fs.existsSync(destFile)) fs.unlinkSync(destFile);
}

// ===== Test 3: Base64 Encoding =====
function testBase64Encoding() {
    log('\n=== TEST 3: Base64 Encoding (certutil) ===', 'blue');
    
    if (!IS_WINDOWS) {
        log('Skipping certutil test on non-Windows platform', 'yellow');
        return;
    }
    
    const imageFile = path.join(TEMP_DIR, 'test_image_' + Date.now() + '.jpg');
    const base64File = path.join(TEMP_DIR, 'base64_' + Date.now() + '.txt');
    
    // Create test image
    createDummyJPEG(imageFile);
    log(`Created test image: ${imageFile}`, 'green');
    
    // Test different certutil command formats
    const tests = [
        {
            name: 'Standard format',
            cmd: `certutil -encode "${imageFile}" "${base64File}"`
        },
        {
            name: 'With backslashes',
            cmd: `certutil -encode "${imageFile.replace(/\//g, '\\')}" "${base64File.replace(/\//g, '\\')}"`
        },
        {
            name: 'With -f flag',
            cmd: `certutil -f -encode "${imageFile}" "${base64File}"`
        }
    ];
    
    for (const test of tests) {
        log(`\nTesting: ${test.name}`, 'yellow');
        const result = executeCommand(test.cmd);
        
        if (result.success && fs.existsSync(base64File)) {
            log('✓ Encoding successful', 'green');
            
            // Read and validate base64
            const base64Content = fs.readFileSync(base64File, 'utf8');
            const lines = base64Content.split('\n');
            
            // Check for certutil headers
            const hasBeginHeader = base64Content.includes('-----BEGIN CERTIFICATE-----');
            const hasEndHeader = base64Content.includes('-----END CERTIFICATE-----');
            
            log(`  Base64 file size: ${fs.statSync(base64File).size} bytes`);
            log(`  Has BEGIN header: ${hasBeginHeader}`);
            log(`  Has END header: ${hasEndHeader}`);
            
            // Clean base64 (remove headers)
            const cleanBase64 = base64Content
                .replace(/-----BEGIN CERTIFICATE-----/g, '')
                .replace(/-----END CERTIFICATE-----/g, '')
                .replace(/[\r\n\s]/g, '');
            
            log(`  Clean base64 length: ${cleanBase64.length} chars`);
            
            // Test decode
            const decodedFile = path.join(TEMP_DIR, 'decoded_' + Date.now() + '.jpg');
            const decodeCmd = `certutil -decode "${base64File}" "${decodedFile}"`;
            const decodeResult = executeCommand(decodeCmd, true);
            
            if (decodeResult.success && fs.existsSync(decodedFile)) {
                log('✓ Decoding successful', 'green');
                log(`  Decoded file size: ${fs.statSync(decodedFile).size} bytes`);
                fs.unlinkSync(decodedFile);
            } else {
                log('✗ Decoding failed', 'red');
            }
            
            fs.unlinkSync(base64File);
        } else {
            log('✗ Encoding failed: ' + (result.error || 'Unknown error'), 'red');
        }
    }
    
    // Cleanup
    if (fs.existsSync(imageFile)) fs.unlinkSync(imageFile);
}

// ===== Test 4: Multiple Reference Images =====
function testMultipleReferenceImages() {
    log('\n=== TEST 4: Multiple Reference Images Processing ===', 'blue');
    
    const referenceFiles = [];
    const base64Results = [];
    
    // Create 3 reference images
    for (let i = 0; i < 3; i++) {
        const refFile = path.join(TEMP_DIR, `ref_${i}_${Date.now()}.jpg`);
        createDummyJPEG(refFile);
        referenceFiles.push(refFile);
        log(`Created reference ${i + 1}: ${path.basename(refFile)}`, 'green');
    }
    
    // Process each reference image
    for (let i = 0; i < referenceFiles.length; i++) {
        log(`\nProcessing reference image ${i + 1}:`, 'yellow');
        const refFile = referenceFiles[i];
        
        // Step 1: Check file exists
        if (!fs.existsSync(refFile)) {
            log('✗ File does not exist!', 'red');
            continue;
        }
        log(`✓ File exists: ${fs.statSync(refFile).size} bytes`);
        
        // Step 2: Create temp copy (simulate ExtendScript behavior)
        const ext = path.extname(refFile);
        const tempCopy = path.join(TEMP_DIR, `temp_ref_${Date.now()}_${i}${ext}`);
        
        try {
            fs.copyFileSync(refFile, tempCopy);
            log(`✓ Temp copy created: ${path.basename(tempCopy)}`, 'green');
            
            // Step 3: Base64 encode
            if (IS_WINDOWS) {
                const base64Output = path.join(TEMP_DIR, `base64_ref_${i}_${Date.now()}.txt`);
                const srcPath = tempCopy.replace(/\//g, '\\');
                const dstPath = base64Output.replace(/\//g, '\\');
                
                const certCmd = `certutil -encode "${srcPath}" "${dstPath}"`;
                const result = executeCommand(certCmd, true);
                
                if (result.success && fs.existsSync(base64Output)) {
                    const base64Content = fs.readFileSync(base64Output, 'utf8');
                    const cleanBase64 = base64Content
                        .replace(/-----BEGIN CERTIFICATE-----/g, '')
                        .replace(/-----END CERTIFICATE-----/g, '')
                        .replace(/[\r\n\s]/g, '');
                    
                    base64Results.push({
                        index: i,
                        file: refFile,
                        base64: cleanBase64.substring(0, 50) + '...',
                        length: cleanBase64.length
                    });
                    
                    log(`✓ Base64 encoded: ${cleanBase64.length} chars`, 'green');
                    fs.unlinkSync(base64Output);
                } else {
                    log('✗ Base64 encoding failed', 'red');
                }
            } else {
                // Non-Windows simulation
                base64Results.push({
                    index: i,
                    file: refFile,
                    base64: 'SIMULATED_BASE64_' + i,
                    length: 1000
                });
                log('✓ Base64 encoding simulated', 'yellow');
            }
            
            // Cleanup temp copy
            fs.unlinkSync(tempCopy);
            
        } catch (err) {
            log(`✗ Error processing: ${err.message}`, 'red');
            
            // Fallback method
            if (IS_WINDOWS) {
                log('Attempting fallback copy method...', 'yellow');
                const srcPath = refFile.replace(/\//g, '\\');
                const dstPath = tempCopy.replace(/\//g, '\\');
                const copyCmd = `copy /Y "${srcPath}" "${dstPath}"`;
                executeCommand(copyCmd);
            }
        }
    }
    
    // Summary
    log('\n--- Processing Summary ---', 'magenta');
    log(`Total references: ${referenceFiles.length}`);
    log(`Successfully encoded: ${base64Results.length}`);
    base64Results.forEach(result => {
        log(`  Reference ${result.index + 1}: ${result.length} chars`);
    });
    
    // Cleanup
    referenceFiles.forEach(file => {
        if (fs.existsSync(file)) fs.unlinkSync(file);
    });
}

// ===== Test 5: Curl Command Construction =====
function testCurlCommand() {
    log('\n=== TEST 5: Curl Command with Payload ===', 'blue');
    
    // Create payload with multiple images
    const payloadFile = path.join(TEMP_DIR, 'payload_' + Date.now() + '.json');
    
    const payload = {
        contents: [{
            role: "user",
            parts: [
                { text: "Generate an image based on these references" },
                { inlineData: { mime_type: "image/jpeg", data: "BASE64_REF_IMAGE_1" } },
                { inlineData: { mime_type: "image/jpeg", data: "BASE64_REF_IMAGE_2" } },
                { inlineData: { mime_type: "image/jpeg", data: "BASE64_MAIN_IMAGE" } }
            ]
        }],
        generationConfig: {
            responseModalities: ["IMAGE"],
            temperature: 1.0,
            topP: 0.95,
            topK: 40
        }
    };
    
    fs.writeFileSync(payloadFile, JSON.stringify(payload, null, 2));
    log(`Created payload file: ${path.basename(payloadFile)}`, 'green');
    log(`Payload size: ${fs.statSync(payloadFile).size} bytes`);
    
    // Test curl command construction
    if (IS_WINDOWS) {
        // Windows path handling
        const windowsPayload = payloadFile.replace(/\//g, '\\');
        
        // Different @ reference formats
        const tests = [
            {
                name: 'Standard @ reference',
                cmd: `curl.exe -s -X POST -H "Content-Type: application/json" -d @"${payloadFile}" "https://api.example.com"`
            },
            {
                name: 'Windows path @ reference',
                cmd: `curl.exe -s -X POST -H "Content-Type: application/json" -d @"${windowsPayload}" "https://api.example.com"`
            },
            {
                name: 'CMD wrapped',
                cmd: `cmd.exe /c "curl.exe -s -X POST -H \\"Content-Type: application/json\\" -d @\\"${windowsPayload}\\" \\"https://api.example.com\\""`
            }
        ];
        
        tests.forEach(test => {
            log(`\n${test.name}:`, 'yellow');
            log(`  Command: ${test.cmd}`, 'cyan');
            
            // Validate command syntax
            const hasValidAtRef = test.cmd.includes('@"') || test.cmd.includes('@\\"');
            const hasValidPath = test.cmd.includes(TEMP_DIR) || test.cmd.includes(TEMP_DIR.replace(/\//g, '\\'));
            
            log(`  ✓ Has @ reference: ${hasValidAtRef}`, hasValidAtRef ? 'green' : 'red');
            log(`  ✓ Has valid path: ${hasValidPath}`, hasValidPath ? 'green' : 'red');
        });
        
        // Test actual curl availability
        log('\nChecking curl availability:', 'yellow');
        const curlCheck = executeCommand('curl.exe --version', true);
        if (curlCheck.success) {
            const version = curlCheck.output.split('\n')[0];
            log(`✓ Curl is available: ${version}`, 'green');
        } else {
            log('✗ Curl not found or not accessible', 'red');
            log('  Make sure curl.exe is installed (Windows 10 1803+)', 'yellow');
        }
    }
    
    // Cleanup
    fs.unlinkSync(payloadFile);
}

// ===== Test 6: Complete Workflow Simulation =====
function testCompleteWorkflow() {
    log('\n=== TEST 6: Complete Workflow Simulation ===', 'blue');
    
    // Step 1: Create main image and references
    const mainImage = path.join(TEMP_DIR, 'main_' + Date.now() + '.jpg');
    const ref1 = path.join(TEMP_DIR, 'ref1_' + Date.now() + '.jpg');
    const ref2 = path.join(TEMP_DIR, 'ref2_' + Date.now() + '.jpg');
    
    createDummyJPEG(mainImage);
    createDummyJPEG(ref1);
    createDummyJPEG(ref2);
    
    log('Created test images:', 'green');
    log(`  Main: ${path.basename(mainImage)}`);
    log(`  Ref1: ${path.basename(ref1)}`);
    log(`  Ref2: ${path.basename(ref2)}`);
    
    const base64Data = {};
    
    // Step 2: Encode all images
    const images = [
        { name: 'main', file: mainImage },
        { name: 'ref1', file: ref1 },
        { name: 'ref2', file: ref2 }
    ];
    
    images.forEach(img => {
        log(`\nEncoding ${img.name}:`, 'yellow');
        
        if (IS_WINDOWS) {
            const base64File = path.join(TEMP_DIR, `base64_${img.name}_${Date.now()}.txt`);
            const srcPath = img.file.replace(/\//g, '\\');
            const dstPath = base64File.replace(/\//g, '\\');
            
            const result = executeCommand(`certutil -encode "${srcPath}" "${dstPath}"`, true);
            
            if (result.success && fs.existsSync(base64File)) {
                const content = fs.readFileSync(base64File, 'utf8');
                base64Data[img.name] = content
                    .replace(/-----BEGIN CERTIFICATE-----/g, '')
                    .replace(/-----END CERTIFICATE-----/g, '')
                    .replace(/[\r\n\s]/g, '')
                    .substring(0, 100); // Just store first 100 chars for testing
                
                log(`  ✓ Encoded: ${base64Data[img.name].length} chars`, 'green');
                fs.unlinkSync(base64File);
            } else {
                log(`  ✗ Encoding failed`, 'red');
                base64Data[img.name] = 'FAILED';
            }
        } else {
            base64Data[img.name] = `SIMULATED_${img.name.toUpperCase()}_BASE64`;
            log(`  ✓ Simulated encoding`, 'yellow');
        }
    });
    
    // Step 3: Create payload
    const payloadFile = path.join(TEMP_DIR, 'final_payload_' + Date.now() + '.json');
    const payload = {
        contents: [{
            role: "user",
            parts: [
                { text: "Generate an image" },
                { inlineData: { mime_type: "image/jpeg", data: base64Data.ref1 } },
                { inlineData: { mime_type: "image/jpeg", data: base64Data.ref2 } },
                { inlineData: { mime_type: "image/jpeg", data: base64Data.main } }
            ]
        }]
    };
    
    fs.writeFileSync(payloadFile, JSON.stringify(payload, null, 2));
    log(`\nCreated final payload: ${fs.statSync(payloadFile).size} bytes`, 'green');
    
    // Step 4: Construct final curl command
    if (IS_WINDOWS) {
        const windowsPayload = payloadFile.replace(/\//g, '\\');
        const responseFile = path.join(TEMP_DIR, 'response.json').replace(/\//g, '\\');
        
        const curlCmd = `cmd.exe /c "curl.exe -s -X POST -H \\"Content-Type: application/json\\" -d @\\"${windowsPayload}\\" \\"https://api.example.com\\" > \\"${responseFile}\\" 2>&1"`;
        
        log('\nFinal curl command:', 'cyan');
        log(curlCmd);
        
        // Verify command structure
        log('\nCommand validation:', 'yellow');
        log(`  ✓ Payload file exists: ${fs.existsSync(payloadFile)}`, 'green');
        log(`  ✓ Has proper @ reference: ${curlCmd.includes('@\\"')}`, 'green');
        log(`  ✓ Windows paths used: ${curlCmd.includes('\\\\')}`, 'green');
    }
    
    // Cleanup
    [mainImage, ref1, ref2, payloadFile].forEach(file => {
        if (fs.existsSync(file)) fs.unlinkSync(file);
    });
    
    log('\n✓ Workflow simulation complete', 'green');
}

// ===== Main Test Runner =====
async function runAllTests() {
    try {
        // Check if running on Windows
        if (!IS_WINDOWS) {
            log('\n⚠️  WARNING: Not running on Windows!', 'yellow');
            log('Some tests will be simulated only.', 'yellow');
            log('Run this script in Parallels Windows for actual testing.\n', 'yellow');
        }
        
        // Run all tests
        testWindowsPaths();
        testFileCopyOperations();
        testBase64Encoding();
        testMultipleReferenceImages();
        testCurlCommand();
        testCompleteWorkflow();
        
        // Summary
        log('\n========================================', 'cyan');
        log('   ALL TESTS COMPLETED', 'green');
        log('========================================\n', 'cyan');
        
        if (IS_WINDOWS) {
            log('Key findings:', 'yellow');
            log('1. Check if certutil properly encodes all reference images');
            log('2. Verify @ reference paths in curl commands');
            log('3. Ensure file.copy() fallback works');
            log('4. Validate proper quote escaping in cmd.exe');
        } else {
            log('Please run this script in Windows for actual testing:', 'yellow');
            log('1. Copy this file to Windows (Parallels)');
            log('2. Install Node.js in Windows');
            log('3. Run: node test-windows-standalone.js');
        }
        
    } catch (error) {
        log('\n✗ Test failed with error:', 'red');
        console.error(error);
    }
}

// Run tests
runAllTests();