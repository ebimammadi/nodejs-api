const path = require('path');

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

const validateURL = str => {
  const pattern = urlRegexPattern;
  return !!pattern.test(str);
};

const urlRegexPattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
  '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
  '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
  '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
  '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
  '(\\#[-a-z\\d_]*)?$','i'); // fragment locator

const absolutePath = filePath => path.dirname(require.main.filename) + '/' + process.env.UPLOAD_FOLDER + filePath;
const urlPath = filePath => (filePath) ? process.env.API_PATH +'/files' + filePath : ''; //return '' if the file is empty

module.exports = { escapeText, factorial, regex, validateURL, absolutePath, urlPath, urlRegexPattern };
