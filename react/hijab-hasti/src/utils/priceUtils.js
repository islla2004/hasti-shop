const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';

export function toPersianNumber(num) {
  return num.toString().replace(/\d/g, (digit) => PERSIAN_DIGITS[digit]);
}

export function formatPrice(price) {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
