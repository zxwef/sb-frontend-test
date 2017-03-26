'use strict';

(function() {
  console.info('-= start =-');
  console.log(localStorage);

  let phoneInput = new phoneMaskComponent('.form__phone', JSON.parse(localStorage.getItem('phone')));

  let autosuggestionInput = new autosuggestion({
    selector: '.form__autosuggestion',
    sources: [
      'data/names1.php',
      'data/names2.php'
    ]
  }, JSON.parse(localStorage.getItem('name')));

  document.getElementById('save').onclick = function() {
    if(!supportLocalStorage()) {
      return false;
    }

    if(phoneInput.validate()) {
      localStorage.setItem('phone', JSON.stringify(phoneInput.value));
    }

    if(autosuggestionInput.validate()) {
      localStorage.setItem('name', JSON.stringify(autosuggestionInput.value));
    }
  };

  document.getElementById('clear').onclick = function() {
    if(supportLocalStorage()) {
      autosuggestionInput.clear();
      phoneInput.clear();
      localStorage.clear();
    }
  };

  function supportLocalStorage() {
    try {
      return 'localStorage' in window && window['localStorage'] !== null;
    } catch (e) {
      return false;
    }
  }

})();
