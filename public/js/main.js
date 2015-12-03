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

	$scope.onEditPressed = function(event) {
		this.device.isEditMode = true;
		this.device._oldStop = this.device.stop;
	};

	$scope.onSavePressed = function(event) {
		this.device.isEditMode = false;

		//Remove temp property
		delete this.device._oldStop;

		//Save new stop. PUT requests to devices return old object and angular automatically overwrites with the old stop number
		var newId = this.device.stop;

		this.device.$update({id:this.device._id}, 
			function(response) {
				response.stop = newId;
			}, function (err) {
				//Handle error.. tbd
		});
	};

	$scope.onCancelPressed = function(event) {
		this.device.isEditMode = false;
		this.device.stop = this.device._oldStop;
	};
});