// Saathi Layer v2 — Embeddable Web Accessibility SDK
(function () {
  function initSaathiSDK() {
    // Inject SVG Filters
    const svgWrap = document.createElement("div");
    svgWrap.style.cssText = "height:0;width:0;position:absolute;overflow:hidden;";
    svgWrap.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="saathi-protanopia"><feColorMatrix type="matrix" values="0.567,0.433,0,0,0 0.558,0.442,0,0,0 0,0.242,0.758,0,0 0,0,0,1,0"/></filter>
          <filter id="saathi-deuteranopia"><feColorMatrix type="matrix" values="0.625,0.375,0,0,0 0.7,0.3,0,0,0 0,0.3,0.7,0,0 0,0,0,1,0"/></filter>
          <filter id="saathi-tritanopia"><feColorMatrix type="matrix" values="0.95,0.05,0,0,0 0,0.433,0.567,0,0 0,0.475,0.525,0,0 0,0,0,1,0"/></filter>
        </defs>
      </svg>`;
    document.body.appendChild(svgWrap);

    const fab = document.createElement("button");
    fab.className = "saathi-widget-fab";
    fab.innerHTML = "♿ Saathi Access";

    const panel = document.createElement("div");
    panel.className = "saathi-widget-panel";
    panel.innerHTML = `
      <h4>🛡️ Saathi Accessibility SDK</h4>
      <div class="saathi-sdk-meter" id="saathi-sdk-meter">Analyzing complexity...</div>
      <button class="saathi-sdk-btn" id="sdk-epilepsy">⚡ Epilepsy Safe Mode (Freeze Flash)</button>
      <button class="saathi-sdk-btn" id="sdk-colorblind">👁️ Colorblind Symbols & Links</button>
      <select class="saathi-sdk-select" id="sdk-filter">
        <option value="none">🎨 Filter: Standard Vision</option>
        <option value="protanopia">🔴 Protanopia (Red-Weak)</option>
        <option value="deuteranopia">🟢 Deuteranopia (Green-Weak)</option>
        <option value="tritanopia">🔵 Tritanopia (Blue-Weak)</option>
        <option value="high-contrast">🌗 High Contrast</option>
      </select>
      <button class="saathi-sdk-btn" id="sdk-simplify">🧹 Simplify Cluttered Layout</button>
      <button class="saathi-sdk-btn" id="sdk-translate">🌐 Translate Selected / Page</button>
      <button class="saathi-sdk-btn" id="sdk-voice">🎤 Voice Control ("scroll", "epilepsy")</button>
      <div id="sdk-voice-status" style="font-size:11px;color:#94a3b8;margin-top:4px;"></div>
    `;

    document.body.appendChild(fab);
    document.body.appendChild(panel);

    function updateComplexity() {
      const nodes = document.querySelectorAll("*").length;
      const anims = document.getAnimations ? document.getAnimations().length : 0;
      const level = (nodes > 1200 || anims > 5) ? "High Risk" : (nodes > 500 || anims > 2) ? "Medium" : "Low";
      document.getElementById("saathi-sdk-meter").innerHTML =
        `<strong>Complexity:</strong> ${level} (${nodes} nodes, ${anims} active anims)`;
    }

    fab.addEventListener("click", () => {
      panel.classList.toggle("open");
      updateComplexity();
    });

    document.getElementById("sdk-epilepsy").addEventListener("click", function () {
      document.body.classList.toggle("saathi-epilepsy-safe");
      this.classList.toggle("active");
      updateComplexity();
    });

    document.getElementById("sdk-colorblind").addEventListener("click", function () {
      document.body.classList.toggle("saathi-colorblind-symbols");
      this.classList.toggle("active");
    });

    document.getElementById("sdk-filter").addEventListener("change", function () {
      document.documentElement.setAttribute("data-saathi-filter", this.value);
    });

    document.getElementById("sdk-simplify").addEventListener("click", function () {
      document.body.classList.toggle("saathi-simplify-mode");
      this.classList.toggle("active");
    });

    document.getElementById("sdk-translate").addEventListener("click", function () {
      const sel = window.getSelection().toString().trim();
      const url = sel
        ? `https://translate.google.com/?sl=auto&tl=en&text=${encodeURIComponent(sel)}&op=translate`
        : `https://translate.google.com/translate?sl=auto&tl=en&u=${encodeURIComponent(window.location.href)}`;
      window.open(url, "_blank");
    });

    let rec = null;
    document.getElementById("sdk-voice").addEventListener("click", function () {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      const status = document.getElementById("sdk-voice-status");
      if (!SR) {
        status.textContent = "Speech recognition unsupported in this browser.";
        return;
      }
      if (rec) {
        rec.stop();
        rec = null;
        this.classList.remove("active");
        status.textContent = "";
        return;
      }
      rec = new SR();
      rec.continuous = true;
      rec.lang = "en-US";
      this.classList.add("active");
      status.textContent = "Listening... Say 'epilepsy', 'colorblind', 'simplify', 'scroll down'";
      rec.onresult = (e) => {
        const cmd = e.results[e.results.length - 1][0].transcript.trim().toLowerCase();
        status.textContent = `Heard: "${cmd}"`;
        if (cmd.includes("epilepsy")) document.getElementById("sdk-epilepsy").click();
        else if (cmd.includes("color")) document.getElementById("sdk-colorblind").click();
        else if (cmd.includes("simplify")) document.getElementById("sdk-simplify").click();
        else if (cmd.includes("down")) window.scrollBy({ top: 400, behavior: "smooth" });
        else if (cmd.includes("up")) window.scrollBy({ top: -400, behavior: "smooth" });
      };
      rec.start();
    });

    setTimeout(updateComplexity, 500);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSaathiSDK);
  } else {
    initSaathiSDK();
  }
})();
