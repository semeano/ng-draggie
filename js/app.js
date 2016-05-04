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
				offset: [100, 50],
				padding: [5, 4]
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

				// Get grid position
				var x = Math.floor(event.clientX / ($scope.options.grid[0] + $scope.options.offset[0]));
				var y = Math.floor(event.clientY / ($scope.options.grid[1] + $scope.options.offset[1]));

				var appointmentLength = 1;
				var appointmentAdded = false;

				// Resize move
				$(window).on('mousemove', function (event) {
					if (!appointmentAdded) {
						addNewAppointment(x, y, appointmentLength);
						appointmentAdded = true;
					}

					var cursorOffset = event.clientX - initialX;
					console.log(cursorOffset);

					if (cursorOffset > $scope.options.grid[0]) {
						initialX += $scope.options.grid[0];
						appointmentLength++;
						$scope.appointments.pop();
						addNewAppointment(x, y, appointmentLength);
					}
					else if (cursorOffset < -($scope.options.grid[0]) && appointmentLength > 1) {
						initialX -= $scope.options.grid[0];
						appointmentLength--;
						$scope.appointments.pop();
						addNewAppointment(x, y, appointmentLength);
					}

					event.stopPropagation();
					event.preventDefault();
				});

				// Resize stop
				$(window).on('mouseup', function (event) {
					$(this).off('mousedown');
					$(window).off('mousemove');
					$(window).off('mouseup');
					checkOverlap();
					event.stopPropagation();
				});
			}

			// Add new appointment
			function addNewAppointment(x, y, length) {
				var newAppointment = { id: $scope.appointments.length.toString(), name: '- empty -', pos: [x, y], length: length };
				$scope.appointments.push(newAppointment);
				$scope.$apply();
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
					var x = (parseInt($(draggie).css('left').replace(/[^-\d\.]/g, '')) - $scope.options.padding[0] - $scope.options.offset[0]) / ($scope.options.grid[0]);
					var y = (parseInt($(draggie).css('top').replace(/[^-\d\.]/g, '')) - $scope.options.padding[1] - $scope.options.offset[1]) / ($scope.options.grid[1]);
					var l = (parseInt($(draggie).css('width').replace(/[^-\d\.]/g, '')) + $scope.options.padding[0] * 2) / $scope.options.grid[0];

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
						element.css('top', y * $scope.options.grid[1] + $scope.options.padding[1] + $scope.options.offset[1] + 'px');
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
