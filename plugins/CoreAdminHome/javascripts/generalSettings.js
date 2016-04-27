/*!
 * Piwik - free/libre analytics platform
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

function saveCoreAdminHomeSettings(action, params) {

    var ajaxHandler = new ajaxHelper();
    ajaxHandler.setLoadingElement();
    ajaxHandler.addParams({format: 'json2'}, 'POST');
    ajaxHandler.addParams(params, 'POST');
    ajaxHandler.addParams({
        module: 'API',
        method: 'CoreAdminHome.' + action
    }, 'GET');
    ajaxHandler.setCallback(function () {

        var UI = require('piwik/UI');
        var notification = new UI.Notification();
        notification.show(_pk_translate('CoreAdminHome_SettingsSaveSuccess'), {context: 'success'});
        notification.scrollToNotification();

    });
    ajaxHandler.send();
}

var CoreAdminHome = {
    generalSettings: {
        saveArchiveSettings: function () {

            var enableBrowserTriggerArchiving = $('input[name=enableBrowserTriggerArchiving]:checked').val();
            var todayArchiveTimeToLive = $('#todayArchiveTimeToLive').val();

            saveCoreAdminHomeSettings('setArchiveSettings', {
                enableBrowserTriggerArchiving: enableBrowserTriggerArchiving,
                todayArchiveTimeToLive: todayArchiveTimeToLive
            });
        },
        addTrustedHost: function (e) {
            e.preventDefault();

            // append new row to the table
            var trustedHostSettings = $('#trustedHostSettings');
            trustedHostSettings.find('ul').append(trustedHostSettings.find('li:last').clone());
            trustedHostSettings.find('li:last input').val('').focus();
            return false;
        },
        removeTrustedHost: function (e) {
            e.preventDefault();
            $(e.target).parents('li').first().remove();
            return false;
        },
        saveTrustedHosts: function () {

            var trustedHosts = [];
            $('input[name=trusted_host]').each(function () {
                trustedHosts.push($(this).val());
            });

            var doSubmit = function () {
                saveCoreAdminHomeSettings('setTrustedHosts', {trustedHosts: trustedHosts});
            };

            piwikHelper.modalConfirm('#confirmTrustedHostChange', {yes: doSubmit});
        }
    }
};
