/*!
 * Piwik - free/libre analytics platform
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

/**
 * Usage:
 * <div piwik-content-block>
 */
(function () {
    angular.module('piwikApp').directive('piwikContentBlock', piwikContentBlock);

    piwikContentBlock.$inject = ['piwik'];

    function piwikContentBlock(piwik){

        return {
            restrict: 'A',
            replace: true,
            transclude: true,
            scope: {
                contentTitle: '@',
                feature: '@',
                helpUrl: '@',
                helpText: '@'
            },
            templateUrl: 'plugins/CoreHome/angularjs/content-block/content-block.directive.html?cb=' + piwik.cacheBuster,
            controllerAs: 'contentBlock',
            compile: function (element, attrs) {

                return function (scope, element, attrs) {
                    if (scope.feature && (scope.feature===true || scope.feature ==='true')) {
                        scope.feature = scope.contentTitle;
                    }
                };
            }
        };
    }
})();