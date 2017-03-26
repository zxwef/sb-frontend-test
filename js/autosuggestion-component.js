'use strict';

(function() {

  var componentWrap = function(params, defaultValues) {

    if(!params.selector) {
      throw 'Не задан селектор';
    }

    console.info('-=load augosuggestionComponent for ' + params.selector + '=-');

    let self = this;
    self.inputs = document.querySelectorAll(params.selector);
    this.components = [];

    for(let i = 0; i < self.inputs.length; i++) {
      self.components = new component(self.inputs[i], params);
      if(defaultValues != null && typeof defaultValues[self.inputs[i].getAttribute('name')] != 'undefined') {
        self.inputs[i].value = defaultValues[self.inputs[i].getAttribute('name')];
      }
    }

    Object.defineProperty(this, 'value', {
      get: function() {
        let names = {};
        for(let i = 0; i < self.inputs.length; i++) {
          names[self.inputs[i].getAttribute('name')] = self.inputs[i].value;
        }
        return names;
      }
    });

  };

  componentWrap.prototype.validate = function(input) {
    let self = this;
    let result = true;

    for(let i = 0; i < self.inputs.length; i++) {
      let input = self.inputs[i];
      if(input.value == '') {
        input.parentNode.querySelector('.help').innerHTML = 'Заполните поле';
        result = false;
      } else {
        input.parentNode.querySelector('.help').innerHTML = '';
      }
    }

    return result;
  }

  componentWrap.prototype.clear = function() {
    let self = this;

    for(let i = 0; i < self.inputs.length; i++) {
      self.inputs[i].value = '';
    }
  }

  var component = function(input, params) {
    this.input = input;
    this.sourceIndex = 0; // если не нашли под 
    this.ajaxLock = false;

    this.options = {
      selector: '',
      sources: []
    };

    Object.assign(this.options, params);

    this.initInput();
  }

  component.prototype.initInput = function() {
    let self = this;

    let wrap = self.input.parentNode;
    let list = wrap.querySelector('.form__autosuggest-list');

    self.input.onkeyup = function(e) {
        if(self.input.value.length === 0) {
          self.renderList();
          return;
        }

        self.load(self.input.value).then(
          function(response) {
            self.renderList(response);
          },
          function(err) {
            if(err.code != 'notData') {
              console.log(err.message);
            }
          }
      );

    }

    wrap.onclick = function(e) {
      if(e.target.classList.contains('form__suggest-span')) {
        self.input.value = e.target.innerHTML;
        list.innerHTML = '';
      }
    }

  }

  component.prototype.load = function(q) {
    var self = this;
    self.sourceIndex = 0;

    return new Promise(function(resolve, reject) {
      if(!self.ajaxLock && self.sourceIndex < self.options.sources.length) {
        self.ajaxLock = true;
        self.ajax(q, self.options.sources[self.sourceIndex], resolve, reject);
      } else {
        //self.ajax(q, self.options.sources[self.sourceIndex], resolve, reject);
        reject({
          code: 'notData'
        });
      }
    });
  }

  component.prototype.ajax = function(q, url, resolve, reject) {
    let self = this;
    let xhr = new XMLHttpRequest();
    xhr.open('GET', url + '?q=' + q, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send();

    xhr.onload = function() {
      if (this.status == 200) {
        let json = JSON.parse(xhr.response);
        if(json.length == 0 && self.sourceIndex < self.options.sources.length - 1) {
          self.ajax(q, self.options.sources[++self.sourceIndex], resolve, reject);
        } else {
          self.ajaxLock = false;
          resolve(json);
        }
      } else {

        let error = {
          code: this.status,
          message: this.statusText
        }

        self.ajaxLock = false;
        reject(error);
      }
    }
  }

  component.prototype.renderList = function(suggestions = []) {

    let wrap = this.input.parentNode;
    wrap.style.zIndex = '1';
    let list = wrap.querySelector('.form__autosuggest-list');
    list.innerHTML = '';

    suggestions.forEach(function(val) {
      list.innerHTML += `<span class="form__suggest-span">${val}</span>`;
    });
  }

  window.autosuggestion = componentWrap;

})();
