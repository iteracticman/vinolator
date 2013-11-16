'use strict';

describe('Service units: ', function() {
  var units;
  
  beforeEach(module('vinolatorWebApp'));

  describe('weight units', function() {
    beforeEach(inject(function(WeightUnitSet){
      units = WeightUnitSet;
    }));    
  
    it('base unit should be kg', inject(function() {
      expect(units.baseUnit.id).toEqual('kg');
      expect(units.baseUnit.factor).toEqual(1);
    }));
    
    it('unitWithId should return correct unit', inject(function() {
      expect(units.unitWithId('g').id).toEqual('g');
      expect(units.unitWithId('lb').name).toEqual('pound');
      expect(units.unitWithId('xxx')).toBeUndefined();
    }));
    
    it('2.05 kg is 2050 g', inject(function() {
      var gram = units.unitWithId('g');
      var kg = units.unitWithId('kg');
      
      expect(units.convert(2.05, kg, gram)).toBe(2050);
    }));
  });
  
  describe('WVO units', function() {
    beforeEach(inject(function(WVOUnitSet){
      units = WVOUnitSet;
    }));
    
    it('kmw should be between 8.5 and 29.1', function(){
      expect(units.kmw.minValue).toBe(8.5);
      expect(units.kmw.maxValue).toBe(29.1);
    });
    
    it('invalid kmw should be undefined', function(){
      expect(units.kmw.valueIsValid(1)).toBe(false);
      expect(units.convert(1, units.kmw, units.oechsle)).toBeUndefined();
      
      expect(units.kmw.valueIsValid(30)).toBe(false);
      expect(units.convert(30, units.kmw, units.oechsle)).toBeUndefined();
    });
    
    it('8.5 kmw should be 40 oe', function(){
      expect(units.kmw.valueIsValid(8.5)).toBe(true);
      expect(units.convert(8.5, units.kmw, units.oechsle)).toBe(40);
    });
    
    it('9.5 kmw should be 45 oe', function(){
      expect(units.kmw.valueIsValid(9.5)).toBe(true);
      expect(units.convert(9.5, units.kmw, units.oechsle)).toBe(45);
    });
    
    it('converting something undefined should return undefined', function() {
      expect(units.kmw.valueIsValid(undefined)).toBe(false);
      expect(units.convert(undefined, units.kmw, units.oechsle)).toBeUndefined();
      
      expect(units.convert(9.5, undefined, units.oechsle)).toBeUndefined();
      expect(units.convert(9.5, units.kmw, undefined)).toBeUndefined();
    });
  });
  
  describe('OIV units', function() {
    beforeEach(inject(function(OIVUnitSet){
      units = OIVUnitSet;
    }));
    
    it('10.25 brix should be...', function(){
      expect(units.brix.valueIsValid(10.25)).toBe(true);
      expect(units.convert(10.25, units.brix, units.d)).toBe(1.0401);
      expect(units.convert(10.25, units.brix, units.sugarVol)).toBe(84.85);
      expect(units.convert(10.25, units.brix, units.sugarWeight)).toBe(81.6);
    });
  });
  
  describe('OIVWVOUnitSet', function() {
    beforeEach(inject(function(OIVWVOUnitSet){
      units = OIVWVOUnitSet;
    }));
    
    it('should contain all units', function() {
      expect(units.allUnits.length).toBe(7);
    });
    
    it('should convert within subsets', function() {
      expect(units.convert(10.25, units.brix, units.d)).toBe(1.0401);
      expect(units.convert(9.5, units.kmw, units.oechsle)).toBe(45);
    });
    
    it('should convert between oechsle and density', function() {
      expect(units.convert(77.5, units.oechsle, units.d)).toBe(1.0775);
      expect(units.convert(1.0775, units.d, units.oechsle)).toBeCloseTo(77.5);
    });
    
    it('should convert between kmw and density', function() {
      expect(units.convert(15.9, units.kmw, units.d)).toBe(1.0775);
      expect(units.convert(1.0775, units.d, units.kmw)).toBeCloseTo(15.9);
    });
    
    it('should convert between brix and oechsle', function() {
      expect(units.convert(22.2, units.brix, units.oechsle)).toBeCloseTo(91.7);
      expect(units.convert(91.7, units.oechsle, units.brix)).toBeCloseTo(22.2);
    });
    
    it('should convert between brix and kmw', function() {
      expect(units.convert(22.2, units.brix, units.kmw)).toBeCloseTo(18.64);
      expect(units.convert(18.64, units.kmw, units.brix)).toBeCloseTo(22.2);
    });
  });
  
  describe('AllUnitsSet', function() {
    beforeEach(inject(function(AllUnitsSet){
      units = AllUnitsSet;
    }));
    
    it('should contain all units', function() {
      expect(units.allUnits.length).toBe(9);
    });
    
    it('should convert within subsets', function() {
      expect(units.convert(22.2, units.brix, units.oechsle)).toBeCloseTo(91.7);
      expect(units.convert(91.7, units.oechsle, units.brix)).toBeCloseTo(22.2);
    });
    
    it('should convert between alcVol and alc', function() {
      expect(units.convert(50.99, units.alcVol, units.alc)).toBeCloseTo(6.46);
      expect(units.convert(6.46, units.alc, units.alcVol)).toBeCloseTo(50.99);
    });
    
    it('should convert between alcVol and kmw', function() {
      expect(units.convert(50.99, units.alcVol, units.kmw)).toBeCloseTo(11.16);
      expect(units.convert(11.16, units.kmw, units.alcVol)).toBeCloseTo(50.99);
    });
    
    it('should convert between baume and d', function() {
      expect(units.convert(7.34, units.baume, units.d)).toBeCloseTo(1.0533);
      expect(units.convert(1.0533, units.d, units.baume)).toBeCloseTo(7.34);
    });
    
    it('should convert between baume and kmw', function() {
      expect(units.convert(7.34, units.baume, units.kmw)).toBeCloseTo(11.16);
      expect(units.convert(11.16, units.kmw, units.baume)).toBeCloseTo(7.34);
    });
    
    it('should convert between baume and alcVol', function() {
      expect(units.convert(7.34, units.baume, units.alcVol)).toBeCloseTo(51.0199);
      expect(units.convert(51.0199, units.alcVol, units.baume)).toBeCloseTo(7.34);
    });
  });
});
