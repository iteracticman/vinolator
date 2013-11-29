'use strict';

var app = angular.module('vinolatorWebApp');

app.directive('viUnitvalue', function() {
  return {
    restrict: 'AE',
    scope: {
      model : '=',
      units : '='
    },
    templateUrl: 'views/vi-unitvalue.html'
  }
});

app.directive('viUnitinput', function($log) {
  return {
    require: 'ngModel',
    link: function(scope, elm, attrs, ctrl) {
      ctrl.$parsers.push(function(viewValue) {
        //viewValue doesnt give right test when type='number' and input is no number
        viewValue = elm.val();
        var val = parseFloat(viewValue);
    
        elm.parent().removeClass('has-error');
        
        if(scope.model.valueIsValid(val)){
          return val;
        } else if(viewValue.length > 0) {
          elm.parent().addClass('has-error');
        }
        return undefined;
      });
      
      ctrl.$formatters.push(function(modelValue) {
        modelValue = scope.model.value;
        if(angular.isNumber(modelValue)) {
          elm.parent().removeClass('has-error');
          return parseFloat(modelValue.toFixed(scope.model.unit.precision)).toString(); 
        }
      });
    }
  };
});

app.factory('UnitModel', function($log) {
  var model = {
    valueIsValid : function(value) {
      return this.unit.valueIsValid(value);  
    },
    
    appendCharacter : function(event) {
      var oldVal = $scope.value;
      
      if(angular.isUndefined(oldVal)){
        oldVal = '';
      } else {
        oldVal = oldVal.toString();
      }
      
      var newVal = oldVal + event.target.value;
      
      newVal = parseFloat(newVal);
  
      this.value = newVal;
    },
    
    backspace : function() {
      var oldVal = this.value;
    
      if(angular.isUndefined(oldVal)) {
        oldVal = '';
      } else {
        oldVal = oldVal.toString();
      }
  
      var newVal = oldVal.substring(0, oldVal.length-1);
      
      this.value = newVal;
      $scope.$emit('valueChanged');
    }, 
    activeIfCurrent : function(unit) {
      if(unit == this.unit) {
        return 'active';
      }
      return '';
    },
    mutedIfNotCurrent : function(unit) {
      if(unit != this.unit) {
        return 'text-muted';  
      }
      return '';
    },
    get step() {
      return 1 / Math.pow(10, this.unit.precision);
    }
  }
  
  model._value = undefined;
  
  return model;
});

app.controller('ConvertCtrl', function($scope, unitSet, UnitModel) {
  var unitSelection = [ 'Zucker / Mostgewicht' ].concat(unitSet.sugarUnits).concat([ 'Potentieller Alkoholgehalt ']).concat(unitSet.alcUnits);
  var model = {
    unitSet : unitSet,
    units : unitSelection,
    from : Object.create(UnitModel),
    to : Object.create(UnitModel)
  };
  model.from.defaultUnit = unitSet.oechsle;
  model.to.defaultUnit = unitSet.alc;
  
  $scope.model = model;
  
  var updateOnce = function(fn) {
    if(model.ignoreNextUpdate) {
      model.ignoreNextUpdate = false;
      return;
    }
    model.ignoreNextUpdate = true;
    fn();
  }
  
  var updateToValue = function() {
    updateOnce(function() {
      model.to.value = unitSet.convert(model.from.value, model.from.unit, model.to.unit);
    });
  }
  
  var updateFromValue = function() {
    updateOnce(function() {
      model.from.value = unitSet.convert(model.to.value, model.to.unit, model.from.unit);
    });
  }
  
  var changeUnitIfNecessary = function(srcUnitModel, destUnitModel, previousSrcUnit) {
    if(srcUnitModel.unit != destUnitModel.unit) return;
    
    var newUnit = previousSrcUnit;
    
    if(angular.isUndefined(newUnit)) {
      newUnit = model.defaultUnit;
    }
    destUnitModel.unit = newUnit;
  }
  
  $scope.$watch('model.from.value', updateToValue);
  $scope.$watch('model.to.value', updateFromValue);
  $scope.$watch('model.from.unit', function(newValue, oldValue) {
    changeUnitIfNecessary(model.from, model.to, oldValue);
    updateToValue();
  });
  $scope.$watch('model.to.unit', function(newValue, oldValue) {
    changeUnitIfNecessary(model.to, model.from, oldValue);
    updateToValue();
  });
  
  model.from.unit = model.from.defaultUnit;
  model.to.unit = model.to.defaultUnit;
  model.from.value = 87.6;
});
