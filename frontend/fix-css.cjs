const fs = require('fs');
let css = fs.readFileSync('src/pages/ExecutionWorkspaceDetails.css', 'utf8');

// 1. Fix tab header responsive styles that we previously added
css = css.replace(
  /\.execution-tab-header-container \{[\s\S]*?\}/,
  `.execution-tab-header-container {\n    display: flex;\n    justify-content: space-between;\n    align-items: flex-start;\n    margin-bottom: 24px;\n    flex-wrap: wrap;\n    gap: 16px;\n    width: 100%;\n    min-width: 0;\n}`
);
css = css.replace(
  /\.execution-tab-title-group \{[\s\S]*?\}/,
  `.execution-tab-title-group {\n    display: flex;\n    flex-direction: column;\n    gap: 4px;\n    min-width: 0;\n    flex: 1 1 auto;\n}`
);
css = css.replace(
  /\.execution-tab-title \{[\s\S]*?\}/,
  `.execution-tab-title {\n    margin: 0;\n    font-size: 20px;\n    font-weight: 700;\n    color: #0f172a;\n    word-break: normal;\n    overflow-wrap: break-word;\n}`
);
css = css.replace(
  /\.execution-tab-subtitle \{[\s\S]*?\}/,
  `.execution-tab-subtitle {\n    margin: 0;\n    font-size: 13px;\n    color: #64748b;\n    word-break: normal;\n    overflow-wrap: break-word;\n}`
);
css = css.replace(
  /\.execution-details-grid \{[\s\S]*?\}/,
  `.execution-details-grid {\n    display: grid;\n    grid-template-columns: 1fr;\n    gap: 24px;\n    margin-top: 8px;\n    width: 100%;\n    min-width: 0;\n}`
);
css = css.replace(
  /\.execution-detail-card \{[\s\S]*?\}/,
  `.execution-detail-card {\n    background-color: #ffffff;\n    border-radius: 12px;\n    border: 1px solid #e2e8f0;\n    box-shadow: 0 1px 3px rgba(15, 23, 42, 0.05);\n    overflow: hidden;\n    width: 100%;\n    min-width: 0;\n}`
);

// 2. Fix Layout and Sidebar
css = css.replace(
  /\/\* Layout \*\/[\s\S]*?\.execution-nav \{[\s\S]*?width: 100%;\n\}/,
  `/* Layout */\n.execution-layout {\n    display: flex;\n    flex: 1;\n    overflow: hidden;\n    flex-direction: row;\n}\n\n/* Sidebar Tabs */\n.execution-sidebar {\n    width: 256px;\n    background-color: #ffffff;\n    border-right: 1px solid #e2e8f0;\n    flex-shrink: 0;\n    overflow-y: auto;\n    overflow-x: hidden;\n    display: flex;\n    flex-direction: column;\n    transition: width 0.3s ease;\n}\n\n.execution-sidebar.collapsed {\n    width: 72px;\n}\n\n.execution-sidebar.collapsed .execution-sidebar-header {\n    justify-content: center;\n}\n\n.execution-sidebar.collapsed .execution-tab {\n    justify-content: center;\n    padding: 12px;\n}\n\n.execution-sidebar.collapsed .execution-tab span {\n    display: none;\n}\n\n.execution-nav {\n    padding: 16px;\n    display: flex;\n    flex-direction: column;\n    gap: 8px;\n    width: 100%;\n}`
);

// 3. Fix Header logic (make toggle always visible if needed)
css = css.replace(
  /\.execution-sidebar-header \{\s*display: none;/,
  '.execution-sidebar-header {\n    display: flex;'
);

// 4. Fix execution-content
css = css.replace(
  /\.execution-content \{[\s\S]*?width: 0;[\s\S]*?\}/,
  `.execution-content {\n    flex: 1;\n    overflow-y: auto;\n    overflow-x: hidden;\n    padding: 24px;\n    width: 0;\n    min-width: 0;\n}`
);

// 5. Fix media query logic
css = css.replace(
  /\/\* Responsiveness \*\/[\s\S]*?\/\* Forms \*\//,
  `/* Responsiveness */\n@media (max-width: 1023px) {\n    .execution-sidebar {\n        width: 72px !important;\n    }\n    \n    .execution-sidebar-header {\n        justify-content: center !important;\n    }\n    \n    .execution-tab {\n        justify-content: center !important;\n        padding: 12px !important;\n    }\n    \n    .execution-tab span {\n        display: none !important;\n    }\n}\n\n@media (min-width: 768px) {\n    .execution-stats-grid {\n        grid-template-columns: repeat(3, 1fr);\n    }\n}\n\n@media (min-width: 1024px) {\n    .execution-stats-grid {\n        grid-template-columns: repeat(6, 1fr);\n    }\n\n    .execution-details-grid {\n        grid-template-columns: repeat(2, 1fr);\n    }\n}\n\n/* Forms */`
);

fs.writeFileSync('src/pages/ExecutionWorkspaceDetails.css', css);
console.log("Done");
