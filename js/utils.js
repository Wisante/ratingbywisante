function sanitizeInput(text) {
    return text
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/'/g, "&#39;")
        .replace(/"/g, "&quot;");
}

window.sanitizeInput = sanitizeInput;