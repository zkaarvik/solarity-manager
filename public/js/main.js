//Declare the module
var solarityManager = angular.module('solarityManager', ['deviceServices']);

//Configure module

solarityManager.controller('MainController', function($scope) {
	$scope.buttonModel = true;
});

solarityManager.controller('DeviceTableController', function($scope, $rootScope, Device) {
	$scope.devices = [];
	
	

	$scope.refreshDevices = function() {
		Device.query(function(response) {
			$scope.devices = response;
		});
	};

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

	$scope.onDeletePressed = function(event) {
		this.device.isEditMode = false;
		this.device.$delete({id:this.device._id},
			function(response) {
				//Remove the device from the list
				var deviceIndex = $scope.devices.indexOf(response);
				if(deviceIndex > -1) $scope.devices.splice(deviceIndex, 1)
			}, function (err) {
				//Handle error.. tbd
		});
	};

	//Init actions
	$scope.refreshDevices();
	$rootScope.$on('refreshDeviceTable', function(event, args) {
		$scope.refreshDevices();
	})
});

solarityManager.controller('NewDeviceModalController', function($scope, $rootScope, Device) {
	$scope.newDevice = {
		device_id: "",
		stop: ""
	};

	$scope.onSavePressed = function(event) {
		Device.save($scope.newDevice, 
			function(response) {
				$rootScope.$emit('refreshDeviceTable', {});
				$('#newDeviceModal').modal('hide')
			}, function(err){
				//Handle error.. For now assume device ID is duplicated
				$('#newDeviceFormDeviceID').addClass('has-error');
		});
	};
});