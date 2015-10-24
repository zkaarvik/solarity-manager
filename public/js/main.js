//Declare the module
var solarityManager = angular.module('solarityManager', ['ui.bootstrap', 'deviceServices']);

//Configure module

solarityManager.controller('MainController', function($scope) {
	$scope.buttonModel = true;
});

solarityManager.controller('DeviceTableController', function($scope, Device) {
	$scope.devices = [];
	
	//console.log(Device.query());
	Device.query(function(response) {
		$scope.devices = response;
	});
});