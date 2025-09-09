/**
 * Enhanced Windows Debugging for Nano-Banana
 * 
 * This file provides comprehensive debugging functions specifically for tracking
 * the Windows reference image processing issue.
 * 
 * Include this at the top of Nano-Banana-Gemini.jsx:
 * //@include "windows-debug-enhanced.jsx"
 */

// ===== Debug Configuration =====
var WIN_DEBUG = {
    ENABLED: $.os.indexOf("Windows") !== -1,
    LOG_FILE: null,
    SESSION_ID: new Date().getTime(),
    
    // Log levels
    INFO: "INFO",
    WARN: "WARN", 
    ERROR: "ERROR",
    SUCCESS: "SUCCESS",
    DATA: "DATA"
};

// ===== Initialize Debug Session =====
function initWindowsDebug() {
    if (!WIN_DEBUG.ENABLED) return;
    
    try {
        // Create main debug log
        WIN_DEBUG.LOG_FILE = new File(Folder.desktop + "/nano-banana-debug-" + WIN_DEBUG.SESSION_ID + ".log");
        WIN_DEBUG.LOG_FILE.open("w");
        WIN_DEBUG.LOG_FILE.writeln("=====================================");
        WIN_DEBUG.LOG_FILE.writeln("NANO-BANANA WINDOWS DEBUG SESSION");
        WIN_DEBUG.LOG_FILE.writeln("=====================================");
        WIN_DEBUG.LOG_FILE.writeln("Session ID: " + WIN_DEBUG.SESSION_ID);
        WIN_DEBUG.LOG_FILE.writeln("Start Time: " + new Date().toString());
        WIN_DEBUG.LOG_FILE.writeln("OS: " + $.os);
        WIN_DEBUG.LOG_FILE.writeln("Photoshop: " + app.version);
        WIN_DEBUG.LOG_FILE.writeln("Script: " + $.fileName);
        WIN_DEBUG.LOG_FILE.writeln("=====================================\n");
        WIN_DEBUG.LOG_FILE.close();
        
        // Create summary file
        var summaryFile = new File(Folder.desktop + "/nano-banana-summary.txt");
        summaryFile.open("w");
        summaryFile.writeln("NANO-BANANA DEBUG SUMMARY");
        summaryFile.writeln("Session: " + WIN_DEBUG.SESSION_ID);
        summaryFile.writeln("Check the detailed log: nano-banana-debug-" + WIN_DEBUG.SESSION_ID + ".log");
        summaryFile.writeln("\nQUICK STATUS:");
        summaryFile.close();
        
        return true;
    } catch(e) {
        alert("Debug initialization failed: " + e.message);
        return false;
    }
}

// ===== Log Function =====
function winDebugLog(message, level, data) {
    if (!WIN_DEBUG.ENABLED || !WIN_DEBUG.LOG_FILE) return;
    
    try {
        level = level || WIN_DEBUG.INFO;
        var timestamp = new Date().toTimeString().substr(0, 8);
        
        WIN_DEBUG.LOG_FILE.open("a");
        WIN_DEBUG.LOG_FILE.writeln("[" + timestamp + "] [" + level + "] " + message);
        
        if (data) {
            WIN_DEBUG.LOG_FILE.writeln("  DATA: " + data);
        }
        
        WIN_DEBUG.LOG_FILE.close();
    } catch(e) {
        // Silent fail
    }
}

// ===== Log Section Separator =====
function winDebugSection(title) {
    if (!WIN_DEBUG.ENABLED) return;
    
    winDebugLog("\n===== " + title + " =====", WIN_DEBUG.INFO);
}

// ===== Log File Information =====
function winDebugFile(file, label) {
    if (!WIN_DEBUG.ENABLED) return;
    
    label = label || "File";
    
    if (!file) {
        winDebugLog(label + ": NULL", WIN_DEBUG.ERROR);
        return;
    }
    
    winDebugLog(label + " Info:", WIN_DEBUG.INFO);
    winDebugLog("  Path: " + file.fsName, WIN_DEBUG.DATA);
    winDebugLog("  Name: " + file.name, WIN_DEBUG.DATA);
    winDebugLog("  Exists: " + file.exists, WIN_DEBUG.DATA);
    
    if (file.exists) {
        winDebugLog("  Size: " + file.length + " bytes", WIN_DEBUG.DATA);
        winDebugLog("  Created: " + file.created, WIN_DEBUG.DATA);
        winDebugLog("  Modified: " + file.modified, WIN_DEBUG.DATA);
    }
}

// ===== Log Base64 Encoding Process =====
function winDebugEncoding(file, result, duration) {
    if (!WIN_DEBUG.ENABLED) return;
    
    winDebugLog("Encoding Process:", WIN_DEBUG.INFO);
    winDebugLog("  Input File: " + (file ? file.fsName : "NULL"), WIN_DEBUG.DATA);
    winDebugLog("  Duration: " + (duration || "N/A") + "ms", WIN_DEBUG.DATA);
    
    if (result) {
        winDebugLog("  Result: SUCCESS", WIN_DEBUG.SUCCESS);
        winDebugLog("  Base64 Length: " + result.length + " chars", WIN_DEBUG.DATA);
        winDebugLog("  Sample (first 50): " + result.substring(0, 50), WIN_DEBUG.DATA);
    } else {
        winDebugLog("  Result: FAILED", WIN_DEBUG.ERROR);
    }
}

// ===== Log Payload Structure =====
function winDebugPayload(payload, referenceCount) {
    if (!WIN_DEBUG.ENABLED) return;
    
    winDebugSection("PAYLOAD ANALYSIS");
    
    winDebugLog("Payload Structure:", WIN_DEBUG.INFO);
    winDebugLog("  Total Length: " + payload.length + " chars", WIN_DEBUG.DATA);
    winDebugLog("  Reference Images: " + (referenceCount || 0), WIN_DEBUG.DATA);
    
    // Analyze structure
    var textParts = (payload.match(/"text":/g) || []).length;
    var imageParts = (payload.match(/"inlineData":/g) || []).length;
    
    winDebugLog("  Text Parts: " + textParts, WIN_DEBUG.DATA);
    winDebugLog("  Image Parts: " + imageParts, WIN_DEBUG.DATA);
    
    // Check order
    var textIndex = payload.indexOf('"text":');
    var firstImageIndex = payload.indexOf('"inlineData":');
    
    winDebugLog("  First Text at: " + textIndex, WIN_DEBUG.DATA);
    winDebugLog("  First Image at: " + firstImageIndex, WIN_DEBUG.DATA);
    
    if (textIndex < firstImageIndex) {
        winDebugLog("  Order: CORRECT (text before images)", WIN_DEBUG.SUCCESS);
    } else {
        winDebugLog("  Order: INCORRECT (images before text)", WIN_DEBUG.ERROR);
    }
    
    // Save full payload for inspection
    try {
        var payloadFile = new File(Folder.desktop + "/payload-debug-" + WIN_DEBUG.SESSION_ID + ".json");
        payloadFile.open("w");
        payloadFile.write(payload);
        payloadFile.close();
        winDebugLog("  Full payload saved to: " + payloadFile.fsName, WIN_DEBUG.INFO);
    } catch(e) {
        winDebugLog("  Failed to save payload: " + e.message, WIN_DEBUG.ERROR);
    }
}

// ===== Log API Response =====
function winDebugResponse(response, success) {
    if (!WIN_DEBUG.ENABLED) return;
    
    winDebugSection("API RESPONSE");
    
    if (response) {
        winDebugLog("Response Received: YES", WIN_DEBUG.SUCCESS);
        winDebugLog("  Length: " + response.length + " chars", WIN_DEBUG.DATA);
        winDebugLog("  Sample: " + response.substring(0, 100), WIN_DEBUG.DATA);
        
        if (response.indexOf("error") > -1) {
            winDebugLog("  Contains Error: YES", WIN_DEBUG.ERROR);
        }
    } else {
        winDebugLog("Response Received: NO", WIN_DEBUG.ERROR);
    }
}

// ===== Update Summary File =====
function winDebugUpdateSummary(key, value) {
    if (!WIN_DEBUG.ENABLED) return;
    
    try {
        var summaryFile = new File(Folder.desktop + "/nano-banana-summary.txt");
        
        // Read existing content
        var content = "";
        if (summaryFile.exists) {
            summaryFile.open("r");
            content = summaryFile.read();
            summaryFile.close();
        }
        
        // Update or append
        summaryFile.open("a");
        summaryFile.writeln(key + ": " + value);
        summaryFile.close();
    } catch(e) {
        // Silent fail
    }
}

// ===== Finalize Debug Session =====
function finalizeWindowsDebug(success) {
    if (!WIN_DEBUG.ENABLED) return;
    
    winDebugSection("SESSION END");
    winDebugLog("End Time: " + new Date().toString(), WIN_DEBUG.INFO);
    winDebugLog("Session Success: " + (success ? "YES" : "NO"), success ? WIN_DEBUG.SUCCESS : WIN_DEBUG.ERROR);
    
    // Update summary
    winDebugUpdateSummary("\nFINAL STATUS", success ? "SUCCESS" : "FAILED");
    winDebugUpdateSummary("End Time", new Date().toTimeString().substr(0, 8));
    winDebugUpdateSummary("Log File", "nano-banana-debug-" + WIN_DEBUG.SESSION_ID + ".log");
}

// ===== Test Function =====
function testWindowsDebug() {
    initWindowsDebug();
    
    winDebugSection("TEST RUN");
    winDebugLog("This is an info message", WIN_DEBUG.INFO);
    winDebugLog("This is a warning", WIN_DEBUG.WARN);
    winDebugLog("This is an error", WIN_DEBUG.ERROR);
    winDebugLog("This is a success", WIN_DEBUG.SUCCESS);
    winDebugLog("This has data", WIN_DEBUG.DATA, "Sample data value");
    
    var testFile = new File(Folder.temp + "/test.txt");
    winDebugFile(testFile, "Test File");
    
    winDebugUpdateSummary("Test Status", "PASSED");
    
    finalizeWindowsDebug(true);
    
    alert("Debug test complete!\nCheck desktop for:\n- nano-banana-debug-" + WIN_DEBUG.SESSION_ID + ".log\n- nano-banana-summary.txt");
}

// Uncomment to test
// testWindowsDebug();