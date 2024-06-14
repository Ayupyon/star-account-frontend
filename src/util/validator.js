import BigNumber from "bignumber.js";

let emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

export function validateLength(str, minLength, maxLength) {
  return typeof str === "string" && str.length >= minLength && str.length <= maxLength;
}

export function validateEmail(str) {
  return typeof str === "string" && emailRegex.test(str);
}

export function validateNumber(str) {
  let x = new BigNumber(str);
  return !x.isNaN() && x.isFinite();
}