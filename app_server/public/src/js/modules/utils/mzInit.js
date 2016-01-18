/**
 * 'mzInit' initializes and connects dynamic elements for MaterializeCSS.
 */
/*global $*/
/*global Materialize*/
const m = require('mithril');
const mzInit = module.exports = {
  select: {
    config: () => $('select').material_select()
  },
  text: {
    config: function () {
      // Based on a segment in forms.js from MaterializeCSS.
      // May break on updating MaterializeCSS.
      let inputs = 'input[type=text],input[type=password],input[type=email],textarea';

      let isEmpty = ($input) => $input.val().length === 0;
      let hasPlaceholder = ($input) => $input.attr('placeholder') !== undefined;
      let activate = ($input) => $input.siblings('label').addClass('active');
      let deactivate = ($input) => $input.siblings('label').removeClass('active');

      // Add active if input element has been pre-populated on document ready.
      $(document).ready(function () {
        Materialize.updateTextFields();
      });

      // Add active if form auto-completes.
      $(document).on('change', inputs, function () {
        let $inputElement = $(this);
        if (!isEmpty($inputElement) || hasPlaceholder($inputElement)) {
          activate($inputElement);
        }
      });

      // Add or remove active on user input.
      $(document).on('focus', inputs, function () {
        activate($(this));
      });
      $(document).on('blur', inputs, function () {
        let $inputElement = $(this);
        if (isEmpty($inputElement) && !hasPlaceholder($inputElement)) {
          deactivate($inputElement);
        }
      });
    }
  }
};
