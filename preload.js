const path = require('path');

window.addEventListener('DOMContentLoaded', () => {
    const decimalPath = path.join(process.resourcesPath, 'decimal.js');
    const script = document.createElement('script');
    script.src = decimalPath;
    document.head.appendChild(script);
});