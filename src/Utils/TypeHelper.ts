function isNumber(obj: string) {
  const template = /[0-9]/;
  return template.test(obj);
}
function isAlpha(obj: string) {
  const template = /[a-z]/i;
  return template.test(obj);
}
function isOperator(obj: string) {
  const template = /[+\-*/]/;
  return template.test(obj);
}

export { isNumber, isAlpha, isOperator };
