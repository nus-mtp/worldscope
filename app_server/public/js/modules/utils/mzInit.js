/**
 * 'mzInit' initializes and connects dynamic elements for MaterializeCSS.
 */
/*global $*/
const m = require('mithril');
const mzInit = module.exports = {
  select: {
    config: () => {
      $('select').material_select();
    },
    onchange: m.withAttr('value', m.route)
  }
};