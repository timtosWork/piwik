/*!
 * Piwik - free/libre analytics platform
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

var CoreAdminHome = {
    generalSettings: {
        saveArchiveSettings: function () {

            var enableBrowserTriggerArchiving = $('input[name=enableBrowserTriggerArchiving]:checked').val();
            var todayArchiveTimeToLive = $('#todayArchiveTimeToLive').val();

            var ajaxHandler = new ajaxHelper();
            ajaxHandler.setLoadingElement();
            ajaxHandler.addParams({
                format: 'json2',
                enableBrowserTriggerArchiving: enableBrowserTriggerArchiving,
                todayArchiveTimeToLive: todayArchiveTimeToLive
            }, 'POST');
            ajaxHandler.addParams({
                module: 'CoreAdminHome',
                action: 'setArchiveSettings'
            }, 'GET');
            ajaxHandler.withTokenInUrl();
            ajaxHandler.setCallback(function () {

                var UI = require('piwik/UI');
                var notification = new UI.Notification();
                notification.show(_pk_translate('CoreAdminHome_SettingsSaveSuccess'), {context: 'success'});
                notification.scrollToNotification();

            });
            ajaxHandler.send();
        }
    }
};

function sendGeneralSettingsAJAX() {
    var trustedHosts = [];
    $('input[name=trusted_host]').each(function () {
        trustedHosts.push($(this).val());
    });

    var ajaxHandler = new ajaxHelper();
    ajaxHandler.setLoadingElement();
    ajaxHandler.addParams({
        format: 'json',
        useCustomLogo: isCustomLogoEnabled(),
        trustedHosts: JSON.stringify(trustedHosts)
    }, 'POST');
    ajaxHandler.addParams({
        module: 'CoreAdminHome',
        action: 'setGeneralSettings'
    }, 'GET');
    ajaxHandler.withTokenInUrl();
    ajaxHandler.redirectOnSuccess();
    ajaxHandler.send(true);
}
function showCustomLogoSettings(value) {
    if (value == 1) {
        // Refresh custom logo only if we're going to display it
        refreshCustomLogo();
    }
}
function isCustomLogoEnabled() {
    return $('input[name="useCustomLogo"]:checked').size() ? '1' : 0;
}

function refreshCustomLogo() {
    var selectors = ['#currentLogo', '#currentFavicon'];
    var index;
    for (index = 0; index < selectors.length; index++) {
        var imageDiv = $(selectors[index]);
        if (imageDiv && imageDiv.data("src") && imageDiv.data("srcExists")) {
            var logoUrl = imageDiv.data("src");
            imageDiv.attr("src", logoUrl + "?" + (new Date()).getTime());
        }
    }
}

$(document).ready(function () {
    var originalTrustedHostCount = $('input[name=trusted_host]').length;

    showCustomLogoSettings(isCustomLogoEnabled());
    $('.generalSettingsSubmit').click(function () {
        var doSubmit = function () {
            sendGeneralSettingsAJAX();
        };

        var hasTrustedHostsChanged = false,
            hosts = $('input[name=trusted_host]');
        if (hosts.length != originalTrustedHostCount) {
            hasTrustedHostsChanged = true;
        }
        else {
            hosts.each(function () {
                hasTrustedHostsChanged |= this.defaultValue != this.value;
            });
        }

        // if trusted hosts have changed, make sure to ask for confirmation
        if (hasTrustedHostsChanged) {
            piwikHelper.modalConfirm('#confirmTrustedHostChange', {yes: doSubmit});
        }
        else {
            doSubmit();
        }
    });

    $('input[name=useCustomLogo]').click(function () {
        showCustomLogoSettings($(this).val());
    });
    $('input').keypress(function (e) {
            var key = e.keyCode || e.which;
            if (key == 13) {
                $('.generalSettingsSubmit').click();
            }
        }
    );

    $("#logoUploadForm").submit(function (data) {
        var submittingForm = $(this);
        var isSubmittingLogo = ($('#customLogo').val() != '')
        var isSubmittingFavicon = ($('#customFavicon').val() != '')
        $('.uploaderror').fadeOut();
        var frameName = "upload" + (new Date()).getTime();
        var uploadFrame = $("<iframe name=\"" + frameName + "\" />");
        uploadFrame.css("display", "none");
        uploadFrame.load(function (data) {
            setTimeout(function () {
                var frameContent = $(uploadFrame.contents()).find('body').html();
                frameContent = $.trim(frameContent);

                if ('0' === frameContent) {
                    $('.uploaderror').show();
                }
                else {
                    // Upload succeed, so we update the images availability
                    // according to what have been uploaded
                    if (isSubmittingLogo) {
                        $('#currentLogo').data("srcExists", true)
                    }
                    if (isSubmittingFavicon) {
                        $('#currentFavicon').data("srcExists", true)
                    }
                    refreshCustomLogo();
                }

                if ('1' === frameContent || '0' === frameContent) {
                    uploadFrame.remove();
                }
            }, 1000);
        });
        $("body:first").append(uploadFrame);
        submittingForm.attr("target", frameName);
    });

    $('#customLogo,#customFavicon').change(function () {
        $("#logoUploadForm").submit();
        $(this).val('');
    });

    // trusted hosts event handling
    var trustedHostSettings = $('#trustedHostSettings');
    trustedHostSettings.on('click', '.remove-trusted-host', function (e) {
        e.preventDefault();
        $(this).parent('li').remove();
        return false;
    });
    trustedHostSettings.find('.add-trusted-host').click(function (e) {
        e.preventDefault();

        // append new row to the table
        trustedHostSettings.find('ul').append(trustedHostSettings.find('li:last').clone());
        trustedHostSettings.find('li:last input').val('').focus();
        return false;
    });

});
