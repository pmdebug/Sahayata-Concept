async function executeInTab(func, args = []) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.id) return null;
  try {
    const res = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: func,
      args: args
    });
    return res && res[0] ? res[0].result : null;
  } catch (err) {
    console.warn("Script injection restricted on this page:", err);
    return null;
  }
}

// Analyze current page complexity and compare with initial baseline
async function analyzeComplexity(showDiff = false) {
  const data = await executeInTab(() => {
    const allElements = Array.from(document.querySelectorAll("*"));
    const visibleNodes = allElements.filter(el => {
      const style = window.getComputedStyle(el);
      return style.display !== "none" && style.visibility !== "hidden";
    }).length;

    const isEpilepsySafe = document.body.classList.contains("saathi-epilepsy-safe");
    const isSimplified = document.body.classList.contains("saathi-simplify-mode");
    const isColorblind = document.body.classList.contains("saathi-colorblind-symbols");
    const filterMode = document.documentElement.getAttribute("data-saathi-filter") || "none";
    const voiceActive = !!window.__saathiVoiceActive;

    const rawAnims = document.getAnimations ? document.getAnimations().length : 0;
    const activeAnims = isEpilepsySafe ? 0 : rawAnims;

    const clutterSelectors = "aside, iframe, video, marquee, blink, .ads, .ad-banner, .sidebar, footer";
    const visibleClutter = Array.from(document.querySelectorAll(clutterSelectors)).filter(el => {
      const style = window.getComputedStyle(el);
      return style.display !== "none" && style.visibility !== "hidden";
    }).length;

    let score = Math.min(100, Math.round((visibleNodes / 25) + (activeAnims * 5) + (visibleClutter * 4)));
    let level = "Low";
    if (score >= 70 || activeAnims > 10) level = "High";
    else if (score >= 40) level = "Medium";

    const current = {
      visibleNodes,
      rawAnims,
      activeAnims,
      visibleClutter,
      score,
      level,
      isEpilepsySafe,
      isSimplified,
      isColorblind,
      filterMode,
      voiceActive
    };

    if (!window.__saathiBaselineMetrics) {
      window.__saathiBaselineMetrics = { ...current };
    }

    const baseline = window.__saathiBaselineMetrics;
    return { current, baseline };
  });

  const labelEl = document.getElementById("complexity-label");
  const fillEl = document.getElementById("complexity-fill");
  const detailsEl = document.getElementById("complexity-details");
  const diffEl = document.getElementById("complexity-diff");

  if (!data) {
    labelEl.textContent = "Protected Tab";
    detailsEl.textContent = "Open a standard webpage to analyze complexity.";
    return;
  }

  const { current, baseline } = data;

  labelEl.textContent = `${current.level} (${current.score}/100)`;
  fillEl.style.width = `${Math.max(10, current.score)}%`;
  if (current.level === "High") fillEl.style.background = "#ef4444";
  else if (current.level === "Medium") fillEl.style.background = "#f59e0b";
  else fillEl.style.background = "#22c55e";

  detailsEl.textContent = `${current.visibleNodes} visible nodes • ${current.activeAnims} active anims • ${current.visibleClutter} clutter/media`;

  // Sync button UI states with actual webpage state
  syncButtonStates(current);

  // Show detailed comparison when Refresh is clicked or when any change occurred
  const scoreDelta = current.score - baseline.score;
  const animDelta = current.activeAnims - baseline.activeAnims;
  const nodeDelta = current.visibleNodes - baseline.visibleNodes;
  const clutterDelta = current.visibleClutter - baseline.visibleClutter;

  if (showDiff || scoreDelta !== 0 || animDelta !== 0 || nodeDelta !== 0 || clutterDelta !== 0) {
    diffEl.style.display = "block";
    const changes = [];

    if (scoreDelta === 0 && animDelta === 0 && nodeDelta === 0 && clutterDelta === 0) {
      changes.push(`• <strong>No change since initial scan</strong> (Score steady at ${current.score}/100). Toggle <em>Epilepsy Safe Mode</em> or <em>Simplify Layout</em> and click Refresh!`);
    } else {
      const scoreSign = scoreDelta > 0 ? `+${scoreDelta}` : `${scoreDelta}`;
      changes.push(`• <strong>Score Change:</strong> ${baseline.score}/100 → <strong>${current.score}/100</strong> (${scoreSign} pts)`);

      if (animDelta !== 0) {
        changes.push(`• <strong>Animations:</strong> ${baseline.activeAnims} → <strong>${current.activeAnims}</strong> (${Math.abs(animDelta)} ${animDelta < 0 ? "frozen/stopped" : "added"})`);
      }
      if (clutterDelta !== 0) {
        changes.push(`• <strong>Clutter & Media:</strong> ${baseline.visibleClutter} → <strong>${current.visibleClutter}</strong> (${Math.abs(clutterDelta)} ${clutterDelta < 0 ? "hidden" : "added"})`);
      }
      if (nodeDelta !== 0) {
        changes.push(`• <strong>Visible DOM Nodes:</strong> ${baseline.visibleNodes} → <strong>${current.visibleNodes}</strong> (${nodeDelta > 0 ? "+" : ""}${nodeDelta} nodes)`);
      }
    }

    diffEl.innerHTML = `<strong>📊 Complexity Change Report:</strong><br>${changes.join("<br>")}`;
  }
}

function syncButtonStates(state) {
  const epBtn = document.getElementById("btn-epilepsy");
  epBtn.classList.toggle("active", state.isEpilepsySafe);
  document.getElementById("state-epilepsy").textContent = state.isEpilepsySafe ? "ON" : "OFF";

  const cbBtn = document.getElementById("btn-colorblind");
  cbBtn.classList.toggle("active", state.isColorblind);
  document.getElementById("state-colorblind").textContent = state.isColorblind ? "ON" : "OFF";

  const simBtn = document.getElementById("btn-simplify");
  simBtn.classList.toggle("active", state.isSimplified);
  document.getElementById("state-simplify").textContent = state.isSimplified ? "ON" : "OFF";

  document.getElementById("select-filter").value = state.filterMode;

  updateVoiceUI(state.voiceActive);
}

function updateVoiceUI(isActive, customMessage = null) {
  const voiceBtn = document.getElementById("btn-voice");
  const voiceLabel = document.getElementById("label-voice");
  const voiceState = document.getElementById("state-voice");
  const voiceBox = document.getElementById("voice-box");

  if (isActive) {
    voiceBtn.classList.add("voice-active");
    voiceLabel.textContent = "🛑 Voice Control: ON";
    voiceState.textContent = "STOP";
    voiceBox.style.display = "block";
    voiceBox.innerHTML = customMessage || `<strong>🟢 Voice Control is ON (Listening on page)</strong><br>Say: <em>"scroll down"</em>, <em>"scroll up"</em>, <em>"epilepsy"</em>, <em>"colorblind"</em>, <em>"simplify"</em>, or <em>"read"</em>.`;
  } else {
    voiceBtn.classList.remove("voice-active");
    voiceLabel.textContent = "🎤 Voice Control: OFF";
    voiceState.textContent = "START";
    if (customMessage) {
      voiceBox.style.display = "block";
      voiceBox.innerHTML = customMessage;
    } else {
      voiceBox.style.display = "none";
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  analyzeComplexity(false);
});

// Refresh & Compare Complexity Button
document.getElementById("btn-refresh-complexity").addEventListener("click", () => {
  analyzeComplexity(true);
});

// Epilepsy Safe Mode
document.getElementById("btn-epilepsy").addEventListener("click", async () => {
  await executeInTab(() => {
    document.body.classList.toggle("saathi-epilepsy-safe");
    if (document.body.classList.contains("saathi-epilepsy-safe")) {
      document.querySelectorAll("video, audio").forEach(m => m.pause());
    }
  });
  await analyzeComplexity(true);
});

// Colorblind Symbols & Contrast
document.getElementById("btn-colorblind").addEventListener("click", async () => {
  await executeInTab(() => {
    document.body.classList.toggle("saathi-colorblind-symbols");
  });
  await analyzeComplexity(false);
});

// Color Vision Filter Select
document.getElementById("select-filter").addEventListener("change", async (e) => {
  const mode = e.target.value;
  await executeInTab((selectedMode) => {
    document.documentElement.setAttribute("data-saathi-filter", selectedMode);
  }, [mode]);
});

// Simplify Page
document.getElementById("btn-simplify").addEventListener("click", async () => {
  await executeInTab(() => {
    document.body.classList.toggle("saathi-simplify-mode");
  });
  await analyzeComplexity(true);
});

// Easy Translate
document.getElementById("btn-translate").addEventListener("click", async () => {
  const lang = document.getElementById("select-lang").value;
  await executeInTab((targetLang) => {
    const selectedText = window.getSelection().toString().trim();
    if (selectedText) {
      window.open(`https://translate.google.com/?sl=auto&tl=${targetLang}&text=${encodeURIComponent(selectedText)}&op=translate`, "_blank");
    } else {
      window.open(`https://translate.google.com/translate?sl=auto&tl=${targetLang}&u=${encodeURIComponent(window.location.href)}`, "_blank");
    }
  }, [lang]);
});

// Text-to-Speech (Read Aloud)
document.getElementById("btn-tts").addEventListener("click", async () => {
  await executeInTab(() => {
    const text = window.getSelection().toString().trim() || document.body.innerText.slice(0, 600);
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  });
});

// Voice Control Assistant (Runs on the active webpage so microphone permission prompts properly and stays active)
document.getElementById("btn-voice").addEventListener("click", async () => {
  const result = await executeInTab(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      return { supported: false };
    }

    // Create or get on-page floating voice indicator badge
    let badge = document.getElementById("saathi-voice-indicator");
    if (!badge) {
      badge = document.createElement("div");
      badge.id = "saathi-voice-indicator";
      badge.style.cssText = "position:fixed;bottom:20px;left:20px;z-index:2147483647;background:#0f172a;color:#f8fafc;border:2px solid #ef4444;border-radius:999px;padding:10px 16px;font-family:system-ui,sans-serif;font-size:13px;font-weight:700;box-shadow:0 10px 25px rgba(0,0,0,0.4);display:none;align-items:center;gap:8px;";
      document.body.appendChild(badge);
    }

    // If already active, stop it and turn OFF
    if (window.__saathiVoiceActive && window.__saathiRecognition) {
      window.__saathiVoiceActive = false;
      try { window.__saathiRecognition.stop(); } catch (e) {}
      window.__saathiRecognition = null;
      badge.style.display = "none";
      return { supported: true, active: false };
    }

    // Otherwise start voice recognition
    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = false;
    rec.lang = "en-US";

    window.__saathiRecognition = rec;
    window.__saathiVoiceActive = true;

    badge.style.display = "flex";
    badge.innerHTML = "🛑 <span>Saathi Voice: ON (Listening...)</span>";

    rec.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
      badge.innerHTML = `🎤 <span>Heard: "${transcript}"</span>`;

      if (transcript.includes("scroll down") || transcript.includes("down")) {
        window.scrollBy({ top: 450, behavior: "smooth" });
      } else if (transcript.includes("scroll up") || transcript.includes("up")) {
        window.scrollBy({ top: -450, behavior: "smooth" });
      } else if (transcript.includes("top")) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (transcript.includes("epilepsy") || transcript.includes("flash")) {
        document.body.classList.toggle("saathi-epilepsy-safe");
        if (document.body.classList.contains("saathi-epilepsy-safe")) {
          document.querySelectorAll("video, audio").forEach(m => m.pause());
        }
      } else if (transcript.includes("colorblind") || transcript.includes("color")) {
        document.body.classList.toggle("saathi-colorblind-symbols");
      } else if (transcript.includes("simplify")) {
        document.body.classList.toggle("saathi-simplify-mode");
      } else if (transcript.includes("read")) {
        const text = window.getSelection().toString().trim() || document.body.innerText.slice(0, 400);
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
      }
    };

    rec.onerror = (e) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        badge.style.borderColor = "#f59e0b";
        badge.innerHTML = "⚠️ <span>Mic blocked! Click Allow Microphone in address bar.</span>";
        window.__saathiVoiceActive = false;
      }
    };

    rec.onend = () => {
      if (window.__saathiVoiceActive) {
        try { rec.start(); } catch (e) {}
      }
    };

    try {
      rec.start();
    } catch (e) {}

    return { supported: true, active: true };
  });

  if (!result) {
    updateVoiceUI(false, "⚠️ Cannot start Voice Control on a browser system tab. Try it on any normal website.");
    return;
  }

  if (!result.supported) {
    updateVoiceUI(false, "⚠️ Web Speech API is not supported in this browser.");
    return;
  }

  if (result.active) {
    updateVoiceUI(true);
  } else {
    updateVoiceUI(false, "⚪ Voice Control stopped (OFF). Click <strong>START</strong> to turn it back on.");
  }
});
