var deviceServices = angular.module('deviceServices', ['ngResource']);

deviceServices.factory('Device', ['$resource',
	function($resource){
		return $resource('api/devices/:id', {}, {
			query: {method:'GET', isArray:true},
			update: {method:'PUT'}
		});
	}
]);