/**
 * 'timeFormat' formats time into more readable formats.
 */
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const to2Digits = (i) => i < 10 ? '0' + i : i;
const timeFormat = module.exports = {
  toShortDate: (d) => to2Digits(d.getDay()) + ' ' + months[d.getMonth()] + ' ' + d.getFullYear(),
  toShortTime: (d) => to2Digits(d.getHours()) + ':' + to2Digits(d.getMinutes()),
  toShortDateTime: (d) => timeFormat.toShortDate(d) + ', ' + timeFormat.toShortTime(d)
};
