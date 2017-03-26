'use strict';

(function() {
  var component = function(selector, defaultValues) {

    if(!selector) {
      throw 'Не задан селектор';
    }

    console.info('-=load phoneMaskComponent for ' + selector + '=-');

    let self = this;
    self.inputs = document.querySelectorAll(selector);

    for(let i = 0; i < self.inputs.length; i++) {
      self.initInput(self.inputs[i]);
      if(defaultValues != null && typeof defaultValues[self.inputs[i].getAttribute('name')] != 'undefined') {
        self.inputs[i].value = defaultValues[self.inputs[i].getAttribute('name')];
      }
    }

    Object.defineProperty(this, 'value', { // если захотим иметь в форме несколько полей с телефонами
      get: function() {
        let phones = {};
        for(let i = 0; i < self.inputs.length; i++) {
          phones[self.inputs[i].getAttribute('name')] = self.inputs[i].value;
        }

        return phones;
      }
    });

  };

  component.prototype.initInput = function(input) {
    let self = this;

    let phone = ['7', '_', '_', '_', '_', '_', '_', '_', '_', '_', '_'];
    let numIndex = 1;

    input.onfocus = function(e) {

      if(input.value == '') {
        input.value = '+7-___-___-__-__';
        setTimeout(function() {
          input.selectionStart = input.selectionEnd = 3;
        }, 1);
      }

    }

    input.onkeydown = function(e) {

      let cursorPos = input.selectionStart;
      let offset = 0;
      let isNumber = false,
          isBackspace = false;

      if(e.keyCode >= 47 && e.keyCode <= 58) {
        isNumber = true;
      } else if(e.keyCode === 8) {
        isBackspace = true;
      }

      if(isNumber && [6, 10, 13].indexOf(cursorPos) !== -1) { // переход между разделителями "-", если написали цифру
        input.selectionStart = input.selectionEnd = ++cursorPos;
      }

      if(cursorPos >= 3 && cursorPos < 6) { // получаем индекс символа в массиве, в зависимости от положения каретки
        offset = 2;
        numIndex = cursorPos - offset;
      } else if(cursorPos > 6 && cursorPos < 10) {
        offset = 3;
        numIndex = cursorPos - offset;
      } else if(cursorPos > 10 && cursorPos < 13) {
        offset = 4;
        numIndex = cursorPos - offset;
      } else if(cursorPos > 13 && cursorPos < 15) {
        offset = 5;
        numIndex = cursorPos - offset;
      } else {
        offset = 5;
        numIndex = cursorPos - offset;
      }

      if(isNumber && numIndex < 11) { // нажали цифру
        let key = String.fromCharCode(e.keyCode);
        phone[numIndex++] = key;
      } else if(isBackspace && numIndex >= 2) { // нажали backspace
        phone[--numIndex] = '_';
      }

      input.value = phone.join('').replace(/(.?)(.?)(.?)(.?)(.?)(.?)(.?)(.?)(.?)(.?)(.)/, '+$1-$2$3$4-$5$6$7-$8$9-$10$11');

      input.selectionStart = input.selectionEnd = numIndex + offset;

      if(isBackspace && [6, 10, 13].indexOf(input.selectionStart) !== -1) { // переход между разделителями "-", если написали нажали backspace
        input.selectionStart = input.selectionEnd = input.selectionStart - 1;
      }

      e.preventDefault();
    };

  }

  component.prototype.validate = function(input) {
    let self = this;
    let result = true;
    for(let i = 0; i < self.inputs.length; i++) {
      let input = self.inputs[i];

      if(!/\+7\-\d{3}\-\d{3}\-\d{2}\-\d{2}/.test(input.value)) {
        input.parentNode.querySelector('.help').innerHTML = 'Неккоректный номер телефона';
        result = false;
      } else {
        input.parentNode.querySelector('.help').innerHTML = '';
      }
    }

    return result;
  }

  component.prototype.clear = function() {
    let self = this;
    for(let i = 0; i < self.inputs.length; i++) {
      self.inputs[i].value = '';
    }
  }

  window.phoneMaskComponent = component;

})();
