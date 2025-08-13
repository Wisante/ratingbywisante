export function sanitizeInput(text) {
    return text
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/'/g, "&#39;")
        .replace(/"/g, "&quot;");
}

export async function checkAdminStatus(email) {
  try {
    const response = await fetch('/.netlify/functions/checkAdmin', {
      method: 'POST',
      body: JSON.stringify({ email: email })
    });
    const data = await response.json();
    return data.isAdmin;
  } catch (error) {
    console.error("Error verificando admin:", error);
    return false;
  }
}