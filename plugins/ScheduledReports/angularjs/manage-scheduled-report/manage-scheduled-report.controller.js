/*!
 * Piwik - free/libre analytics platform
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */
(function () {
    angular.module('piwikApp').controller('ManageScheduledReportController', ManageScheduledReportController);

    ManageScheduledReportController.$inject = ['piwik'];

    function ManageScheduledReportController(piwik) {
        // remember to keep controller very simple. Create a service/factory (model) if needed

        var self = this;

        function resetParameters(reportType, report)
        {
            if (resetReportParametersFunctions && resetReportParametersFunctions[reportType]) {
                resetReportParametersFunctions[reportType](report)
            }
        }

        function formSetEditReport(idReport) {
            var report = {
                'type': ReportPlugin.defaultReportType,
                'format': ReportPlugin.defaultReportFormat,
                'description': '',
                'period': ReportPlugin.defaultPeriod,
                'hour': ReportPlugin.defaultHour,
                'reports': []
            };

            if (idReport > 0) {
                report = ReportPlugin.reportList[idReport];
                $('#report_submit').val(ReportPlugin.updateReportString);
            } else {
                $('#report_submit').val(ReportPlugin.createReportString);
                resetParameters(report.type, report);
            }

            $('[name=reportsList] input').prop('checked', false);

            var key;
            for (key in report.reports) {
                $('.' + report.type + ' [report-unique-id=' + report.reports[key] + ']').prop('checked', 'checked');
            }

            report['format' + report.type] = report.format;

            updateReportParametersFunctions[report.type](report);

            self.report = report;

            self.editingReportId = idReport;
        }

        function getReportAjaxRequest(idReport, defaultApiMethod) {
            var parameters = {};
            piwikHelper.lazyScrollTo(".emailReports>h2", 400);
            parameters.module = 'API';
            parameters.method = defaultApiMethod;
            if (idReport == 0) {
                parameters.method = 'ScheduledReports.addReport';
            }
            parameters.format = 'json';
            return parameters;
        }

        function fadeInOutSuccessMessage(selector, message) {

            var UI = require('piwik/UI');
            var notification = new UI.Notification();
            notification.show(message, {
                placeat: selector,
                context: 'success',
                noclear: true,
                type: 'toast',
                style: {display: 'inline-block', marginTop: '10px'},
                id: 'usersManagerAccessUpdated'
            });

            piwikHelper.refreshAfter(2);
        }

        // Click Add/Update Submit
        this.submitReport = function () {
            var idReport = this.editingReportId;
            var apiParameters = getReportAjaxRequest(idReport, 'ScheduledReports.updateReport');
            apiParameters.idReport = idReport;
            apiParameters.description = this.report.description;
            apiParameters.idSegment = this.report.idsegment;
            apiParameters.reportType = this.report.type;
            apiParameters.reportFormat = this.report['format' + this.report.type];

            var period = self.report.period;
            var hour = self.report.hour;

            var reports = [];
            $('[name=reportsList].' + apiParameters.reportType + ' input:checked').each(function () {
                reports.push($(this).attr('report-unique-id'));
            });
            if (reports.length > 0) {
                apiParameters.reports = reports;
            }

            apiParameters.parameters = getReportParametersFunctions[this.report.type](this.report);

            var ajaxHandler = new ajaxHelper();
            ajaxHandler.addParams(apiParameters, 'POST');
            ajaxHandler.addParams({period: period}, 'GET');
            ajaxHandler.addParams({hour: hour}, 'GET');
            ajaxHandler.redirectOnSuccess();
            ajaxHandler.setLoadingElement();
            if (idReport) {
                ajaxHandler.setCallback(function (response) {

                    fadeInOutSuccessMessage('#reportUpdatedSuccess', _pk_translate('ScheduledReports_ReportUpdated'));
                });
            }
            ajaxHandler.send(true);
            return false;
        };

        this.changedReportType = function (newVal, oldVal) {
            if (oldVal !== newVal && newVal) {
                resetParameters(newVal, self.report);
            }
        };

        // Email now
        this.sendReportNow = function (idReport) {
            var parameters = getReportAjaxRequest(idReport, 'ScheduledReports.sendReport');
            parameters.idReport = idReport;
            parameters.force = true;

            var ajaxHandler = new ajaxHelper();
            ajaxHandler.addParams(parameters, 'POST');
            ajaxHandler.setLoadingElement();
            ajaxHandler.setCallback(function (response) {
                fadeInOutSuccessMessage('#reportSentSuccess', _pk_translate('ScheduledReports_ReportSent'));
            });
            ajaxHandler.send(true);
        };

        // Delete Report
        this.deleteReport = function (idReport) {
            function onDelete() {
                var parameters = getReportAjaxRequest(idReport, 'ScheduledReports.deleteReport');
                parameters.idReport = idReport;

                var ajaxHandler = new ajaxHelper();
                ajaxHandler.addParams(parameters, 'POST');
                ajaxHandler.redirectOnSuccess();
                ajaxHandler.setLoadingElement();
                ajaxHandler.send(true);
            }

            piwikHelper.modalConfirm('#confirm', {yes: onDelete});
        };

        this.showListOfReports = function () {
            this.showReportsList = true;
            this.showReportForm = false;
            piwik.helper.hideAjaxError();
        };

        this.showAddEditForm = function () {
            this.showReportsList = false;
            this.showReportForm = true;
        };

        this.createReport = function () {
            this.showAddEditForm();
            formSetEditReport(/*idReport = */0);
        }

        this.editReport = function (reportId) {
            this.showAddEditForm();
            formSetEditReport(reportId);
        };

        this.showListOfReports();
    }
})();