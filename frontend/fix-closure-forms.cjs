const fs = require('fs');

// 1. Update ExecutionWorkspaceDetails.css
let css = fs.readFileSync('src/pages/ExecutionWorkspaceDetails.css', 'utf8');

if (!css.includes('.execution-detail-body { flex: 1; }')) {
    css = css.replace('.execution-detail-card {', '.execution-detail-card {\n    height: 100%;\n    display: flex;\n    flex-direction: column;');
    css = css.replace('.execution-detail-body {', '.execution-detail-body {\n    flex: 1;');
}

if (!css.includes('.closure-form-group')) {
    css += `\n/* Closure Form Styles */
.closure-form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 24px;
}

.closure-form-label {
    font-size: 13px;
    font-weight: 600;
    color: #475569;
}

.closure-input, .closure-select, .closure-textarea {
    width: 100%;
    padding: 10px 14px;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    background-color: #ffffff;
    color: #0f172a;
    font-size: 14px;
    transition: all 0.2s ease;
    outline: none;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    font-family: inherit;
    box-sizing: border-box;
}

.closure-input, .closure-select {
    height: 44px;
}

.closure-textarea {
    min-height: 100px;
    resize: vertical;
}

.closure-input:focus, .closure-select:focus, .closure-textarea:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.closure-input:disabled, .closure-select:disabled, .closure-textarea:disabled {
    background-color: #f8fafc;
    color: #94a3b8;
    cursor: not-allowed;
}

.closure-select {
    appearance: none;
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right 14px center;
    background-size: 16px;
    padding-right: 40px;
}

/* Custom Checkbox Toggle Row */
.closure-checkbox-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    background-color: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.closure-checkbox-row:hover:not(.disabled) {
    background-color: #f1f5f9;
}

.closure-checkbox-row.disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.closure-checkbox-label {
    font-size: 14px;
    font-weight: 600;
    color: #0f172a;
    display: flex;
    align-items: center;
    gap: 8px;
}

.closure-checkbox-input {
    width: 22px;
    height: 22px;
    border-radius: 6px;
    border: 2px solid #cbd5e1;
    appearance: none;
    outline: none;
    cursor: pointer;
    position: relative;
    background-color: #ffffff;
    transition: all 0.2s;
    margin: 0;
}

.closure-checkbox-input:checked {
    background-color: #2563eb;
    border-color: #2563eb;
}

.closure-checkbox-input:checked::after {
    content: '';
    position: absolute;
    left: 7px;
    top: 3px;
    width: 6px;
    height: 10px;
    border: solid white;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
}

.closure-checkbox-input:disabled {
    cursor: not-allowed;
}
`;
}
fs.writeFileSync('src/pages/ExecutionWorkspaceDetails.css', css);

// 2. Update ClosureTab.tsx
let tsx = fs.readFileSync('src/components/projectexecution/tabs/ClosureTab.tsx', 'utf8');

tsx = tsx.replace(/className="execution-form-group"/g, 'className="closure-form-group"');
tsx = tsx.replace(/className="execution-form-control"/g, 'className="closure-input"');
tsx = tsx.replace(/<select \n\s*className="closure-input"/g, '<select \n                                className="closure-select"');
tsx = tsx.replace(/<textarea \n\s*className="closure-input"/g, '<textarea \n                                className="closure-textarea"');
tsx = tsx.replace(/className={`execution-checkbox-row/g, 'className={`closure-checkbox-row');
tsx = tsx.replace(/className="execution-checkbox-label"/g, 'className="closure-checkbox-label"');
tsx = tsx.replace(/className="execution-checkbox-input"/g, 'className="closure-checkbox-input"');

// Ensure labels have the proper class
tsx = tsx.replace(/<label>Inspection Status<\/label>/g, '<label className="closure-form-label">Inspection Status</label>');
tsx = tsx.replace(/<label>Inspection Date<\/label>/g, '<label className="closure-form-label">Inspection Date</label>');
tsx = tsx.replace(/<label>Inspection Notes<\/label>/g, '<label className="closure-form-label">Inspection Notes</label>');
tsx = tsx.replace(/<label>Delivery Date<\/label>/g, '<label className="closure-form-label">Delivery Date</label>');
tsx = tsx.replace(/<label>Installation Status<\/label>/g, '<label className="closure-form-label">Installation Status</label>');
tsx = tsx.replace(/<label>Delivery Notes<\/label>/g, '<label className="closure-form-label">Delivery Notes</label>');

fs.writeFileSync('src/components/projectexecution/tabs/ClosureTab.tsx', tsx);
console.log('Update completed');
