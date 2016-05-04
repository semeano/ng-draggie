(function () {

	'use strict';

	var dependencies = ['ng-draggie'];

	angular.module('demodraggie', dependencies)

		.constant('APPOINTMENTS', [
				{ id: '1', name: 'Mac development', pos: [0, 0], length: 1 },
				{ id: '2', name: 'Beerbash', pos: [0, 0], length: 1 },
				{ id: '3', name: 'Team meeting', pos: [0, 0], length: 1 },
				{ id: '4', name: 'Test Tesla 3', pos: [0, 0], length: 1 },
				{ id: '5', name: 'SCRUM meeting', pos: [0, 0], length: 1 },
				{ id: '6', name: 'Flight to London', pos: [0, 0], length: 1 }
			])

		.controller('MainCtrl', function ($scope, $timeout, APPOINTMENTS) {

			// Draggie options
			$scope.options = {
				grid: [150, 48],
				offset: [0, 2],
				padding: [5, 8]
			};

			// Drag-and-drop events
			$scope.events = {
				dragStop: function () { checkOverlap(); },
				resizeEnd: function () { checkOverlap(); }
			};

			// Appointments
			$scope.appointments = APPOINTMENTS;

			this.newAppointment = newAppointment;
			this.editAppointment = editAppointment;
			this.saveAppointment = saveAppointment;

			// Initial run
			function init() {
				$timeout(checkOverlap);
			}

			///

			// New appointment
			function newAppointment(event) {
				// Get cursor position
				var initialX = event.clientX;

				var appointment;
				var appointmentAdded = false;

				// Resize move
				$(window).on('mousemove', function (event) {
					if (angular.isUndefined(appointment)) {
						// Get cursor position
						var x = Math.floor(event.clientX / ($scope.options.grid[0] + $scope.options.offset[0]));
						var y = Math.floor(event.clientY / ($scope.options.grid[1] + $scope.options.offset[1]));
						// Create appointment
						appointment = { id: $scope.appointments.length.toString(), name: '- empty -', pos: [x, y], length: 1, edit: false };
						$scope.appointments.push(appointment);
						$scope.$apply();
						appointmentAdded = true;
					}

					var cursorOffset = event.clientX - initialX;

					if (cursorOffset > $scope.options.grid[0] / 2) {
						appointment.length++;
						initialX += $scope.options.grid[0];
						$scope.$apply();
					}
					else if (cursorOffset < -($scope.options.grid[0] / 2) && appointment.length > 1) {
						appointment.length--;
						initialX -= $scope.options.grid[0];
						$scope.$apply();
					}

					event.stopPropagation();
					event.preventDefault();
				});

				// Resize stop
				$(window).on('mouseup', function (event) {
					$(this).off('mousedown');
					$(window).off('mousemove');
					$(window).off('mouseup');
					event.stopPropagation();
				});
			}

			// Edit appointment
			function editAppointment(event) {
				var input = $(event.currentTarget).children('input');
				$timeout(function () {
					$(input).focus();
				});
			}

			// Save appointment
			function saveAppointment(event) {
				$(event.currentTarget).parent().scrollLeft(0);
			}

			// Check overlap
			function checkOverlap() {
				var matrix = [];
				$.each($('.draggie'), function (index, draggie) {
					var x = (parseInt($(draggie).css('left').replace(/[^-\d\.]/g, '')) - $scope.options.padding[0]) / ($scope.options.grid[0] + $scope.options.offset[0]);
					var y = (parseInt($(draggie).css('top').replace(/[^-\d\.]/g, '')) - $scope.options.padding[1]) / ($scope.options.grid[1] + $scope.options.offset[1]);
					var l = (parseInt($(draggie).css('width').replace(/[^-\d\.]/g, '')) - 109) / $scope.options.grid[0] + 1;

					// Check overlap
					var overlaps = false;
					var moveBelow = false;
					while (overlaping(matrix, x, y, l)) {
						overlaps = true;
						if (y > 0 && !moveBelow) {
							y--;
						}
						else {
							y++;
							moveBelow = true;
						}
					}

					if (overlaps) {
						var element = $(draggie);
						element.css('top', y * ($scope.options.grid[1] + $scope.options.offset[1]) + $scope.options.padding[1] + 'px');
					}

					// Set ocupied positions
					for (var j = 0; j < l; j++) {
						matrix.push({ x: x+j, y: y });
					}
				});
			}

			// Overlaping function
			function overlaping(matrix, x, y, l) {
				return angular.isDefined(_.find(matrix, function(pos) { return pos.x >= x && pos.x <= (x+l-1) && pos.y === y; }));
			}

			init();

		});

})();
