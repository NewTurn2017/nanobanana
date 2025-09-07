/**
 * Nano Banana Watcher
 * - Shows a small banana button when a selection exists.
 * - Click to launch Nano-Banana-Gemini.jsx UI.
 *
 * Usage:
 * - File > Scripts > Script Events Manager...
 *   - Check "Enable Events to Run Scripts/Actions"
 *   - Add Event: "Start Application" -> this file (Nano-Banana-Watcher.jsx)
 *   - (Optional) Add Event: "Open Document" -> this file
 */

#target photoshop
#targetengine "nanobanana-watcher"
try { BridgeTalk.setPersistent(true); } catch(e) {}

(function(){
    // Singleton guard
    if (!$.global.NBWatcher) $.global.NBWatcher = {};
    var G = $.global.NBWatcher;

    // Close existing UI if any (refresh)
    try { if (G.ui && G.ui.visible) G.ui.close(); } catch(e) {}

    // Helpers
    function hasActiveSelection() {
        try { app.activeDocument.selection.bounds; return true; } catch (e) { return false; }
    }

    function launchMain() {
        try {
            var here = new File($.fileName).parent;
            var main = new File(here + "/Nano-Banana-Gemini.jsx");
            if (!main.exists) {
                alert("Nano-Banana-Gemini.jsx not found next to watcher.");
                return;
            }
            $.evalFile(main);
        } catch (e) {
            alert("Failed to launch Nano-Banana: " + e.message);
        }
    }

    // UI
    var win = new Window('palette', 'Nano Banana', undefined);
    win.orientation = 'column';
    win.alignChildren = 'fill';
    win.margins = 6;
    var btn = win.add('button', undefined, '🍌 Nano');
    btn.preferredSize.width = 40;
    btn.preferredSize.height = 40;
    btn.helpTip = 'Nano-Banana 실행 (선택 영역 필요)';
    btn.onClick = function(){ launchMain(); };

    // Initial placement (top-right-ish)
    try {
        win.location = [Math.max(50, Screen.mainWindow.bounds[2]-160), 100];
    } catch(e) {}

    G.ui = win;

    // Update logic (runs in persistent engine)
    $.global.NBWatcher.update = function() {
        try {
            if (!G.ui) return;
            var enabled = false;
            try { app.activeDocument; enabled = hasActiveSelection(); } catch (e) { enabled = false; }
            G.ui.children[0].enabled = enabled; // button
            G.ui.children[0].text = enabled ? '🍌 Nano' : '🍌 (선택 없음)';
            if (!G.ui.visible) G.ui.show();
        } catch (e1) {}
        // schedule next tick (ensure it executes in this engine)
        try {
            var code = '#target photoshop\n#targetengine "nanobanana-watcher"\ntry{ if($.global.NBWatcher && $.global.NBWatcher.update) $.global.NBWatcher.update(); }catch(e){}';
            app.scheduleTask(code, 800, false);
        } catch (e2) {}
    };

    // Kick off (non-blocking)
    try { win.show(); } catch(e) {}
    try {
        var code0 = '#target photoshop\n#targetengine "nanobanana-watcher"\ntry{ if($.global.NBWatcher && $.global.NBWatcher.update) $.global.NBWatcher.update(); }catch(e){}';
        app.scheduleTask(code0, 200, false);
    } catch (e0) {}
})();
