const normalizeEmail = (value) => (value || '').toString().trim().toLowerCase();

const normalizePhone = (value) => {
  const phone = (value || '').toString().trim();
  return phone ? phone.slice(0, 20) : '';
};

const normalizeDisplayName = (value) => (value || '').toString().trim().replace(/\s+/g, ' ').slice(0, 100);

module.exports = {
  normalizeEmail,
  normalizePhone,
  normalizeDisplayName
};
