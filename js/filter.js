/**
 * Analytics
 *
 * This file is licensed under the Affero General Public License version 3 or
 * later. See the LICENSE.md file.
 *
 * @author Marcel Scherello <audioplayer@scherello.de>
 * @copyright 2020 Marcel Scherello
 */
/** global: OCA */
/** global: OCP */
/** global: OC */
/** global: table */
/** global: Chart */
/** global: cloner */

'use strict';

/**
 * @namespace OCA.Analytics.Filter
 */
OCA.Analytics.Filter = {
    optionTextsArray: {
        'EQ': t('analytics', 'equal to'),
        'GT': t('analytics', 'greater than'),
        'LT': t('analytics', 'less than'),
        'LIKE': t('analytics', 'contains'),
        'IN': t('analytics', 'list of values'),
    },

    openDrilldownDialog: function () {
        let drilldownRows = '';
        let filterDimensions = JSON.parse(document.getElementById('filterDimensions').value);
        let filterOptions = JSON.parse(document.getElementById('filterOptions').value);
        for (let i = 0; i < Object.keys(filterDimensions).length; i++) {
            let checkboxStatus = filterOptions.drilldown[Object.keys(filterDimensions)[i]] === false ? '' : 'checked';
            drilldownRows = drilldownRows + '<div style="display: table-row;">'
                + '<div style="display: table-cell;">'
                + Object.values(filterDimensions)[i]
                + '</div>'
                + '<div style="display: table-cell;">'
                + '<input type="checkbox" id="drilldownColumn' + [i] + '" class="checkbox" name="drilldownColumn" value="' + Object.keys(filterDimensions)[i] + '" ' + checkboxStatus + '>'
                + '<label for="drilldownColumn' + [i] + '"> </label>'
                + '</div>'
                + '<div style="display: table-cell;">'
                + '<input type="checkbox" id="drilldownRow' + [i] + '" class="checkbox" name="drilldownRow" value="' + Object.keys(filterDimensions)[i] + '" disabled>'
                + '<label for="drilldownRow' + [i] + '"> </label>'
                + '</div>'
                + '</div>';
        }

        document.body.insertAdjacentHTML('beforeend',
            '<div id="analytics_dialog_overlay" class="oc-dialog-dim"></div>'
            + '<div id="analytics_dialog_container" class="oc-dialog" style="position: fixed;">'
            + '<div id="analytics_dialog">'
            + '<a class="oc-dialog-close" id="btnClose"></a>'
            + '<h2 class="oc-dialog-title" style="display:flex;margin-right:30px;">'
            + t('analytics', 'Change drilldown')
            + '</h2>'
            + '<div class="table" style="display: table;">'

            + '<div style="display: table-row;">'
            + '<div style="display: table-cell; width: 150px;">'
            + '</div>'
            + '<div style="display: table-cell; width: 50px;">'
            + '<img src="img/column.svg" style="height: 20px;" alt="column">'
            + '</div>'
            + '<div style="display: table-cell; width: 50px;">'
            + '<img src="img/row.svg" style="height: 20px;" alt="row">'
            + '</div>'
            + '</div>'
            + drilldownRows
            + '</div>'
            + '<div class="oc-dialog-buttonrow boutons" id="buttons">'
            + '<a class="button primary" id="drilldownDialogGo">' + t('analytics', 'OK') + '</a>'
            + '<a class="button primary" id="drilldownDialogCancel">' + t('analytics', 'Cancel') + '</a>'
            + '</div>'
        );

        document.getElementById("btnClose").addEventListener("click", OCA.Analytics.Filter.close);
        document.getElementById("drilldownDialogCancel").addEventListener("click", OCA.Analytics.Filter.close);
        document.getElementById("drilldownDialogGo").addEventListener("click", OCA.Analytics.Filter.processDrilldownDialog);
    },

    processDrilldownDialog: function () {
        let filterOptions = JSON.parse(document.getElementById('filterOptions').value);
        filterOptions.drilldown = {};

        let drilldownColumns = document.getElementsByName('drilldownColumn')
        for (let i = 0; i < drilldownColumns.length; i++) {
            let dimension = drilldownColumns[i].value;
            if (drilldownColumns[i].checked === false) {
                filterOptions.drilldown[dimension] = false;
            }
        }
        document.getElementById('filterOptions').value = JSON.stringify(filterOptions);
        OCA.Analytics.Filter.close();
        OCA.Analytics.Backend.getData();
    },

    openFilterDialog: function () {
        document.body.insertAdjacentHTML('beforeend',
            '<div id="analytics_dialog_overlay" class="oc-dialog-dim"></div>'
            + '<div id="analytics_dialog_container" class="oc-dialog" style="position: fixed;">'
            + '<div id="analytics_dialog">'
            + '<a class="oc-dialog-close" id="btnClose"></a>'
            + '<h2 class="oc-dialog-title" style="display:flex;margin-right:30px;">'
            + t('analytics', 'Add filter')
            + '</h2>'
            + '<div class="table" style="display: table;">'
            + '<div style="display: table-row;">'
            + '<div style="display: table-cell; width: 50px;"></div>'
            + '<div style="display: table-cell; width: 80px;"></div>'
            + '<div style="display: table-cell; width: 100px;">'
            + '<label for="filterDialogDimension">' + t('analytics', 'Filter by') + '</label>'
            + '</div>'
            + '<div style="display: table-cell; width: 100px;">'
            + '<label for="filterDialogOption">' + t('analytics', 'Operator') + '</label>'
            + '</div>'
            + '<div style="display: table-cell;">'
            + '<label for="filterDialogValue">' + t('analytics', 'Value') + '</label>'
            + '</div>'
            + '</div>'
            + '<div style="display: table-row;">'
            + '<div style="display: table-cell;">'
            + '<img src="img/filteradd.svg" alt="filter">'
            + '</div>'
            + '<div style="display: table-cell;">'
            + '<select id="filterDialogType" class="checkbox" disabled>'
            + '<option value="and">' + t('analytics', 'and') + '</option>'
            + '</select>'
            + '</div>'
            + '<div style="display: table-cell;">'
            + '<select id="filterDialogDimension" class="checkbox">'
            + '</select>'
            + '</div>'
            + '<div style="display: table-cell;">'
            + '<select id="filterDialogOption" class="checkbox">'
            + '</select>'
            + '</div>'
            + '<div style="display: table-cell;">'
            + '<input type="text" id="filterDialogValue">'
            + '</div></div></div>'
            + '<div class="oc-dialog-buttonrow boutons" id="buttons">'
            + '<a class="button primary" id="filterDialogGo">' + t('analytics', 'Add') + '</a>'
            + '<a class="button primary" id="filterDialogCancel">' + t('analytics', 'Cancel') + '</a>'
            + '</div>'
        );

        let dimensionSelectOptions;
        let filterDimensions = JSON.parse(document.getElementById('filterDimensions').value);
        for (let i = 0; i < Object.keys(filterDimensions).length; i++) {
            dimensionSelectOptions = dimensionSelectOptions + '<option value="' + Object.keys(filterDimensions)[i] + '">' + Object.values(filterDimensions)[i] + '</option>';
        }
        document.getElementById('filterDialogDimension').innerHTML = dimensionSelectOptions;

        let optionSelectOptions;
        for (let i = 0; i < Object.keys(OCA.Analytics.Filter.optionTextsArray).length; i++) {
            optionSelectOptions = optionSelectOptions + '<option value="' + Object.keys(OCA.Analytics.Filter.optionTextsArray)[i] + '">' + Object.values(OCA.Analytics.Filter.optionTextsArray)[i] + '</option>';
        }
        document.getElementById('filterDialogOption').innerHTML = optionSelectOptions;

        document.getElementById("btnClose").addEventListener("click", OCA.Analytics.Filter.close);
        document.getElementById("filterDialogCancel").addEventListener("click", OCA.Analytics.Filter.close);
        document.getElementById("filterDialogGo").addEventListener("click", OCA.Analytics.Filter.processFilterDialog);
        document.getElementById('filterDialogValue').addEventListener('keydown', function (event) {
            if (event.key === 'Enter') {
                OCA.Analytics.Filter.processFilterDialog();
            }
        });

    },

    processFilterDialog: function () {
        let filterOptions = JSON.parse(document.getElementById('filterOptions').value);
        let dimension = document.getElementById('filterDialogDimension').value;
        filterOptions.filter[dimension].enabled = 'true';
        filterOptions.filter[dimension].option = document.getElementById('filterDialogOption').value;
        filterOptions.filter[dimension].value = document.getElementById('filterDialogValue').value;
        document.getElementById('filterOptions').value = JSON.stringify(filterOptions);
        OCA.Analytics.Filter.close();
        OCA.Analytics.Backend.getData();
        OCA.Analytics.Filter.refreshFilterVisualisation();
    },

    refreshFilterVisualisation: function () {
        document.getElementById('filterVisualisation').innerHTML = '';
        let filterDimensions = JSON.parse(document.getElementById('filterDimensions').value);
        let filterOptions = JSON.parse(document.getElementById('filterOptions').value);
        for (let filterDimension of Object.keys(filterOptions.filter)) {
            if (filterOptions.filter[filterDimension].enabled === 'true') {
                let optionText = OCA.Analytics.Filter.optionTextsArray[filterOptions.filter[filterDimension].option];
                let span = document.createElement('span');
                span.innerText = filterDimensions[filterDimension] + ' ' + optionText + ' ' + filterOptions.filter[filterDimension].value;
                span.classList.add('filterVisualizationItem');
                span.id = filterDimension;
                span.addEventListener('click', OCA.Analytics.Filter.removeFilter)
                document.getElementById('filterVisualisation').appendChild(span);
            }
        }
    },

    removeFilter: function (evt) {
        let filterDimension = evt.target.id;
        let filterOptions = JSON.parse(document.getElementById('filterOptions').value);
        filterOptions.filter[filterDimension] = {};
        document.getElementById('filterOptions').value = JSON.stringify(filterOptions);
        OCA.Analytics.Backend.getData();
        OCA.Analytics.Filter.refreshFilterVisualisation();
    },

    openChartOptionsDialog: function () {
        let drilldownRows = '';
        let dataOptions;
        try {
            dataOptions = JSON.parse(OCA.Analytics.currentReportData.options.dataoptions);
        } catch (e) {
            dataOptions = '';
        }
        let distinctCategories = OCA.Analytics.dataDistinctCategories;

        // get the default chart type to preset the drop downs
        let defaultChartType = OCA.Analytics.chartTypeMapping[OCA.Analytics.currentReportData.options.chart];

        for (let i = 0; i < Object.keys(distinctCategories).length; i++) {
            drilldownRows = drilldownRows + '<div style="display: table-row;">'
                + '<div style="display: table-cell;">'
                + Object.values(distinctCategories)[i]
                + '</div>'
                + '<div style="display: table-cell;">'
                + '<select id="optionsYAxis' + [i] + '" name="optionsYAxis">'
                + '<option value="primary" ' + OCA.Analytics.Filter.checkOption(dataOptions, i, 'yAxisID', 'primary', 'primary') + '>Left</option>'
                + '<option value="secondary" ' + OCA.Analytics.Filter.checkOption(dataOptions, i, 'yAxisID', 'secondary', 'primary') + '>Right</option>'
                + '</select>'
                + '</div>'
                + '<div style="display: table-cell;">'
                + '<select id="optionsChartType' + [i] + '" name="optionsChartType">'
                + '<option value="line" ' + OCA.Analytics.Filter.checkOption(dataOptions, i, 'type', 'line', defaultChartType) + '>Line</option>'
                + '<option value="bar" ' + OCA.Analytics.Filter.checkOption(dataOptions, i, 'type', 'bar', defaultChartType) + '>Bar</option>'
                + '</select>'
                + '</div>'
                + '</div>';
        }

        document.body.insertAdjacentHTML('beforeend',
            '<div id="analytics_dialog_overlay" class="oc-dialog-dim"></div>'
            + '<div id="analytics_dialog_container" class="oc-dialog" style="position: fixed;">'
            + '<div id="analytics_dialog">'
            + '<a class="oc-dialog-close" id="btnClose"></a>'
            + '<h2 class="oc-dialog-title" style="display:flex;margin-right:30px;">'
            + t('analytics', 'Change Chart Options')
            + '</h2>'
            + '<div class="table" style="display: table;">'

            + '<div style="display: table-row;">'
            + '<div style="display: table-cell; width: 150px;">Dataseries'
            + '</div>'
            + '<div style="display: table-cell; width: 150px;">Y-Axis'
            + '</div>'
            + '<div style="display: table-cell; width: 150px;">Type'
            + '</div>'
            + '</div>'
            + drilldownRows
            + '</div>'
            + '<div class="oc-dialog-buttonrow boutons" id="buttons">'
            + '<a class="button primary" id="drilldownDialogGo">' + t('analytics', 'OK') + '</a>'
            + '<a class="button primary" id="drilldownDialogCancel">' + t('analytics', 'Cancel') + '</a>'
            + '</div>'
        );

        document.getElementById("btnClose").addEventListener("click", OCA.Analytics.Filter.close);
        document.getElementById("drilldownDialogCancel").addEventListener("click", OCA.Analytics.Filter.close);
        document.getElementById("drilldownDialogGo").addEventListener("click", OCA.Analytics.Filter.processChartOptionsDialog);
    },

    processChartOptionsDialog: function () {
        let dataOptions = OCA.Analytics.currentReportData.options.dataoptions;
        dataOptions === '' ? dataOptions = [] : dataOptions;
        let chartOptions = OCA.Analytics.currentReportData.options.chartoptions;
        chartOptions === '' ? chartOptions = {} : chartOptions;
        let userDatasetOptions = [];
        let nonDefaultValues, seondaryAxisRequired = false;
        // get the default chart types (e.g. line or bar) to derive if there is any relevant change by the user
        let defaultChartType = OCA.Analytics.chartTypeMapping[OCA.Analytics.currentReportData.options.chart];

        // loop all selections from the option dialog and add them to an array
        let optionsYAxis = document.getElementsByName('optionsYAxis');
        let optionsChartType = document.getElementsByName('optionsChartType');
        for (let i = 0; i < optionsYAxis.length; i++) {
            if (optionsYAxis[i].value !== 'primary') {
                seondaryAxisRequired = nonDefaultValues = true;     // secondary y-axis enabled
            } else if (optionsChartType[i].value !== defaultChartType) {
                nonDefaultValues = true;    // just line/bar changed
            }
            userDatasetOptions.push({yAxisID: optionsYAxis[i].value, type: optionsChartType[i].value});
        }

        // decide of the dataseries array is relevant to be saved or not.
        // if all settings are default, all options can be removed can be removed completely
        if (nonDefaultValues === true) {
            try {
                // if there are existing settings, merge them
                dataOptions = JSON.stringify(cloner.deep.merge(JSON.parse(dataOptions), userDatasetOptions));
            } catch (e) {
                dataOptions = JSON.stringify(userDatasetOptions);
            }
        } else {
            dataOptions = '';
        }

        // if any dataseries is tied to the secondary yAxis or not
        //if yes, it needs to be enabled in the chart options (in addition to the dataseries options)
        let enableAxis = '{"scales": {"yAxes": [{},{"display":true}]}}';
        if (seondaryAxisRequired === true) {
            try {
                // if there are existing settings, merge them
                chartOptions = JSON.stringify(cloner.deep.merge(JSON.parse(chartOptions), JSON.parse(enableAxis)));
            } catch (e) {
                chartOptions = enableAxis;
            }
        } else {
            if (chartOptions === enableAxis) {
                // if the secondary axis is not required anymore but was enabled before
                // the options is cleared all together
                // this does only apply when ONLY the axis was enabled before
                // this does not do anything, if the user had own custom settings
                chartOptions = '';
            }
        }

        OCA.Analytics.currentReportData.options.dataoptions = dataOptions;
        OCA.Analytics.currentReportData.options.chartoptions = chartOptions;
        OCA.Analytics.Filter.Backend.updateDataset();
        OCA.Analytics.Filter.close();
    },

    close: function () {
        document.getElementById('analytics_dialog_container').remove();
        document.getElementById('analytics_dialog_overlay').remove();
    },

    // function for shorter coding of the dialog creation
    checkOption: function (array, index, field, check, defaultChartType) {
        if (Array.isArray(array) && array.length) {
            if (field in array[index]) {
                return array[index][field] === check ? 'selected' : '';
            } else if (check === defaultChartType) {
                return 'selected';
            } else {
                return '';
            }
        } else if (check === defaultChartType) {
            return 'selected';
        } else {
            return '';
        }
    },

};

OCA.Analytics.Filter.Backend = {
    updateDataset: function () {
        const datasetId = parseInt(OCA.Analytics.currentReportData.options.id);
        $.ajax({
            type: 'POST',
            url: OC.generateUrl('apps/analytics/dataset/') + datasetId,
            data: {
                'chartoptions': OCA.Analytics.currentReportData.options.chartoptions,
                'dataoptions': OCA.Analytics.currentReportData.options.dataoptions,
            },
            success: function () {
                OCA.Analytics.Backend.getData();
            }
        });
    },
};