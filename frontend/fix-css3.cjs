const fs = require('fs');

let css = fs.readFileSync('src/pages/ExecutionWorkspaceDetails.css', 'utf8');

// 1. Base layout changes
css = css.replace(
  ".execution-layout {\r\n    display: flex;\r\n    flex: 1;\r\n    overflow: hidden;\r\n    flex-direction: column;\r\n}",
  ".execution-layout {\r\n    display: flex;\r\n    flex: 1;\r\n    overflow: hidden;\r\n    flex-direction: row;\r\n}"
);
if (!css.includes("flex-direction: row")) {
    css = css.replace(
      ".execution-layout {\n    display: flex;\n    flex: 1;\n    overflow: hidden;\n    flex-direction: column;\n}",
      ".execution-layout {\n    display: flex;\n    flex: 1;\n    overflow: hidden;\n    flex-direction: row;\n}"
    );
}

css = css.replace(
  /\.execution-sidebar \{\s*width: 100%;\s*background-color: #ffffff;\s*border-right: 1px solid #e2e8f0;\s*flex-shrink: 0;\s*overflow-x: auto;\s*display: flex;\s*\}/,
  ".execution-sidebar {\n    width: 256px;\n    background-color: #ffffff;\n    border-right: 1px solid #e2e8f0;\n    flex-shrink: 0;\n    overflow-y: auto;\n    overflow-x: hidden;\n    display: flex;\n    flex-direction: column;\n    transition: width 0.3s ease;\n}\n\n.execution-sidebar.collapsed {\n    width: 72px;\n}\n\n.execution-sidebar.collapsed .execution-sidebar-header {\n    justify-content: center;\n}\n\n.execution-sidebar.collapsed .execution-tab {\n    justify-content: center;\n    padding: 12px;\n}\n\n.execution-sidebar.collapsed .execution-tab span {\n    display: none;\n}"
);

css = css.replace(
  /\.execution-nav \{\s*padding: 16px;\s*display: flex;\s*gap: 8px;\s*width: 100%;\s*\}/,
  ".execution-nav {\n    padding: 16px;\n    display: flex;\n    flex-direction: column;\n    gap: 8px;\n    width: 100%;\n}"
);

css = css.replace(
  /\.execution-sidebar-header \{\s*display: none;/,
  ".execution-sidebar-header {\n    display: flex;"
);

// 2. execution-content
css = css.replace(
  /\.execution-content \{\s*flex: 1;\s*overflow-y: auto;\s*overflow-x: hidden;\s*padding: 24px;\s*width: 0; \/\* Ensures flex child can shrink below its min-content size \*\/\s*\}/,
  ".execution-content {\n    flex: 1;\n    overflow-y: auto;\n    overflow-x: hidden;\n    padding: 24px;\n    width: 0;\n    min-width: 0;\n}"
);

// 3. Remove .execution-overview h2 styling completely
css = css.replace(
  /\.execution-overview h2 \{\s*margin: 0;\s*font-size: 20px;\s*font-weight: 700;\s*color: #0f172a;\s*\}/,
  ""
);

// 4. Media queries
css = css.replace(
  /\/\* Responsiveness \*\/[\s\S]*?\/\* Forms \*\//,
  "/* Responsiveness */\n@media (max-width: 1023px) {\n    .execution-sidebar {\n        width: 72px !important;\n    }\n    \n    .execution-sidebar-header {\n        justify-content: center !important;\n    }\n    \n    .execution-tab {\n        justify-content: center !important;\n        padding: 12px !important;\n    }\n    \n    .execution-tab span {\n        display: none !important;\n    }\n}\n\n@media (min-width: 768px) {\n    .execution-stats-grid {\n        grid-template-columns: repeat(3, 1fr);\n    }\n}\n\n@media (min-width: 1024px) {\n    .execution-stats-grid {\n        grid-template-columns: repeat(6, 1fr);\n    }\n\n    .execution-details-grid {\n        grid-template-columns: repeat(2, 1fr);\n    }\n}\n\n/* Forms */"
);

// 5. Add Tab Headers CSS classes if they don't exist
if (!css.includes(".execution-tab-title")) {
    css += `\n/* Tab Headers Standardized */
.execution-tab-header-container {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24px;
    flex-wrap: wrap;
    gap: 16px;
    width: 100%;
    min-width: 0;
}

.execution-tab-title-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
    flex: 1 1 auto;
}

.execution-tab-title {
    margin: 0;
    font-size: 20px;
    font-weight: 700;
    color: #0f172a;
    word-break: normal;
    overflow-wrap: break-word;
}

.execution-tab-subtitle {
    margin: 0;
    font-size: 13px;
    color: #64748b;
    word-break: normal;
    overflow-wrap: break-word;
}

.execution-tab-actions {
    display: flex;
    align-items: center;
    gap: 12px;
}\n`;
}

fs.writeFileSync('src/pages/ExecutionWorkspaceDetails.css', css);
console.log('Done');
