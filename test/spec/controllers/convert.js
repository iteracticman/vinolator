'use strict';

describe('convert', function() {
  beforeEach(module('vinolatorWebApp'));
    
  describe('directives', function() {
    beforeEach(inject(function($rootScope, $controller, $httpBackend) {
      $scope = $rootScope.$new();
      $controller('ConvertCtrl', { $scope : $scope });
      model = $scope.model;
  
      $scope.$digest();
    }));
    /* TODO: test directive
    it('texts should have reasonable number of fractions', function() {
      model.from.unit = model.unitSet.brix;
      model.to.unit = model.unitSet.oechsle;
      model.from.value = 10.9;
      
      $scope.$digest();
      
      expect(model.to.value).toBe(42.69999999999996);
      expect(model.to.text).toBe('42.7');
      
      model.to.unit = model.unitSet.kmw;
      model.ignoreNextUpdate = false;
      $scope.$digest();
      
      expect(model.to.value).toBe(9.039999999999992);
      expect(model.to.text).toBe('9');
      
      model.to.value = 9.342;
      model.ignoreNextUpdate = false;
      $scope.$digest();
      
      expect(model.from.value).toBe(11.252500000000017);
      expect(model.from.text).toBe('11.3');
      
      model.from.unit = model.unitSet.d;
      model.to.value = 14.1;
      model.ignoreNextUpdate = false;
      $scope.$digest();
      expect(model.from.value).toBe(1.068);
      expect(model.from.text).toBe('1.068');   
      
      model.from.unit = model.unitSet.oechsle;
      model.to.unit = model.unitSet.d;
      model.from.value = 53.34;
      $scope.$digest();
      
      expect(model.to.value).toBe(1.05334);
      expect(model.to.text).toBe('1.0533');
      //TODO: test ',' 
    }); */
  });

  describe('controller', function(){
    var $scope;
    var model;
    
    beforeEach(inject(function($rootScope, $controller, $httpBackend) {
      $scope = $rootScope.$new();
      $controller('ConvertCtrl', { $scope : $scope });
      model = $scope.model;
  
      $scope.$digest();
    }));
    
    /*it('should be prepopulated', inject(function(units) {
      expect($scope.fromUnit).toBe(units.allUnits[0]);
      expect($scope.fromValue).toBe(1);
      
      expect($scope.toUnit).toBe(units.allUnits[1]);
      
      expect($scope.toValue).toBe(units.convert(1, $scope.fromUnit, $scope.toUnit));
    }));*/
    
    it('changing fromValue should change toValue', function() {
      var oldTo = model.to.value;
  
      model.from.value = model.from.unit.minValue+1;
      $scope.$digest();
      
      expect(model.to.value).not.toBe(oldTo);
    });
    
    it('changing toValue should change fromValue', function() {
      model.from.value = model.from.unit.minValue+1;
      $scope.$digest();
      
      var oldFrom = model.from.value;
      
      model.to.value = model.to.unit.minValue+1;
      $scope.$digest();
      
      expect(model.from.value).not.toBe(oldFrom);
    });
    
    it('changing fromUnit should change toValue', function() {
      model.from.value = model.from.unit.minValue+0.1;
      $scope.$digest();
      
      var oldTo = model.to.value;
      
      model.from.unit = model.units[2];
      $scope.$digest();
      
      expect(model.to.value).not.toBe(oldTo);
    });
    
    it('changing toUnit should change toValue', function() {
      model.from.value = model.from.unit.minValue+1;
      $scope.$digest();
      
      var oldTo = model.to.value;
      
      model.to.unit = model.units[2];
      $scope.$digest();
      
      expect(model.to.value).not.toBe(oldTo);
    });
    
    it('entering invalid fromValue should change toValue to undefined', function(){
      model.from.value = -1;
      
      $scope.$digest();
      expect(model.to.value).toBe(undefined);
    });
    
    it('changing fromValue should not change fromValue', function() {
      model.from.unit = model.unitSet.kmw;
      model.from.value = model.from.unit.minValue+1.0009;
      var oldFrom = model.from.value;
      $scope.$digest();
      
      expect(model.from.value).toBe(oldFrom);
    });
    
    it('changing toValue should not change toValue', function() {
      model.to.unit = model.unitSet.kmw;
      $scope.$digest();
      
      model.to.value = model.to.unit.minValue+1.0009;
      var oldTo = model.to.value;
      $scope.$digest();
      
      expect(model.to.value).toBe(oldTo);
    });
  });
});
