function sanitizeString(str) {
  return str.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function uuid() {
  return 'xxxx-xxxx-xxxx'.replace(/[x]/g, () =>
    (Math.random()*16|0).toString(16));
}

function formatDate(date) {
  return new Date(date).toLocaleDateString();
}
