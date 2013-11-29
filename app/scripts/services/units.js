'use strict';

var mod = angular.module('vinolatorWebApp');

mod.service('UnitSet', function() {
  this.unitWithId = function(id) {
    var found;
    
    angular.forEach(this.allUnits, function(value){
      if(angular.equals(id, value.id)) {
        found = value;
        return false;
      }
    });
    
    return found;
  }
  
  this.canConvert = function(fromUnit, toUnit) {
    if(this.allUnits.indexOf(fromUnit) != -1 && this.allUnits.indexOf(toUnit) != -1) {
      return true;
    }
    return false;
  }
});

mod.service('FactorUnitSet', function(UnitSet) {
  var base = Object.create(UnitSet);
  
  base.convertToBaseUnit = function(value, fromUnit) {
    return value * fromUnit.factor;
  }
  
  base.convertFromBaseUnit = function(value, toUnit) {
    return value * 1/toUnit.factor;
  }
  
  base.convert = function(value, fromUnit, toUnit) {
    return base.convertFromBaseUnit(base.convertToBaseUnit(value, fromUnit), toUnit);
  }
  
  return base;
});

mod.factory('Unit', function() {
  var base = {
    precision : 1,
    minValue : 0,
    maxValue : Number.MAX_VALUE,
    valueIsValid : function(value) {
      if(angular.isUndefined(value)) {
        return false;
      }

      return value >= this.minValue && value <= this.maxValue;
    }
  }
  
  return function(config) {
    config.__proto__ = base;
    return config;
  }
});

mod.factory('ArraySourceUnit', function(Unit) {
  var base = new Unit({
      get minValue() {
        return this.values[0];
      },
      get maxValue() {
        return this.values[this.values.length - 1];
      }
    });
    
  return function(config) {
    config.__proto__ = base;
    return config; //angular.extend(Object.create(base), config);
  }
});

mod.factory('ArraySourceUnitSet', function(UnitSet) {
  var base = Object.create(UnitSet);

  base.convert = function(fromValue, fromUnit, toUnit) {
    if(angular.isUndefined(fromUnit) || angular.isUndefined(toUnit) || !fromUnit.valueIsValid(fromValue) || !this.canConvert(fromUnit, toUnit)) {
      return undefined;
    }
    
    var i = 0;
    for(; i < fromUnit.values.length; i++){
      if(fromValue <= fromUnit.values[i]) {
        break;
      }
    }
    
    var fromHere = fromUnit.values[i];
    var toHere = toUnit.values[i];
    
		//matches exactly
		if (fromValue == fromHere) {
			return toHere;
		}
    
    var fromPrev = fromUnit.values[i-1];
    var factor = 1 / ((fromHere - fromPrev) / (fromValue - fromPrev));
    
    var toPrev = toUnit.values[i-1];
    
    return toPrev + ((toHere - toPrev)*factor);
  }
  
  base.convertToBaseUnit = function(value, fromUnit) {
    return this.convert(value, fromUnit, this.baseUnit);
  }
  
  base.convertFromBaseUnit = function(value, toUnit) {
    return this.convert(value, this.baseUnit, toUnit);
  }
    
  return base;
});

mod.service('WVOUnitSet', function(ArraySourceUnitSet, ArraySourceUnit) {
  var base = Object.create(ArraySourceUnitSet);

  base.kmw = new ArraySourceUnit({
    id : '°KMW',
    name : 'Klosterneuburger Mostwaage (Babo)', 
    precision : 2,
    values : [8.5,8.7,8.9,9.1,9.3,9.5,9.7,9.9,10.1,10.3,10.5,10.7,10.9,11.1,11.3,11.5,11.7,11.9,12.1,12.3,12.5,12.7,12.9,13.1,13.3,13.5,13.7,13.9,14.1,14.3,14.5,14.7,14.9,15.0,15.2,15.4,15.6,15.8,16.0,16.2,16.4,16.6,16.8,17.0,17.2,17.3,17.5,17.7,17.9,18.1,18.3,18.5,18.7,18.9,19.0,19.2,19.4,19.6,19.8,20.0,20.2,20.4,20.5,20.7,20.9,21.1,21.3,21.5,21.6,21.8,22.0,22.2,22.4,22.6,22.7,22.9,23.1,23.3,23.5,23.6,23.8,24.0,24.2,24.4,24.5,24.7,24.9,25.1,25.3,25.4,25.6,25.8,26.0,26.1,26.3,26.5,26.7,26.8,27.0,27.2,27.4,27.5,27.7,27.9,28.1,28.2,28.4,28.6,28.8,28.9,29.1]
  });
  base.oechsle = new ArraySourceUnit({
    id : '°Oe',
    name : 'Oechsle',
    values : [40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150]
  });
  base.alc = new ArraySourceUnit({
    id : 'vol%',
    name : 'Alkohol',
    precision : 2,
    values : [4.4,4.5,4.7,4.8,5.0,5.2,5.3,5.5,5.6,5.8,5.9,6.1,6.3,6.4,6.6,6.7,6.9,7.0,7.2,7.3,7.5,7.7,7.8,8.0,8.1,8.3,8.4,8.6,8.8,8.9,9.1,9.2,9.4,9.5,9.7,9.8,10.0,10.2,10.3,10.5,10.6,10.8,10.9,11.1,11.3,11.4,11.6,11.7,11.9,12.0,12.2,12.4,12.5,12.7,12.8,13.0,13.1,13.3,13.4,13.6,13.8,13.9,14.1,14.2,14.4,14.5,14.7,14.8,15.0,15.2,15.3,15.5,15.6,15.8,15.9,16.1,16.3,16.4,16.6,16.7,16.9,17.0,17.2,17.3,17.5,17.7,17.8,18.0,18.1,18.3,18.4,18.6,18.8,18.9,19.1,19.2,19.4,19.5,19.7,19.8,20.0,20.2,20.3,20.5,20.6,20.8,20.9,21.1,21.3,21.4,21.5]
  });
  
  base.baseUnit = base.oechsle;
  base.allUnits = [ base.kmw, base.oechsle, base.alc ];
  
  return base;
});

mod.service('OIVUnitSet', function(ArraySourceUnitSet, ArraySourceUnit, $http) {
  var base = Object.create(ArraySourceUnitSet);

  base.brix = new ArraySourceUnit({
    id : '°Bx',
    name : 'Brix / Balling',
    values : [10, 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8, 10.9, 11, 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 11.8, 11.9, 12, 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 12.8, 12.9, 13, 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7, 13.8, 13.9, 14, 14.1, 14.2, 14.3, 14.4, 14.5, 14.6, 14.7, 14.8, 14.9, 15, 15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 15.7, 15.8, 15.9, 16, 16.1, 16.2, 16.3, 16.4, 16.5, 16.6, 16.7, 16.8, 16.9, 17, 17.1, 17.2, 17.3, 17.4, 17.5, 17.6, 17.7, 17.8, 17.9, 18, 18.1, 18.2, 18.3, 18.4, 18.5, 18.6, 18.7, 18.8, 18.9, 19, 19.1, 19.2, 19.3, 19.4, 19.5, 19.6, 19.7, 19.8, 19.9, 20, 20.1, 20.2, 20.3, 20.4, 20.5, 20.6, 20.7, 20.8, 20.9, 21, 21.1, 21.2, 21.3, 21.4, 21.5, 21.6, 21.7, 21.8, 21.9, 22, 22.1, 22.2, 22.3, 22.4, 22.5, 22.6, 22.7, 22.8, 22.9, 23, 23.1, 23.2, 23.3, 23.4, 23.5, 23.6, 23.7, 23.8, 23.9, 24, 24.1, 24.2, 24.3, 24.4, 24.5, 24.6, 24.7, 24.8, 24.9, 25, 25.1, 25.2, 25.3, 25.4, 25.5, 25.6, 25.7, 25.8, 25.9, 26, 26.1, 26.2, 26.3, 26.4, 26.5, 26.6, 26.7, 26.8, 26.9, 27, 27.1, 27.2, 27.3, 27.4, 27.5, 27.6, 27.7, 27.8, 27.9, 28, 28.1, 28.2, 28.3, 28.4, 28.5, 28.6, 28.7, 28.8, 28.9, 29, 29.1, 29.2, 29.3, 29.4, 29.5, 29.6, 29.7, 29.8, 29.9, 30, 30.1, 30.2, 30.3, 30.4, 30.5, 30.6, 30.7, 30.8, 30.9, 31, 31.1, 31.2, 31.3, 31.4, 31.5, 31.6, 31.7, 31.8, 31.9, 32, 32.1, 32.2, 32.3, 32.4, 32.5, 32.6, 32.7, 32.8, 32.9, 33, 33.1, 33.2, 33.3, 33.4, 33.5, 33.6, 33.7, 33.8, 33.9, 34, 34.1, 34.2, 34.3, 34.4, 34.5, 34.6, 34.7, 34.8, 34.9, 35, 35.1, 35.2, 35.3, 35.4, 35.5, 35.6, 35.7, 35.8, 35.9, 36, 36.1, 36.2, 36.3, 36.4, 36.5, 36.6, 36.7, 36.8, 36.9, 37, 37.1, 37.2, 37.3, 37.4, 37.5, 37.6, 37.7, 37.8, 37.9, 38, 38.1, 38.2, 38.3, 38.4, 38.5, 38.6, 38.7, 38.8, 38.9, 39, 39.1, 39.2, 39.3, 39.4, 39.5, 39.6, 39.7, 39.8, 39.9, 40, 40.1, 40.2, 40.3, 40.4, 40.5, 40.6, 40.7, 40.8, 40.9, 41, 41.1, 41.2, 41.3, 41.4, 41.5, 41.6, 41.7, 41.8, 41.9, 42, 42.1, 42.2, 42.3, 42.4, 42.5, 42.6, 42.7, 42.8, 42.9, 43, 43.1, 43.2, 43.3, 43.4, 43.5, 43.6, 43.7, 43.8, 43.9, 44, 44.1, 44.2, 44.3, 44.4, 44.5, 44.6, 44.7, 44.8, 44.9, 45, 45.1, 45.2, 45.3, 45.4, 45.5, 45.6, 45.7, 45.8, 45.9, 46, 46.1, 46.2, 46.3, 46.4, 46.5, 46.6, 46.7, 46.8, 46.9, 47, 47.1, 47.2, 47.3, 47.4, 47.5, 47.6, 47.7, 47.8, 47.9, 48, 48.1, 48.2, 48.3, 48.4, 48.5, 48.6, 48.7, 48.8, 48.9, 49, 49.1, 49.2, 49.3, 49.4, 49.5, 49.6, 49.7, 49.8, 49.9, 50, 50.1, 50.2, 50.3, 50.4, 50.5, 50.6, 50.7, 50.8, 50.9, 51, 51.1, 51.2, 51.3, 51.4, 51.5, 51.6, 51.7, 51.8, 51.9, 52, 52.1, 52.2, 52.3, 52.4, 52.5, 52.6, 52.7, 52.8, 52.9, 53, 53.1, 53.2, 53.3, 53.4, 53.5, 53.6, 53.7, 53.8, 53.9, 54, 54.1, 54.2, 54.3, 54.4, 54.5, 54.6, 54.7, 54.8, 54.9, 55, 55.1, 55.2, 55.3, 55.4, 55.5, 55.6, 55.7, 55.8, 55.9, 56, 56.1, 56.2, 56.3, 56.4, 56.5, 56.6, 56.7, 56.8, 56.9, 57, 57.1, 57.2, 57.3, 57.4, 57.5, 57.6, 57.7, 57.8, 57.9, 58, 58.1, 58.2, 58.3, 58.4, 58.5, 58.6, 58.7, 58.8, 58.9, 59, 59.1, 59.2, 59.3, 59.4, 59.5, 59.6, 59.7, 59.8, 59.9, 60, 60.1, 60.2, 60.3, 60.4, 60.5, 60.6, 60.7, 60.8, 60.9, 61, 61.1, 61.2, 61.3, 61.4, 61.5, 61.6, 61.7, 61.8, 61.9, 62, 62.1, 62.2, 62.3, 62.4, 62.5, 62.6, 62.7, 62.8, 62.9, 63, 63.1, 63.2, 63.3, 63.4, 63.5, 63.6, 63.7, 63.8, 63.9, 64, 64.1, 64.2, 64.3, 64.4, 64.5, 64.6, 64.7, 64.8, 64.9, 65, 65.1, 65.2, 65.3, 65.4, 65.5, 65.6, 65.7, 65.8, 65.9, 66, 66.1, 66.2, 66.3, 66.4, 66.5, 66.6, 66.7, 66.8, 66.9, 67, 67.1, 67.2, 67.3, 67.4, 67.5, 67.6, 67.7, 67.8, 67.9, 68, 68.1, 68.2, 68.3, 68.4, 68.5, 68.6, 68.7, 68.8, 68.9, 69, 69.1, 69.2, 69.3, 69.4, 69.5, 69.6, 69.7, 69.8, 69.9, 70, 70.1, 70.2, 70.3, 70.4, 70.5, 70.6, 70.7, 70.8, 70.9, 71, 71.1, 71.2, 71.3, 71.4, 71.5, 71.6, 71.7, 71.8, 71.9, 72, 72.1, 72.2, 72.3, 72.4, 72.5, 72.6, 72.7, 72.8, 72.9, 73, 73.1, 73.2, 73.3, 73.4, 73.5, 73.6, 73.7, 73.8, 73.9, 74, 74.1, 74.2, 74.3, 74.4, 74.5, 74.6, 74.7, 74.8, 74.9]
  });
  base.idx = new ArraySourceUnit({
    id : 'idx',
    name : 'Refraktorindex'
  });
  base.d = new ArraySourceUnit({
    id : 'd',
    name : 'Relative Dichte (20/20)',
    precision : 4,
    values : [1.0391, 1.0395, 1.0399, 1.0403, 1.0407, 1.0411, 1.0415, 1.0419, 1.0423, 1.0427, 1.0431, 1.0436, 1.044, 1.0444, 1.0448, 1.0452, 1.0456, 1.046, 1.0464, 1.0468, 1.0472, 1.0477, 1.0481, 1.0485, 1.0489, 1.0493, 1.0497, 1.0501, 1.0506, 1.051, 1.0514, 1.0518, 1.0522, 1.0527, 1.0531, 1.0535, 1.0539, 1.0543, 1.0548, 1.0552, 1.0556, 1.056, 1.0564, 1.0569, 1.0573, 1.0577, 1.0581, 1.0586, 1.059, 1.0594, 1.0598, 1.0603, 1.0607, 1.0611, 1.0616, 1.062, 1.0624, 1.0628, 1.0633, 1.0637, 1.0641, 1.0646, 1.065, 1.0654, 1.0659, 1.0663, 1.0667, 1.0672, 1.0676, 1.068, 1.0685, 1.0689, 1.0693, 1.0698, 1.0702, 1.0707, 1.0711, 1.0715, 1.072, 1.0724, 1.0729, 1.0733, 1.0737, 1.0742, 1.0746, 1.0751, 1.0755, 1.076, 1.0764, 1.0768, 1.0773, 1.0777, 1.0782, 1.0786, 1.0791, 1.0795, 1.08, 1.0804, 1.0809, 1.0813, 1.0818, 1.0822, 1.0827, 1.0831, 1.0836, 1.084, 1.0845, 1.0849, 1.0854, 1.0858, 1.0863, 1.0867, 1.0872, 1.0876, 1.0881, 1.0885, 1.089, 1.0895, 1.0899, 1.0904, 1.0908, 1.0913, 1.0917, 1.0922, 1.0927, 1.0931, 1.0936, 1.094, 1.0945, 1.095, 1.0954, 1.0959, 1.0964, 1.0968, 1.0973, 1.0977, 1.0982, 1.0987, 1.0991, 1.0996, 1.1001, 1.1005, 1.101, 1.1015, 1.1019, 1.1024, 1.1029, 1.1033, 1.1038, 1.1043, 1.1047, 1.1052, 1.1057, 1.1062, 1.1066, 1.1071, 1.1076, 1.108, 1.1085, 1.109, 1.1095, 1.1099, 1.1104, 1.1109, 1.1114, 1.1118, 1.1123, 1.1128, 1.1133, 1.1138, 1.1142, 1.1147, 1.1152, 1.1157, 1.1161, 1.1166, 1.1171, 1.1176, 1.1181, 1.1185, 1.119, 1.1195, 1.12, 1.1205, 1.121, 1.1214, 1.1219, 1.1224, 1.1229, 1.1234, 1.1239, 1.1244, 1.1248, 1.1253, 1.1258, 1.1263, 1.1268, 1.1273, 1.1278, 1.1283, 1.1287, 1.1292, 1.1297, 1.1302, 1.1307, 1.1312, 1.1317, 1.1322, 1.1327, 1.1332, 1.1337, 1.1342, 1.1346, 1.1351, 1.1356, 1.1361, 1.1366, 1.1371, 1.1376, 1.1381, 1.1386, 1.1391, 1.1396, 1.1401, 1.1406, 1.1411, 1.1416, 1.1421, 1.1426, 1.1431, 1.1436, 1.1441, 1.1446, 1.1451, 1.1456, 1.1461, 1.1466, 1.1471, 1.1476, 1.1481, 1.1486, 1.1491, 1.1496, 1.1501, 1.1507, 1.1512, 1.1517, 1.1522, 1.1527, 1.1532, 1.1537, 1.1542, 1.1547, 1.1552, 1.1557, 1.1563, 1.1568, 1.1573, 1.1578, 1.1583, 1.1588, 1.1593, 1.1598, 1.1603, 1.1609, 1.1614, 1.1619, 1.1624, 1.1629, 1.1634, 1.164, 1.1645, 1.165, 1.1655, 1.166, 1.1665, 1.1671, 1.1676, 1.1681, 1.1686, 1.1691, 1.1697, 1.1702, 1.1707, 1.1712, 1.1717, 1.1723, 1.1728, 1.1733, 1.1738, 1.1744, 1.1749, 1.1754, 1.1759, 1.1765, 1.177, 1.1775, 1.178, 1.1786, 1.1791, 1.1796, 1.1801, 1.1807, 1.1812, 1.1817, 1.1823, 1.1828, 1.1833, 1.1839, 1.1844, 1.1849, 1.1855, 1.186, 1.1865, 1.1871, 1.1876, 1.1881, 1.1887, 1.1892, 1.1897, 1.1903, 1.1908, 1.1913, 1.1919, 1.1924, 1.1929, 1.1935, 1.194, 1.1946, 1.1951, 1.1956, 1.1962, 1.1967, 1.1973, 1.1978, 1.1983, 1.1989, 1.1994, 1.2, 1.2005, 1.2011, 1.2016, 1.2022, 1.2027, 1.2032, 1.2038, 1.2043, 1.2049, 1.2054, 1.206, 1.2065, 1.2071, 1.2076, 1.2082, 1.2087, 1.2093, 1.2098, 1.2104, 1.2109, 1.2115, 1.212, 1.2126, 1.2131, 1.2137, 1.2142, 1.2148, 1.2154, 1.2159, 1.2165, 1.217, 1.2176, 1.2181, 1.2187, 1.2192, 1.2198, 1.2204, 1.2209, 1.2215, 1.222, 1.2226, 1.2232, 1.2237, 1.2243, 1.2248, 1.2254, 1.226, 1.2265, 1.2271, 1.2277, 1.2282, 1.2288, 1.2294, 1.2299, 1.2305, 1.2311, 1.2316, 1.2322, 1.2328, 1.2333, 1.2339, 1.2345, 1.235, 1.2356, 1.2362, 1.2368, 1.2373, 1.2379, 1.2385, 1.239, 1.2396, 1.2402, 1.2408, 1.2413, 1.2419, 1.2425, 1.2431, 1.2436, 1.2442, 1.2448, 1.2454, 1.246, 1.2465, 1.2471, 1.2477, 1.2483, 1.2488, 1.2494, 1.25, 1.2506, 1.2512, 1.2518, 1.2523, 1.2529, 1.2535, 1.2541, 1.2547, 1.2553, 1.2558, 1.2564, 1.257, 1.2576, 1.2582, 1.2588, 1.2594, 1.26, 1.2606, 1.2611, 1.2617, 1.2623, 1.2629, 1.2635, 1.2641, 1.2647, 1.2653, 1.2659, 1.2665, 1.2671, 1.2677, 1.2683, 1.2689, 1.2695, 1.2701, 1.2706, 1.2712, 1.2718, 1.2724, 1.273, 1.2736, 1.2742, 1.2748, 1.2754, 1.276, 1.2766, 1.2773, 1.2779, 1.2785, 1.2791, 1.2797, 1.2803, 1.2809, 1.2815, 1.2821, 1.2827, 1.2833, 1.2839, 1.2845, 1.2851, 1.2857, 1.2863, 1.287, 1.2876, 1.2882, 1.2888, 1.2894, 1.29, 1.2906, 1.2912, 1.2919, 1.2925, 1.2931, 1.2937, 1.2943, 1.2949, 1.2956, 1.2962, 1.2968, 1.2974, 1.298, 1.2986, 1.2993, 1.2999, 1.3005, 1.3011, 1.3017, 1.3024, 1.303, 1.3036, 1.3042, 1.3049, 1.3055, 1.3061, 1.3067, 1.3074, 1.308, 1.3086, 1.3092, 1.3099, 1.3105, 1.3111, 1.3118, 1.3124, 1.313, 1.3137, 1.3143, 1.3149, 1.3155, 1.3162, 1.3168, 1.3174, 1.3181, 1.3187, 1.3193, 1.32, 1.3206, 1.3213, 1.3219, 1.3225, 1.3232, 1.3238, 1.3244, 1.3251, 1.3257, 1.3264, 1.327, 1.3276, 1.3283, 1.3289, 1.3296, 1.3302, 1.3309, 1.3315, 1.3322, 1.3328, 1.3334, 1.3341, 1.3347, 1.3354, 1.336, 1.3367, 1.3373, 1.338, 1.3386, 1.3393, 1.3399, 1.3406, 1.3412, 1.3419, 1.3425, 1.3432, 1.3438, 1.3445, 1.3451, 1.3458, 1.3464, 1.3471, 1.3478, 1.3484, 1.3491, 1.3497, 1.3504, 1.351, 1.3517, 1.3524, 1.353, 1.3537, 1.3543, 1.355, 1.3557, 1.3563, 1.357, 1.3576, 1.3583, 1.359, 1.3596, 1.3603, 1.361, 1.3616, 1.3623, 1.363, 1.3636, 1.3643, 1.365, 1.3656, 1.3663, 1.367, 1.3676, 1.3683, 1.369, 1.3696, 1.3703, 1.371, 1.3717, 1.3723, 1.373, 1.3737, 1.3743, 1.375, 1.3757, 1.3764, 1.377, 1.3777, 1.3784, 1.3791, 1.3797, 1.3804, 1.3811, 1.3818, 1.3825, 1.3831, 1.3838, 1.3845, 1.3852, 1.3859, 1.3865, 1.3872, 1.3879, 1.3886, 1.3893, 1.3899, 1.3906]
  });
  base.sugarVol = new ArraySourceUnit({
    id : 'g/L',
    name : 'Gewicht Zucker / Volumen Most',
    values : [82.2, 83.3, 84.3, 85.4, 86.5, 87.5, 88.6, 89.6, 90.7, 91.8, 92.8, 93.9, 95, 96, 97.1, 98.2, 99.3, 100.3, 101.4, 102.5, 103.5, 104.6, 105.7, 106.8, 107.8, 108.9, 110, 111.1, 112.2, 113.2, 114.3, 115.4, 116.5, 117.6, 118.7, 119.7, 120.8, 121.9, 123, 124.1, 125.2, 126.3, 127.4, 128.5, 129.6, 130.6, 131.7, 132.8, 133.9, 135, 136.1, 137.2, 138.3, 139.4, 140.5, 141.6, 142.7, 143.8, 144.9, 146, 147.1, 148.2, 149.3, 150.5, 151.6, 152.7, 153.8, 154.9, 156, 157.1, 158.2, 159.3, 160.4, 161.6, 162.7, 163.8, 164.9, 166, 167.1, 168.3, 169.4, 170.5, 171.6, 172.7, 173.9, 175, 176.1, 177.2, 178.4, 179.5, 180.6, 181.7, 182.9, 184, 185.1, 186.2, 187.4, 188.5, 189.6, 190.8, 191.9, 193, 194.2, 195.3, 196.4, 197.6, 198.7, 199.8, 201, 202.1, 203.3, 204.4, 205.5, 206.7, 207.8, 209, 210.1, 211.3, 212.4, 213.6, 214.7, 215.9, 217, 218.2, 219.3, 220.5, 221.6, 222.8, 223.9, 225.1, 226.2, 227.4, 228.5, 229.7, 230.8, 232, 233.2, 234.3, 235.5, 236.6, 237.8, 239, 240.1, 241.3, 242.5, 243.6, 244.8, 246, 247.1, 248.3, 249.5, 250.6, 251.8, 253, 254.1, 255.3, 256.5, 257.7, 258.8, 260, 261.2, 262.4, 263.6, 264.7, 265.9, 267.1, 268.3, 269.5, 270.6, 271.8, 273, 274.2, 275.4, 276.6, 277.8, 278.9, 280.1, 281.3, 282.5, 283.7, 284.9, 286.1, 287.3, 288.5, 289.7, 290.9, 292.1, 293.3, 294.5, 295.7, 296.9, 298.1, 299.3, 300.5, 301.7, 302.9, 304.1, 305.3, 306.5, 307.7, 308.9, 310.1, 311.3, 312.6, 313.8, 315, 316.2, 317.4, 318.6, 319.8, 321.1, 322.3, 323.5, 324.7, 325.9, 327.2, 328.4, 329.6, 330.8, 332.1, 333.3, 334.5, 335.7, 337, 338.2, 339.4, 340.7, 341.9, 343.1, 344.4, 345.6, 346.8, 348.1, 349.3, 350.6, 351.8, 353, 354.3, 355.5, 356.8, 358, 359.2, 360.5, 361.7, 363, 364.2, 365.5, 366.7, 368, 369.2, 370.5, 371.8, 373, 374.3, 375.5, 376.8, 378, 379.3, 380.6, 381.8, 383.1, 384.4, 385.6, 386.9, 388.1, 389.4, 390.7, 392, 393.2, 394.5, 395.8, 397, 398.3, 399.6, 400.9, 402.1, 403.4, 404.7, 406, 407.3, 408.6, 409.8, 411.1, 412.4, 413.7, 415, 416.3, 417.6, 418.8, 420.1, 421.4, 422.7, 424, 425.3, 426.6, 427.9, 429.2, 430.5, 431.8, 433.1, 434.4, 435.7, 437, 438.3, 439.6, 440.9, 442.2, 443.6, 444.9, 446.2, 447.5, 448.8, 450.1, 451.4, 452.8, 454.1, 455.4, 456.7, 458, 459.4, 460.7, 462, 463.3, 464.7, 466, 467.3, 468.6, 470, 471.3, 472.6, 474, 475.3, 476.6, 478, 479.3, 480.7, 482, 483.3, 484.7, 486, 487.4, 488.7, 490.1, 491.4, 492.8, 494.1, 495.5, 496.8, 498.2, 499.5, 500.9, 502.2, 503.6, 504.9, 506.3, 507.7, 509, 510.4, 511.7, 513.1, 514.5, 515.8, 517.2, 518.6, 519.9, 521.3, 522.7, 524.1, 525.4, 526.8, 528.2, 529.6, 530.9, 532.3, 533.7, 535.1, 536.5, 537.9, 539.2, 540.6, 542, 543.4, 544.8, 546.2, 547.6, 549, 550.4, 551.8, 553.2, 554.6, 556, 557.4, 558.8, 560.2, 561.6, 563, 564.4, 565.8, 567.2, 568.6, 570, 571.4, 572.8, 574.2, 575.6, 577.1, 578.5, 579.9, 581.3, 582.7, 584.2, 585.6, 587, 588.4, 589.9, 591.3, 592.7, 594.1, 595.6, 597, 598.4, 599.9, 601.3, 602.7, 604.2, 605.6, 607, 608.5, 609.9, 611.4, 612.8, 614.2, 615.7, 617.1, 618.6, 620, 621.5, 622.9, 624.4, 625.8, 627.3, 628.7, 630.2, 631.7, 633.1, 634.6, 636, 637.5, 639, 640.4, 641.9, 643.4, 644.8, 646.3, 647.8, 649.2, 650.7, 652.2, 653.7, 655.1, 656.6, 658.1, 659.6, 661, 662.5, 664, 665.5, 667, 668.5, 669.9, 671.4, 672.9, 674.4, 675.9, 677.4, 678.9, 680.4, 681.9, 683.4, 684.9, 686.4, 687.9, 689.4, 690.9, 692.4, 693.9, 695.4, 696.9, 698.4, 699.9, 701.4, 702.9, 704.4, 706, 707.5, 709, 710.5, 712, 713.5, 715.1, 716.6, 718.1, 719.6, 721.1, 722.7, 724.2, 725.7, 727.3, 728.8, 730.3, 731.8, 733.4, 734.9, 736.4, 738, 739.5, 741.1, 742.6, 744.1, 745.7, 747.2, 748.8, 750.3, 751.9, 753.4, 755, 756.5, 758.1, 759.6, 761.2, 762.7, 764.3, 765.8, 767.4, 769, 770.5, 772.1, 773.6, 775.2, 776.8, 778.3, 779.9, 781.5, 783, 784.6, 786.2, 787.8, 789.3, 790.9, 792.5, 794.1, 795.6, 797.2, 798.8, 800.4, 802, 803.6, 805.1, 806.7, 808.3, 809.9, 811.5, 813.1, 814.7, 816.3, 817.9, 819.5, 821.1, 822.7, 824.3, 825.9, 827.5, 829.1, 830.7, 832.3, 833.9, 835.5, 837.1, 838.7, 840.3, 841.9, 843.6, 845.2, 846.8, 848.4, 850, 851.6, 853.3, 854.9, 856.5, 858.1, 859.8, 861.4, 863, 864.7, 866.3, 867.9, 869.5, 871.2, 872.8, 874.5, 876.1, 877.7, 879.4, 881, 882.7, 884.3, 886, 887.6, 889.3, 890.9, 892.6, 894.2, 895.9, 897.5, 899.2, 900.8, 902.5, 904.1, 905.8, 907.5, 909.1, 910.8, 912.5, 914.1, 915.8, 917.5, 919.1, 920.8, 922.5, 924.2, 925.8, 927.5, 929.2, 930.9, 932.6, 934.3, 935.9, 937.6, 939.3, 941, 942.7, 944.4, 946.1, 947.8, 949.5, 951.2, 952.9, 954.6, 956.3]
  });
  base.sugarWeight = new ArraySourceUnit({
    id : 'g/kg',
    name : 'Gewicht Zucker / Gewicht Most',
    values : [79.1, 80.1, 81.1, 82.1, 83.1, 84.1, 85, 86, 87, 88, 89, 90, 91, 92, 92.9, 93.9, 94.9, 95.9, 96.9, 97.9, 98.9, 99.9, 100.8, 101.8, 102.8, 103.8, 104.8, 105.8, 106.8, 107.8, 108.7, 109.7, 110.7, 111.7, 112.7, 113.7, 114.7, 115.6, 116.6, 117.6, 118.6, 119.6, 120.6, 121.6, 122.5, 123.5, 124.5, 125.5, 126.5, 127.5, 128.4, 129.4, 130.4, 131.4, 132.4, 133.4, 134.3, 135.3, 136.3, 137.3, 138.3, 139.3, 140.2, 141.2, 142.2, 143.2, 144.2, 145.1, 146.1, 147.1, 148.1, 149.1, 150, 151, 152, 153, 154, 154.9, 155.9, 156.9, 157.9, 158.9, 159.8, 160.8, 161.8, 162.8, 163.7, 164.7, 165.7, 166.7, 167.6, 168.6, 169.6, 170.6, 171.5, 172.5, 173.5, 174.5, 175.4, 176.4, 177.4, 178.4, 179.3, 180.3, 181.3, 182.3, 183.2, 184.2, 185.2, 186.1, 187.1, 188.1, 189.1, 190, 191, 192, 192.9, 193.9, 194.9, 195.9, 196.8, 197.8, 198.8, 199.7, 200.7, 201.7, 202.6, 203.6, 204.6, 205.5, 206.5, 207.5, 208.4, 209.4, 210.4, 211.3, 212.3, 213.3, 214.2, 215.2, 216.2, 217.1, 218.1, 219.1, 220, 221, 222, 222.9, 223.9, 224.8, 225.8, 226.8, 227.7, 228.7, 229.7, 230.6, 231.6, 232.5, 233.5, 234.5, 235.4, 236.4, 237.3, 238.3, 239.3, 240.2, 241.2, 242.1, 243.1, 244.1, 245, 246, 246.9, 247.9, 248.9, 249.8, 250.8, 251.7, 252.7, 253.6, 254.6, 255.5, 256.5, 257.5, 258.4, 259.4, 260.3, 261.3, 262.2, 263.2, 264.2, 265.1, 266.1, 267, 268, 268.9, 269.9, 270.8, 271.8, 272.7, 273.7, 274.6, 275.6, 276.5, 277.5, 278.5, 279.4, 280.4, 281.3, 282.3, 283.2, 284.2, 285.1, 286.1, 287, 288, 288.9, 289.9, 290.8, 291.8, 292.7, 293.7, 294.6, 295.6, 296.5, 297.5, 298.4, 299.4, 300.3, 301.3, 302.2, 303.2, 304.1, 305, 306, 306.9, 307.9, 308.8, 309.8, 310.7, 311.7, 312.6, 313.6, 314.5, 315.5, 316.4, 317.4, 318.3, 319.2, 320.2, 321.1, 322.1, 323, 324, 324.9, 325.9, 326.8, 327.8, 328.7, 329.6, 330.6, 331.5, 332.5, 333.4, 334.4, 335.3, 336.3, 337.2, 338.1, 339.1, 340, 341, 341.9, 342.9, 343.8, 344.7, 345.7, 346.6, 347.6, 348.5, 349.4, 350.4, 351.3, 352.3, 353.2, 354.2, 355.1, 356, 357, 357.9, 358.9, 359.8, 360.7, 361.7, 362.6, 363.6, 364.5, 365.4, 366.4, 367.3, 368.3, 369.2, 370.1, 371.1, 372, 373, 373.9, 374.8, 375.8, 376.7, 377.7, 378.6, 379.5, 380.5, 381.4, 382.3, 383.3, 384.2, 385.2, 386.1, 387, 388, 388.9, 389.9, 390.8, 391.7, 392.7, 393.6, 394.5, 395.5, 396.4, 397.3, 398.3, 399.2, 400.2, 401.1, 402, 403, 403.9, 404.8, 405.8, 406.7, 407.6, 408.6, 409.5, 410.4, 411.4, 412.3, 413.3, 414.2, 415.1, 416.1, 417, 417.9, 418.9, 419.8, 420.7, 421.7, 422.6, 423.5, 424.5, 425.4, 426.3, 427.3, 428.2, 429.1, 430.1, 431, 431.9, 432.9, 433.8, 434.7, 435.7, 436.6, 437.5, 438.5, 439.4, 440.3, 441.3, 442.2, 443.1, 444.1, 445, 445.9, 446.8, 447.8, 448.7, 449.6, 450.6, 451.5, 452.4, 453.4, 454.3, 455.2, 456.2, 457.1, 458, 458.9, 459.9, 460.8, 461.7, 462.7, 463.6, 464.5, 465.4, 466.4, 467.3, 468.2, 469.2, 470.1, 471, 471.9, 472.9, 473.8, 474.7, 475.7, 476.6, 477.5, 478.4, 479.4, 480.3, 481.2, 482.1, 483.1, 484, 484.9, 485.8, 486.8, 487.7, 488.6, 489.5, 490.5, 491.4, 492.3, 493.2, 494.2, 495.1, 496, 496.9, 497.9, 498.8, 499.7, 500.6, 501.6, 502.5, 503.4, 504.3, 505.2, 506.2, 507.1, 508, 508.9, 509.9, 510.8, 511.7, 512.6, 513.5, 514.5, 515.4, 516.3, 517.2, 518.1, 519.1, 520, 520.9, 521.8, 522.7, 523.7, 524.6, 525.5, 526.4, 527.3, 528.3, 529.2, 530.1, 531, 531.9, 532.8, 533.8, 534.7, 535.6, 536.5, 537.4, 538.3, 539.3, 540.2, 541.1, 542, 542.9, 543.8, 544.8, 545.7, 546.6, 547.5, 548.4, 549.3, 550.2, 551.1, 552.1, 553, 553.9, 554.8, 555.7, 556.6, 557.5, 558.4, 559.4, 560.3, 561.2, 562.1, 563, 563.9, 564.8, 565.7, 566.6, 567.6, 568.5, 569.4, 570.3, 571.2, 572.1, 573, 573.9, 574.8, 575.7, 576.6, 577.5, 578.5, 579.4, 580.3, 581.2, 582.1, 583, 583.9, 584.8, 585.7, 586.6, 587.5, 588.4, 589.3, 590.2, 591.1, 592, 592.9, 593.8, 594.7, 595.6, 596.5, 597.4, 598.3, 599.3, 600.2, 601.1, 602, 602.9, 603.8, 604.7, 605.6, 606.5, 607.4, 608.3, 609.2, 610.1, 611, 611.9, 612.8, 613.7, 614.6, 615.5, 616.3, 617.2, 618.1, 619, 619.9, 620.8, 621.7, 622.6, 623.5, 624.4, 625.3, 626.2, 627.1, 628, 628.9, 629.8, 630.7, 631.6, 632.5, 633.4, 634.3, 635.2, 636.1, 636.9, 637.8, 638.7, 639.6, 640.5, 641.4, 642.3, 643.2, 644.1, 645, 645.9, 646.8, 647.7, 648.5, 649.4, 650.3, 651.2, 652.1, 653, 653.9, 654.8, 655.7, 656.6, 657.5, 658.3, 659.2, 660.1, 661, 661.9, 662.8, 663.7, 664.6, 665.5, 666.3, 667.2, 668.1, 669, 669.9, 670.8, 671.7, 672.6, 673.5, 674.3, 675.2, 676.1, 677, 677.9, 678.8, 679.7, 680.6, 681.4, 682.3, 683.2, 684.1, 685, 685.9, 686.8, 687.7]
  });
  
  base.baseUnit = base.d;
  base.allUnits = [ base.brix, base.d, base.sugarVol, base.sugarWeight ];
  
  /*$http.get('oiv.csv').success(function(data, status, headers, config) {
    var rows = data.split('\n');
    for(var i = 1; i < rows.length; i++) {
      var row = rows[i];
      var cols = row.split(',');
      
      for(var j=0; j < cols.length; j++) {
        var col = parseFloat(cols[j]);

        base.allUnits[j].values.push(col);
      }
    }
    debugger;
  }).error(function(data, status, headers, confi){
    console.log('error');  
  });*/
  return base;
});

mod.service('OIVWVOUnitSet', function(WVOUnitSet, OIVUnitSet, UnitSet) {
  function unitSetForUnit(unit) {
    if(WVOUnitSet.allUnits.indexOf(unit) != -1) {
      return WVOUnitSet;
    }
    return OIVUnitSet;
  }
  
  var base = Object.create(UnitSet);
  angular.extend(base, OIVUnitSet, WVOUnitSet);
  
  base.allUnits = WVOUnitSet.allUnits.concat(OIVUnitSet.allUnits);
  
  base.convert = function(value, fromUnit, toUnit) {
    var fromSet = unitSetForUnit(fromUnit);
    var toSet = unitSetForUnit(toUnit);
    
    if(fromSet === toSet) {
      return fromSet.convert(value, fromUnit, toUnit);
    }
 
    var result;
    var baseValue = fromSet.convertToBaseUnit(value, fromUnit);
    
    if(fromSet === WVOUnitSet && toSet === OIVUnitSet) {
      //oechsle to density
      result = 1 + (baseValue / 1000);
    } else if(fromSet === OIVUnitSet && toSet === WVOUnitSet) {
      //density to oechsle
      result = (baseValue - 1) * 1000;
    }
    
    //base to destination unit
    result = toSet.convertFromBaseUnit(result, toUnit);
    
    return result;
  }
  
  return base;
});

mod.service('AllUnitsSet', function(OIVWVOUnitSet, UnitSet, Unit) {
  var base = Object.create(UnitSet);
  angular.extend(base, OIVWVOUnitSet);
  
  base.baume = new Unit({
    id : '°Bé',
    name : 'Baumé',
    precision : 2
  })
  base.alcVol = new Unit({
    id : 'g/L',
    name : 'Alkohol / Wein',
    precision : 2
  });
  base.allUnits = OIVWVOUnitSet.allUnits.concat( [ base.alcVol, base.baume ] );
  base.sugarUnits = [ base.kmw, base.oechsle, base.d, base.brix, base.baume, base.sugarWeight, base.sugarVol ];
  base.alcUnits = [ base.alc, base.alcVol ];
  
  base.convert = function(value, fromUnit, toUnit) {
    if(OIVWVOUnitSet.canConvert(fromUnit, toUnit)) {
      return OIVWVOUnitSet.convert(value, fromUnit, toUnit);  
    }

    var result = value;
    
    if(fromUnit === base.alcVol) {
      result = value / 7.893;
      
      //TODO: optimize
      if(OIVWVOUnitSet.canConvert(base.alc, toUnit)) {
        result = OIVWVOUnitSet.convert(result, base.alc, toUnit);  
      } else {
        fromUnit = base.alc;
      }
    } else if(fromUnit === base.baume) {
      result = - (145 / (value - 145));
      
      //TODO: optimize
      if(OIVWVOUnitSet.canConvert(base.d, toUnit)) {
        result = OIVWVOUnitSet.convert(result, base.d, toUnit);
      } else {
        fromUnit = base.d;
      }
    }
    
    if(toUnit === base.alcVol) {
      result = OIVWVOUnitSet.convert(result, fromUnit, base.alc);
      result = result * 7.893;
    } else if(toUnit === base.baume) {
      result = OIVWVOUnitSet.convert(result, fromUnit, base.d);
      result = 145 - (145 / result);
    }
    
    return result;
  }
  
  return base;
});

mod.service('WeightUnitSet', function(FactorUnitSet) {
  var base = Object.create(FactorUnitSet);
  
  base.kg = {
    id : 'kg',
    name : 'kilo',
    factor : 1 
  }
  
  base.gram = {
    id : 'g',
    name : 'gram',
    factor : 0.001 
  }
  
  base.tons = {
    id : 't',
    name : 'ton',
    factor : 1000
  }
  
  base.pound = {
    id : 'lb',
    name : 'pound',
    factor : 0.45359237
  }
  
  base.baseUnit = base.kg;
  base.allUnits = [ 
    base.gram,
    base.pound,
    base.kg,
    base.tons
  ];
  
  return base;
});

mod.factory('unitSet', function(AllUnitsSet) {
  return AllUnitsSet;
});

