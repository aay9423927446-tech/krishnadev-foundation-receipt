// ======================================================
// NUMBER TO WORDS - INDIAN NUMBERING SYSTEM
// ======================================================

const ones = [

  "",

  "One",

  "Two",

  "Three",

  "Four",

  "Five",

  "Six",

  "Seven",

  "Eight",

  "Nine",

  "Ten",

  "Eleven",

  "Twelve",

  "Thirteen",

  "Fourteen",

  "Fifteen",

  "Sixteen",

  "Seventeen",

  "Eighteen",

  "Nineteen"

];


const tens = [

  "",

  "",

  "Twenty",

  "Thirty",

  "Forty",

  "Fifty",

  "Sixty",

  "Seventy",

  "Eighty",

  "Ninety"

];


// ======================================================
// TWO DIGITS
// ======================================================

function twoDigits(number) {

  const num =
    Number(number);


  if (
    num <= 0
  ) {

    return "";

  }


  if (
    num < 20
  ) {

    return ones[num];

  }


  const tensValue =
    Math.floor(num / 10);

  const onesValue =
    num % 10;


  return (

    tens[tensValue] +

    (
      onesValue
        ? " " + ones[onesValue]
        : ""
    )

  );

}


// ======================================================
// THREE DIGITS
// ======================================================

function threeDigits(number) {

  const num =
    Number(number);


  if (
    num <= 0
  ) {

    return "";

  }


  if (
    num < 100
  ) {

    return twoDigits(num);

  }


  const hundred =
    Math.floor(num / 100);

  const remainder =
    num % 100;


  return (

    ones[hundred] +

    " Hundred" +

    (
      remainder
        ? " " + twoDigits(remainder)
        : ""
    )

  );

}


// ======================================================
// MAIN FUNCTION
// ======================================================

export function numberToWords(value) {

  if (
    value === "" ||
    value === null ||
    value === undefined
  ) {

    return "";

  }


  const number =
    Number(value);


  if (
    !Number.isFinite(number) ||
    number < 0
  ) {

    return "";

  }


  // ----------------------------------------------
  // Whole rupees only
  // ----------------------------------------------

  const amount =
    Math.floor(number);


  if (
    amount === 0
  ) {

    return "Rupees Zero Only";

  }


  // ----------------------------------------------
  // CRORE
  // ----------------------------------------------

  const crore =
    Math.floor(
      amount / 10000000
    );


  // ----------------------------------------------
  // REMAINING AFTER CRORE
  // ----------------------------------------------

  let remainder =
    amount % 10000000;


  // ----------------------------------------------
  // LAKH
  // ----------------------------------------------

  const lakh =
    Math.floor(
      remainder / 100000
    );


  remainder =
    remainder % 100000;


  // ----------------------------------------------
  // THOUSAND
  // ----------------------------------------------

  const thousand =
    Math.floor(
      remainder / 1000
    );


  remainder =
    remainder % 1000;


  // ----------------------------------------------
  // HUNDRED + REMAINING
  // ----------------------------------------------

  const parts = [];


  if (
    crore > 0
  ) {

    parts.push(
      threeDigits(crore) +
      " Crore"
    );

  }


  if (
    lakh > 0
  ) {

    parts.push(
      threeDigits(lakh) +
      " Lakh"
    );

  }


  if (
    thousand > 0
  ) {

    parts.push(
      threeDigits(thousand) +
      " Thousand"
    );

  }


  if (
    remainder > 0
  ) {

    parts.push(
      threeDigits(remainder)
    );

  }


  return (

    "Rupees " +

    parts.join(" ") +

    " Only"

  );

}