const $ = (selector) => document.querySelector(selector);
const $all = (selector) => document.querySelectorAll(selector);
const e$ = (element, selector) => element.querySelector(selector);
const e$all = (element, selector) => element.querySelectorAll(selector);

const formatCurrency = (number, currency, type = undefined) => {
  const CURRENCY_FORMATTER = new Intl.NumberFormat(type, {
    currency,
    style: "currency",
  });
  return CURRENCY_FORMATTER.format(number);
};

const asyncReduce = async (array, asyncReducerFunction, initialValue) => {
  let accumulator = initialValue;

  for (const element of array) {
    accumulator = await asyncReducerFunction(accumulator, element);
  }

  return accumulator;
};

const isValidEmail = (email) => {
  const email_regex_pattern = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return email_regex_pattern.test(email);
};

const addStyle = (node, styleProperties) => {
  return Object.keys(styleProperties).forEach(
    (key) => (node.style[key] = styleProperties[key])
  );
};
const removeStyle = (node, styleProperties) => {
  return styleProperties.forEach(
    (stylePropertie) => (node.style[stylePropertie] = null) // node.style.removeProperty(stylePropertie)
  );
};
