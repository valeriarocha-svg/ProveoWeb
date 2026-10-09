const normalizeMexicanPhone = (value) => {
  if (typeof value !== 'string') return null;

  const phone = value.trim();
  if (!phone) return null;
  if (!/^\+?[\d\s().-]+$/.test(phone)) return null;

  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return `+52${digits}`;
  if (digits.length === 12 && digits.startsWith('52')) return `+${digits}`;

  return null;
};

module.exports = { normalizeMexicanPhone };
