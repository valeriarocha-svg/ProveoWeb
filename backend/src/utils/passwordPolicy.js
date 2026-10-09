const validatePassword = (password) => {
  if (typeof password !== 'string') return false;
  const length = Array.from(password).length;

  return length >= 10 &&
    length <= 18 &&
    /[A-Z]/.test(password) &&
    /\d/.test(password) &&
    /[^A-Za-z0-9\s]/.test(password);
};

module.exports = { validatePassword };
