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

app.directive('viUnitinput', function() {
  return {
    require: 'ngModel',
    link: function(scope, elm, attrs, ctrl) {
      ctrl.$formatters = [];
      ctrl.$parsers = [function(viewValue) {
        return viewValue;
      }];
    }
  };
});

app.factory('UnitModel', function($log) {
  var model = {
    valueIsValid : function(value) {
      return this.unit.valueIsValid(value);  
    }, 
    
    set text(newText) {
      $log.log(this.unit.id +': setting text: '+newText);
      
      var val = parseFloat(newText);
    
      if(this.valueIsValid(val)) {
        this.value = val;  
      }
      
      this._text = newText;
    },
    get text() {
      return this._text;
    },
    
    set value(newValue) {
      $log.log(this.unit.id + ': setting value: '+newValue);

      this._value = newValue;
      
      if(angular.isUndefined(newValue)) {
        this._text = '?';
      } else {
        this._text = parseFloat(newValue.toFixed(this.unit.precision)).toString();
      }
    },
    get value() {
      return this._value;
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
    get step() {
      return 1 / Math.pow(10, this.unit.precision);
    }
  }
  
  model._value = undefined;
  
  return model;
});

app.controller('ConvertCtrl', function($scope, unitSet, UnitModel) {
  var model = {
    unitSet : unitSet,
    units : unitSet.allUnits,
    from : Object.create(UnitModel),
    to : Object.create(UnitModel)
  };
  
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
      newUnit = model.units[0];
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
  
  model.from.unit = model.units[0];
  model.to.unit = model.units[1];
});
