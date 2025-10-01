/**
 * Password validation rules and patterns used across the application.
 * These constants ensure consistent password requirements for security.
 */
export const PASSWORD_RULES = {
	/** Minimum password length required for security */
	MIN_LEN: 8,
	/** Regular expression to check for at least one uppercase letter */
	NEEDS_UPPERCASE: /[A-Z]/,
	/** Regular expression to check for at least one special symbol/character */
	NEEDS_SYMBOL: /[!@#$%^&*(),.?":{}|<>]/,
} as const;

/**
 * Checks a password string against the current password policy.
 *
 * @param password - The password string to check.
 * @returns An object with booleans for each password rule.
 */
export const getPasswordChecks = (password: string) => ({
	isLengthValid: password.length >= PASSWORD_RULES.MIN_LEN,
	hasUppercase: PASSWORD_RULES.NEEDS_UPPERCASE.test(password),
	hasSymbol: PASSWORD_RULES.NEEDS_SYMBOL.test(password),
});

/**
 * Validates password complexity based on predefined rules.
 * @param password - The password to validate
 * @returns boolean - True if the password meets complexity rules, false otherwise
 */
export const validatePasswordComplexity = (password: string): boolean => {
	const { isLengthValid, hasUppercase, hasSymbol } = getPasswordChecks(password);
	return isLengthValid && hasUppercase && hasSymbol;
};
