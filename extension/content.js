// Listen for "START_SNIP" from popup/background
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === "START_SNIP") {
        startSnip();
    } else if (msg.type === "SCAN_RESULT") {
        showResults(msg.data);
    } else if (msg.type === "SCAN_ERROR") {
        hideLoading();
        alert("ProofPulse Error: " + msg.error);
    }
});

let overlay;
let selection;
let startX, startY;
let isDragging = false;

function startSnip() {
    if (document.getElementById("proofpulse-overlay")) return;

    overlay = document.createElement("div");
    overlay.id = "proofpulse-overlay";

    selection = document.createElement("div");
    selection.id = "proofpulse-selection";
    selection.style.display = "none";
    overlay.appendChild(selection);

    document.body.appendChild(overlay);

    overlay.addEventListener("mousedown", onMouseDown);
    overlay.addEventListener("mousemove", onMouseMove);
    overlay.addEventListener("mouseup", onMouseUp);
}

function onMouseDown(e) {
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;

    selection.style.left = startX + "px";
    selection.style.top = startY + "px";
    selection.style.width = "0px";
    selection.style.height = "0px";
    selection.style.display = "block";
}

function onMouseMove(e) {
    if (!isDragging) return;

    const currentX = e.clientX;
    const currentY = e.clientY;

    const width = Math.abs(currentX - startX);
    const height = Math.abs(currentY - startY);
    const left = Math.min(currentX, startX);
    const top = Math.min(currentY, startY);

    selection.style.width = width + "px";
    selection.style.height = height + "px";
    selection.style.left = left + "px";
    selection.style.top = top + "px";
}

function onMouseUp(e) {
    isDragging = false;

    // confirm capture
    const rect = selection.getBoundingClientRect();

    // Cleanup
    document.body.removeChild(overlay);
    overlay = null;
    selection = null;

    if (rect.width < 5 || rect.height < 5) {
        console.log("Selection too small, ignoring");
        return;
    }

    // Send coordinates to background to capture and crop
    showLoading(); // <--- Show loading immediately

    chrome.runtime.sendMessage({
        type: "PROCESS_CROP",
        area: {
            x: rect.x + window.scrollX,
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height,
            devicePixelRatio: window.devicePixelRatio
        },
        pageUrl: window.location.href
    });
}

function showLoading() {
    if (document.getElementById("proofpulse-loading")) return;

    const div = document.createElement("div");
    div.id = "proofpulse-loading";
    div.innerHTML = `
        <div class="pp-spinner"></div>
        <div class="pp-loading-text">Analyzing...</div>
    `;
    document.body.appendChild(div);
}

function hideLoading() {
    const el = document.getElementById("proofpulse-loading");
    if (el) el.remove();
}

function showResults(data) {
    hideLoading(); // Ensure loading is gone
    const div = document.createElement("div");

    div.id = "proofpulse-results";

    // Determine theme based on score/label
    let themeClass = "pp-theme-suspicious";
    if (data.score < 50 && data.label === "Likely Safe") themeClass = "pp-theme-safe";
    if (data.score >= 80 || data.label === "Likely Scam") themeClass = "pp-theme-scam";

    // Icons (svg path strings)
    const shieldIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`;

    div.innerHTML = `
        <div class="pp-header ${themeClass}">
            <div class="pp-title">${shieldIcon} ProofPulse</div>
            <button class="pp-close-btn">&times;</button>
        </div>
        
        <div class="pp-content ${themeClass}">
            <!-- Score Card -->
            <div class="pp-card pp-score-container">
                <div>
                    <div class="pp-verdict-label">Verdict</div>
                    <div class="pp-verdict-value">${data.label}</div>
                </div>
                <div class="pp-score-circle">
                    ${data.score}
                </div>
            </div>
            
            <!-- Summary -->
            <div class="pp-summary">
                ${data.summary || "Analysis complete."}
            </div>
            
            <!-- Reasons -->
            <div class="pp-card">
                <span class="pp-section-title">Risk Factors</span>
                <ul class="pp-list danger">
                    ${(data.reasons || []).map(r => `<li>${r}</li>`).join("")}
                </ul>
            </div>
            
            <!-- Actions -->
            <div class="pp-card">
                 <span class="pp-section-title">Recommended Actions</span>
                 <ul class="pp-list success">
                    ${(data.recommended_actions || []).map(a => `<li>${a}</li>`).join("")}
                 </ul>
            </div>
            
            <div class="pp-disclaimer">
                This assessment is provided for recommendation and educational purposes only. It does not constitute legal proof, legal advice, or a definitive determination of fraud.
            </div>
        </div>
    `;

    document.body.appendChild(div);

    div.querySelector(".pp-close-btn").addEventListener("click", () => {
        document.body.removeChild(div);
    });
}
