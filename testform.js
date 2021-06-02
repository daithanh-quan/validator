function Validator(FormSelector) {
  function getParent(element, selector) {
    while (element.parentElement) {
      if (element.parentElement.matches(selector)) {
        return element.parentElement
      }
      element = element.parentElement
    }
  }

  var formRule = {}
  var validatorRules = {
    Required: function (value) {
      return value ? undefined : 'Vui lòng nhập trường này'
    },
    Email: function (value) {
      var regex =
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
      return regex.test(value) ? undefined : 'Vui lòng nhập email này'
    },
    min: function (min) {
      return function (value) {
        return value.length >= min
          ? undefined
          : `Vui lòng nhập ít nhất ${min} kí tự`
      }
    },
  }

  var formElement = document.querySelector(FormSelector)
  if (formElement) {
    var inputs = formElement.querySelectorAll('[name][rules]')
    for (var input of inputs) {
      var rules = input.getAttribute('rules').split('|')
      for (var rule of rules) {
        var ruleInfo
        var ruleHasValue = rule.includes(':')
        if (ruleHasValue) {
          ruleInfo = rule.split(':')
          rule = ruleInfo[0]
        }
        var ruleFunc = validatorRules[rule]
        if (ruleHasValue) {
          ruleFunc = ruleFunc(ruleInfo[1])
        }

        if (Array.isArray(formRule[input.name])) {
          formRule[input.name].push(ruleFunc)
        } else {
          formRule[input.name] = [ruleFunc]
        }
      }
      input.onblur = handleValidate
      input.oninput = handleChange
    }
    function handleValidate(event) {
      var rules = formRule[event.target.name]
      var errorMessage
      rules.some(function (rule) {
        errorMessage = rule(event.target.value)
        return errorMessage
      })
      if (errorMessage) {
        var formGroup = getParent(event.target, '.form-group')
        if (formGroup) {
          var formMessage = formGroup.querySelector('.form-message')
          if (formMessage) {
            formMessage.innerText = errorMessage
            formGroup.classList.add('invalid')
          }
        }
      }
      return !errorMessage
    }
    function handleChange(event) {
      var formGroup = getParent(event.target, '.form-group')
      if (formGroup.classList.contains('invalid')) {
        formGroup.classList.remove('invalid')
        var formMessage = formGroup.querySelector('.form-message')
        if (formMessage) {
          formMessage.innerText = ''
        }
      }
    }
  }
  formElement.onsubmit = function (event) {
    event.preventDefault()
    var inputs = formElement.querySelectorAll('[name][rules]')
    var isValid
    for (var input of inputs) {
      if (!handleValidate({ target: input })) {
        isValid = false
      }
      if (isValid) {
        formElement.submit()
      }
    }
  }
}
