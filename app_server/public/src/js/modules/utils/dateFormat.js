/**
 * 'timeFormat' formats time into more readable formats.
 */
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const timeFormat = module.exports = {
  toShortDateTime: function (d) {
    return d.getDay() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear() + ', ' +
        d.getHours() + ':' + d.getMinutes();
  }
};
