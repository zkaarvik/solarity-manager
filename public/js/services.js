var deviceServices = angular.module('deviceServices', ['ngResource']);

deviceServices.factory('Device', ['$resource',
	function($resource){
		return $resource('api/devices', {}, {
			query: {method:'GET', isArray:true}
		});
	}
]);