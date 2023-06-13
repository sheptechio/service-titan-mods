// ==UserScript==
// @name         Invoice Style Fixer
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Fixes spacing of invoice sections and allows you to expand and contract sections as well.
// @author       David Shepard (david@sheptech.io)
// @match        https://go.servicetitan.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=servicetitan.com
// @grant        none
// @run-at document-idle
// ==/UserScript==


// this function is what handles waiting for an element to load before continuing on with the code
function waitForElm(selector) {
    return new Promise(resolve => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }

        const observer = new MutationObserver(mutations => {
            if (document.querySelector(selector)) {
                resolve(document.querySelector(selector));
                observer.disconnect();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}

// toggle function that gets all the sibling elements of the header and hides or shows them
function toggleSection(sectionHeader)
{
    var siblings = sectionHeader.siblings("table");
    siblings.toggle();
}

// this adds inline styles to make things appear a little cleaner
// it also attaches an on click function so we can toggle visibility of different sections
function fixInvoiceSectionStyling(selector)
{
    // set styling for table
    var targetElement = $(selector)
    targetElement.css({"width":"150%", "margin-left":"-30%"});
    // get section headers so we can make them clickable
    var sectionHeader = targetElement.closest('div').find('h2');
    if(!sectionHeader.text()){
        sectionHeader = targetElement.closest('div').find('h3');
    }
    sectionHeader.click(function() {
        toggleSection(sectionHeader)
    });
}

// loops through all the sections that appear under the the left nav bar so we don't mess with the styling that works
function fixInvoiceStyling()
{
    const sectionSelectors = [
        'div[data-bind="template: { name: \'payments-template\', data: PaymentsView }"]',
        'div[data-bind="template: { name: \'tasks-template\', data: TasksView }"]',
        'div[data-bind="template: { name: \'price-modifiers-template\', data: PriceModifiersView }"]',
        'div[data-bind="template: { name: \'materials-template\', data: FlatRateMaterialsView }"]',
        'div[data-bind="template: { name: \'chargeable-materials-template\', data: ChargeableMaterialsView }"]',
        'div[data-bind="template: { name: \'materials-with-markup-template\', data: MarkupMaterialsView }"]',
        'div[data-bind="template: { name: \'purchase-orders-template\', data: FlatRatePurchaseOrdersView }"]',
        'div[data-bind="template: { name: \'purchase-orders-with-markup-template\', data: MarkupPurchaseOrdersView }"]',
        'div[data-bind="template: { name: \'invoice-returns-template\', data: InventoryReturnsView, if: window.App.Features.EnablePurchasingModule }"]',
        'div[data-bind="template: { name: \'equipment-template\', data: EquipmentView }"]',
        'div[data-bind="template: { name: \'invoice-technicians-template\', data: TechniciansView, if: !AdjustmentToId && InvoiceConfiguration.ShowJobInfo }"]',
        'div[data-bind="template: { name: \'payroll-adjustments-template\', data: PayrollAdjustmentsView, if: (Mode != \'Complete\' || JobStatus == \'Completed\') }"]',
        'div[data-bind="template: { name: \'estimates-template\', data: EstimatesView }"]',
        'div[data-bind="template: { name: \'adjustment-invoices-template\' }"]'
    ];
    const section = 'div[data-bind="template: { name: \'materials-template\', data: FlatRateMaterialsView }"]';
    for (const selector of sectionSelectors)
    {
        console.log(selector);
        fixInvoiceSectionStyling(selector);
    }
}


// this checks to make sure we are on the invoice page
// if we are it checks to make sure an element has loaded
// once the page loads we continue to update the styling
function checkForInvoicePageAndFixStyling()
{
    var url = window.location.href;
    var match = url.includes("EditInvoice");
    if(match)
    {
        console.log("matched");
        waitForElm('.caption').then((elm) => {
            console.log('Element is ready');
            console.log(elm.textContent);
            fixInvoiceStyling();
        });
    }
    console.log("ran");
}


// main entry point for function
(function() {
    'use strict';
    // checks for new page load using polling since the site uses AJAX
    var fireOnHashChangesToo = true;
    var pageURLCheckTimer = setInterval (
        function () {
            if (this.lastPathStr  !== location.pathname
                || this.lastQueryStr !== location.search
                || (fireOnHashChangesToo && this.lastHashStr !== location.hash)
               ) {
                this.lastPathStr = location.pathname;
                this.lastQueryStr = location.search;
                this.lastHashStr = location.hash;
                checkForInvoicePageAndFixStyling();
            }
        }
        , 111
    );
})();

