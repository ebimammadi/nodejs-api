//some custom functions
const escapeText = (text) => {
	return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

const regex = (text) => {
	return new RegExp(escapeText(text), 'gi');
};

const factorial = (n) => {
	if (n === 1) return 1;
	return factorial(n - 1);
};

module.exports = { escapeText, factorial, regex };
