// Saathi Layer v2 — In-Page Content Script
(function () {
  if (window.__saathiLayerInjected) return;
  window.__saathiLayerInjected = true;

  // Inject SVG Colorblind Filters into DOM for accurate color correction
  const svgFilters = document.createElement("div");
  svgFilters.style.height = "0";
  svgFilters.style.width = "0";
  svgFilters.style.position = "absolute";
  svgFilters.style.overflow = "hidden";
  svgFilters.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="saathi-protanopia">
          <feColorMatrix type="matrix" values="0.567,0.433,0,0,0  0.558,0.442,0,0,0  0,0.242,0.758,0,0  0,0,0,1,0"/>
        </filter>
        <filter id="saathi-deuteranopia">
          <feColorMatrix type="matrix" values="0.625,0.375,0,0,0  0.7,0.3,0,0,0  0,0.3,0.7,0,0  0,0,0,1,0"/>
        </filter>
        <filter id="saathi-tritanopia">
          <feColorMatrix type="matrix" values="0.95,0.05,0,0,0  0,0.433,0.567,0,0  0,0.475,0.525,0,0  0,0,0,1,0"/>
        </filter>
      </defs>
    </svg>
  `;
  document.documentElement.appendChild(svgFilters);
})();
