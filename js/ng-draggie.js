(function () {

	'use strict';

	angular.module('ng-draggie', [])

		.directive('ngDraggie', function () {

			// Linker function
			function linker(scope, element) {
				setPosition(scope, element);
				setDragAndDropEvents(scope, element);
				setResizeEvent(scope, element);
				setSaveEvent(scope, element);
			}

			// Set element position
			function setPosition(scope, element) {
				$(element).css('position', 'absolute');
				$(element).css('left', scope.pos[0] * scope.options.grid[0] + scope.options.offset[0] + scope.options.margin[0] + 'px');
				$(element).css('top', scope.pos[1] * scope.options.grid[1] + scope.options.offset[1] + scope.options.margin[1] + 'px');
				$(element).css('width', scope.length * scope.options.grid[0] - scope.options.margin[0] * 2 + 'px');
				$(element).css('height', scope.options.grid[1] - scope.options.margin[1] * 2 + 'px');
			}

			// Set drag-and-drop events
			function setDragAndDropEvents(scope, element) {
				// Drag start
				$(element).on('mousedown', function (event) {
					// Set higher z-index
					$(this).css('z-index', '1');

					// Get cursor position
					var initialX = event.clientX;
					var initialY = event.clientY;

					// Call drag start directive event
					if (scope.events && scope.events.dragStart) {
						scope.events.dragStart(element);
					}

					// Drag move (snap to grid)
					var move = { left: 0, top: 0};
					$(window).on('mousemove', function (event) {
						// X axis
						var cursorXOffset = event.clientX - initialX;
						if (cursorXOffset > scope.options.grid[0]) {
							move.left += scope.options.grid[0];
							initialX += scope.options.grid[0];
						}
						else if (cursorXOffset < -(scope.options.grid[0])) {
							move.left -= scope.options.grid[0];
							initialX -= scope.options.grid[0];
						}

						// Y axis
						var cursorYOffset = event.clientY - initialY;
						if (cursorYOffset > scope.options.grid[1]) {
							move.top += scope.options.grid[1];
							initialY += scope.options.grid[1];
						}
						else if (cursorYOffset < -(scope.options.grid[1])) {
							move.top -= scope.options.grid[1];
							initialY -= scope.options.grid[1];
						}

						// Set transform
						$(element).css('transform', 'translate3d(' + move.left + 'px, ' + move.top + 'px, 0px)');

						// Call drag move directive event
						if (scope.events && scope.events.dragMove) {
							scope.events.dragMove(element);
						}

						event.stopPropagation();
					});

					// Drag stop
					$(window).on('mouseup', function (event) {
						// Unbind events
						$(this).off('mousedown');
						$(window).off('mousemove');
						$(window).off('mouseup');

						// Clear transform
						if ($(element).css('transform') !== 'none') {
							var currentLeft = parseInt($(element).css('left').replace(/[^-\d\.]/g, ''));
							var translateLeft = parseInt($(element).css('transform').substring(7).replace(')', '').split(',')[4].replace(/[^-\d\.]/g, ''));
							$(element).css('left', currentLeft + translateLeft + 'px');
							var currentTop = parseInt($(element).css('top').replace(/[^-\d\.]/g, ''));
							var translateTop = parseInt($(element).css('transform').substring(7).replace(')', '').split(',')[5].replace(/[^-\d\.]/g, ''));
							$(element).css('top', currentTop + translateTop + 'px');
							$(element).css('transform', '');
						}

						// Clear z-index
						$(element).css('z-index', '');

						// Call drag stop directive event
						if (scope.events && scope.events.dragStop) {
							scope.events.dragStop(element);
						}

						event.stopPropagation();
					});

					event.stopPropagation();
					event.preventDefault();
				});
			}

			// Set resize events
			function setResizeEvent(scope, element) {
				// Resize start
				$(element).find('.resizeHandle').on('mousedown', function (event) {
					// Set higher z-index
					$(element).css('z-index', '1');

					// Get cursor position
					var initialX = event.clientX;

					// Resize move
					$(window).on('mousemove', function (event) {
						var cursorOffset = event.clientX - initialX;
						if (cursorOffset > scope.options.grid[0] / 2) {
							$(element).width($(element).width() + scope.options.grid[0]);
							initialX += scope.options.grid[0];
						}
						else if (cursorOffset < -(scope.options.grid[0] / 2) && $(element).width() > scope.options.grid[0]) {
							$(element).width($(element).width() - scope.options.grid[0]);
							initialX -= scope.options.grid[0];
						}
					});

					// Resize stop
					$(window).on('mouseup', function (event) {
						$(this).off('mousedown');
						$(window).off('mousemove');
						$(window).off('mouseup');

						// Clear z-index
						$(element).css('z-index', '');

						// Resize end
						if (scope.events && scope.events.resizeEnd) {
							scope.events.resizeEnd(element);
						}

						event.stopPropagation();
					});

					event.stopPropagation();
					event.preventDefault();
				});
			}

			// Set save event (on Enter key press)
			function setSaveEvent(scope, element) {
				$(element).find('input').on('keypress', function (event) {
					if (event.keyCode === 13) {
						this.blur();

						// Call save directive event
						if (scope.events && scope.events.save) {
							scope.events.save(element);
						}
					}
				});
			}

			return {
				restrict: 'A',
				link: linker,
				scope: {
					options: '=',
					events: '=',
					pos: '=',
					length: '='
				}
			};
	});

})();
