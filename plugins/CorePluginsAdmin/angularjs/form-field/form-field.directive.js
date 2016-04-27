/*!
 * Piwik - free/libre analytics platform
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

/**
 * Usage:
 * <div piwik-form-field="{...}">
 */
(function () {
    angular.module('piwikApp').directive('piwikFormField', piwikFormField);

    piwikFormField.$inject = ['piwik', '$timeout'];

    function piwikFormField(piwik, $timeout){

        return {
            restrict: 'A',
            scope: {
                piwikFormField: '=',
                allSettings: '='
            },
            templateUrl: 'plugins/CorePluginsAdmin/angularjs/form-field/form-field.directive.html?cb=' + piwik.cacheBuster,
            compile: function (element, attrs) {

                function evaluateConditionalExpression(scope, field)
                {
                    if (!field.condition) {
                        return;
                    }

                    var values = {};
                    angular.forEach(scope.allSettings, function (setting) {
                        if (setting.value === '0') {
                            values[setting.name] = 0;
                        } else {
                            values[setting.name] = setting.value;
                        }
                    });

                    field.showField = scope.$eval(field.condition, values);
                }

                function hasUiControl(field, uiControlType)
                {
                    return field.uiControl === uiControlType;
                }

                function isSelectControl(field)
                {
                    return hasUiControl(field, 'select') || hasUiControl(field, 'multiselect');
                }

                function hasGroupedValues(availableValues)
                {
                    if (!angular.isObject(availableValues)
                        || angular.isArray(availableValues)) {
                        return false;
                    }

                    var key;
                    for (key in availableValues) {
                        if (Object.prototype.hasOwnProperty.call(availableValues, key)) {
                            if (angular.isObject(availableValues[key])) {
                                return true;
                            } else {
                                return false;
                            }
                        }
                    }

                    return false;
                }

                function formatAvailableValues(availableValues, fieldType)
                {
                    if (!hasGroupedValues(availableValues)) {
                        availableValues = {'': availableValues};
                    }

                    var flatValues = [];
                    angular.forEach(availableValues, function (values, group) {
                        angular.forEach(values, function (value, key) {

                            if (angular.isObject(value) && (value.group || value.key || value.value)){
                                flatValues.push(value);
                                return;
                            }

                            if (fieldType === 'integer' && angular.isString(key)) {
                                key = parseInt(key, 10);
                            }

                            flatValues.push({group: group, key: key, value: value});
                        });
                    });

                    return flatValues;
                }

                return function (scope, element, attrs) {
                    var field = scope.piwikFormField;

                    if (angular.isArray(field.defaultValue)) {
                        field.defaultValue = field.defaultValue.join(',');
                    }

                    if (field.type === 'boolean') {
                        if (field.value && field.value > 0 && field.value !== '0') {
                            field.value = true;
                        } else {
                            field.value = false;
                        }
                    }

                    if (isSelectControl(field) && field.availableValues) {
                        field.availableOptions = formatAvailableValues(field.availableValues, field.type);
                    } else {
                        field.availableOptions = field.availableValues;
                    }

                    field.showField = true;

                    var inlineHelpNode;
                    if (field.inlineHelp.indexOf('#') === 0) {
                        inlineHelpNode = field.inlineHelp;
                        field.inlineHelp = ' '; // we make sure inline help will be shown
                    }

                    if (field.condition && scope.allSettings) {
                        evaluateConditionalExpression(scope, field);

                        for (var key in scope.allSettings) {
                            if(scope.allSettings.hasOwnProperty(key)) {
                                scope.$watchCollection('allSettings[' + key + '].value', function (val, oldVal) {
                                    if (val !== oldVal) {
                                        evaluateConditionalExpression(scope, field);
                                    }
                                });
                            }
                        }

                    }

                    scope.formField = field;

                    scope.$watch('formField.availableValues', function (val, oldVal) {
                        if (val !== oldVal) {
                            if (isSelectControl(scope.formField)) {
                                scope.formField.availableOptions = formatAvailableValues(scope.formField.availableValues, scope.formField.type);
                                element.find('select').material_select();
                            } else {
                                scope.formField.availableOptions = scope.formField.availableValues;
                            }
                        }
                    });

                    $timeout(function () {
                        if (inlineHelpNode) {
                            angular.element(inlineHelpNode).appendTo(element.find('.inline-help'));
                        }

                        if (isSelectControl(field)) {
                            var $select = element.find('select');
                            $select.material_select();

                            scope.$watch('formField.value', function (val, oldVal) {
                                if (val !== oldVal) {
                                    $timeout(function () {
                                        $select.material_select();
                                    });
                                }
                            });

                        } else if (hasUiControl(field, 'textarea')) {
                            element.find('textarea').trigger('autoresize');
                        } else if (hasUiControl(field, 'file')) {

                            // angular doesn't support file input type with ngModel. We implement our own "two way binding"
                            var $file = element.find('[type=file]');

                            $file.on('change', function () {
                                scope.formField.value = $(this).val();
                            });

                            scope.$watch('formField.value', function (val, oldVal) {
                                if (val !== oldVal && val === '') {
                                    $file.val('');
                                }
                            });

                        } else {
                            Materialize.updateTextFields();
                        }
                    });
                };
            }
        };
    }
})();