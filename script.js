function Validator(options) {
  
  function getParent(element, selector){
    while(element.parentElement){
      if(element.parentElement.matches(selector))
          return element.parentElement;
        element = element.parentElement
    }
  }

  var selectorRules ={}
  // hàm validate form
  function validate(inputElement, rule){

    // var errorElement = getParent(inputElement, '.form-group');

    // var errorElement = inputElement.closest(options.formGroup).querySelector(options.errorSelector)
    var errorElement = getParent(inputElement,options.formGroup).querySelector(options.errorSelector)
    var errorMessage 
    //get rules of selector
    var rules = selectorRules[rule.selector];
    //  var errorMessage = rules(inputElement.value)
    //loop in rules and check;
    for(let index = 0 ; index < rules.length; index++){
        switch(inputElement.type){
          case 'radio':
          case 'checkbox':
            // console.log((formElement.querySelector(rule.selector+ ":checked")))
            errorMessage = rules[index](formElement.querySelector(rule.selector+ ":checked"))
            break;
          default:
            errorMessage = rules[index](inputElement.value)
        }
        if(errorMessage) break;
     }
    if(errorMessage){
      errorElement.innerText = errorMessage
       inputElement.closest(options.formGroup).classList.add("invalid")
    }else{
      errorElement.innerText = ""
       inputElement.closest(options.formGroup).classList.remove("invalid")
    }
    return errorMessage
  }
  // lấy element của form cần validate
  var formElement = document.querySelector(options.form);

  if(formElement){
    options.rules.forEach(function(rule){
      //save rule for input
      if(Array.isArray(selectorRules[rule.selector])){
        selectorRules[rule.selector].push(rule.test);
      }
      else{
        selectorRules[rule.selector] = [rule.test];
      }
      // selectorRules[rule.selector] = rule.test;
      
      var inputElements = formElement.querySelectorAll(rule.selector)
      Array.from(inputElements).forEach(function(inputElement){
        if(inputElement){
          //xử lý trường hợp blur khỏi input
          inputElement.onblur = function(){
           validate(inputElement, rule)
          }
          // xử lý trường hợp người dùng nhập vào input  
          inputElement.oninput = function(){
            var errorElement =  inputElement.closest(options.formGroup).querySelector(options.errorSelector)
  
            errorElement.innerText = ""
             inputElement.closest(options.formGroup).classList.remove("invalid")
            } 
        }
      })
      
    })
     console.log(selectorRules)

     //validate formsubmit
     formElement.onsubmit = function(e){
      e.preventDefault();
      var isFormValid = true;
      options.rules.forEach(function(rule){
        var inputElement = formElement.querySelector(rule.selector)
        var isValid = validate(inputElement,rule)
        if(!!isValid){
          isFormValid = false;
        }
      })
      
      if(isFormValid) {
        if(typeof options.onSubmit === "function"){
          var inputElementValue = formElement.querySelectorAll("[name]:not([diable]");
          var formValue = Array.from(inputElementValue).reduce(function(values,input){
              switch(input.type){
                case "checkbox":
                   if(!input.matches(':checked')){
                    values[input.name] = '';
                    return values;
                   }
                   if(!Array.isArray(values[input.name])){
                      values[input.name] = []
                    }
                  values[input.name].push(input.value)
                  break;
                case "radio": 
                  values[input.name] = formElement.querySelector('input[name="' + input.name+'"]:checked').value;
                break;
                // case "file":
                //   // values[input.name] = input.;
                //   break;
                default :
                  values[input.name] = input.value;
              }
              return values;
            }, {})
          options.onSubmit(formValue)
        }
        else{
          formElement.submit();
        }
      }
     
    }
      
  }
}

Validator.isRequired = function(selector, message) {
      return {
        selector:selector,
        test: function(value){
          return value ? undefined : message|| "Please enter this field"
        }
      }
}

Validator.isEmail = function(selector,message){
      return{
        selector:selector,
        test:function(value){
          const regex =
          /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
          return regex.test(value)? undefined : message|| "email invalid"
        }
      }
}

Validator.minLength = function (selector,min, message){
    return {
      selector:selector,
      test:function(value){
        return value.length >= min ? undefined : message ||`Password khong duoc it hon ${min} ky tu`;
      }
    }
}

Validator.isConfirmPassword = function (selector,password,message){
  return {
    selector: selector,
    test:function(value){
      return value === password() ? undefined : message || "Password doesn't match"
    }
  }
}