/*!
 * Piwik - free/libre analytics platform
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

/**
 * Usage:
 * <div piwik-field>
 *
 *     eg <div piwik-field type="select"
 * title="{{ 'SitesManager_Timezone'|translate }}"
 * value="site.timezone"
 * options="timezones"
 * inline-help="test"
 * description=""
 * inline-help=""
 * introduction=""
 * name=""
 * autocomplete="off"
 * disabled="true"></div>
 *
 * You can combine it with "field-condition=''"
 */
(function () {
    angular.module('piwikApp').directive('piwikField', piwikField);

    piwikField.$inject = ['piwik', '$compile'];

    function piwikField(piwik, $compile){

        return {
            restrict: 'A',
            require: '?ngModel',
            scope: {
                uicontrol: '@',
                name: '@',
                value: '@',
                default: '@',
                options: '=',
                description: '@',
                introduction: '@',
                title: '@',
                inlineHelp: '@',
                disabled: '=',
                autocomplete: '@',
                condition: '@'
            },
            template: '<div piwik-form-field="field"></div>',
            link: function(scope, elm, attrs, ctrl) {
                if (!ctrl) {
                    return;
                }

                // view -> model
                scope.$watch('field.value', function (val, oldVal) {
                    if (val !== oldVal) {
                        ctrl.$setViewValue(val);
                    }
                });

                // model -> view
                ctrl.$render = function() {
                    scope.field.value = ctrl.$viewValue;
                };

                // load init value
                ctrl.$setViewValue(scope.field.value);
            },
            controller: function ($scope) {
                var field = {};
                field.uiControl = $scope.uicontrol;
                if (field.uiControl === 'checkbox') {
                    field.type = 'boolean';
                } else {
                    field.type = 'string';
                }
                field.name = $scope.name;
                field.value = $scope.value;
                field.defaultValue = $scope.default;
                field.availableValues = $scope.options;
                field.description = $scope.description;
                field.introduction = $scope.introduction;
                field.inlineHelp = $scope.inlineHelp;
                field.title = $scope.title;
                field.uiControlAttributes = {};
                if (!!$scope.disabled) {
                    field.uiControlAttributes['disabled'] = 'disabled';
                }
                if ($scope.autocomplete) {
                    field.uiControlAttributes['autocomplete'] = $scope.autocomplete;
                }

                $scope.field = field;
            }
        };
    }
})();