/**
 * 'timeFormat' formats time into more readable formats.
 */
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const to2Digits = (i) => i < 10 ? '0' + i : i;
const timeFormat = module.exports = {
  toShortDateTime: function (d) {
    return to2Digits(d.getDay()) + ' ' + months[d.getMonth()] + ' ' + d.getFullYear() + ', ' +
        to2Digits(d.getHours()) + ':' + to2Digits(d.getMinutes());
  }
};
