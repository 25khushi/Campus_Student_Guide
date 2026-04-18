// Validation Utilities
export const Validator = {
    isValidEmail: (email) => /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email),
    isValidMobile: (mobile) => /^\d{10}$/.test(mobile),
    isValidName: (name) => /^[a-zA-Z\s]{3,}$/.test(name),
    isValidPassword: (password) => password.length >= 6,
    isNotEmpty: (value) => value && value.trim() !== '',
};
