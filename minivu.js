'use strict';
/**
miniVU
A minimalistic HTML/JS view engine
Author: Shawn McLaughlin <shawnmcdev@gmail.com>
Website: https://github.com/shawnmcla/miniVU
 */

/** 
 * Default Configuration values. Can be changed on initialization.
 * viewsDir: Relative path to the directory where view HTML files are located.
 */
const CONFIG = {
    "viewsDir": "./views",

}
const ERROR_MSGS = {
    "GENERIC_HELP": "For more help and documentation, see https://github.com/shawnmcla/miniVU",
    "INVALID_SELECTOR": "The targetElementSelector parameter must be a non-empty string.",
    "ELEMENT_NOT_FOUND": "The targetElementSelector passed cannot be found in the DOM.",
    "VIEW_NOT_FOUND": "The associated HTML document for the view specified could not be found. Check that the file exists and is in the correct directory.",

}

const version = "0.0.1";

let contentArea;
console.log("miniVU version " + version);

/**
 * Sets the target parent element to which the view is appended.
 targetElementSelector: id or class of the element. If a class is used, the first occurence is used.
 */
const miniVU = function (targetElementSelector) {
    let element;
    if (targetElementSelector != null && typeof (targetElementSelector == string)) {
        if (targetElementSelector[0] === ".") { // If selector is a class selector
            element = document.getElementsByClassName(targetElementSelector.substr(1))[0];
            if (element) {
                contentArea = element;
            }
        } else if (targetElementSelector[0] === "#") { // If selector is an ID selector
            element = document.getElementById(targetElementSelector.substr(1))[0];
        }
        else {
            errorInvalidSelector();
        }
        if (element) {
            contentArea = element;
        }
        else {
            errorTargetNotFound();
        }
    } else {
        console.error("targetElementSelector parameter must be a non-empty string.");
    }
}

function loadHTMLContent(fileName, callback) {
    let xhr = new XMLHttpRequest();

    xhr.onload = function (e) {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) { // 200: HTTP OK
                //TODO: Display HTML data
                console.log(xhr.response);
                return callback(xhr.response);
            } else {
                errorViewNotfound(fileName);
                return;
            }
        }
    }

    xhr.onerror = function (e) {
        errorViewNotfound(fileName);
        return;
    }

    xhr.open("GET", CONFIG.viewsDir + "/" + fileName, true);
    xhr.responseType = "document";

    xhr.send();
}
/** Error display functions. Prints a console.error message. */
/** TODO: Display error in target area for errors that aren't related to finding the area itself. */
function errorInvalidSelector(targetElementSelector) {
    console.error(ERROR_MSGS.INVALID_SELECTOR);
}
function errorTargetNotFound(targetElementSelector) {
    console.error(ERROR_MSGS.ELEMENT_NOT_FOUND);
}
function errorViewNotfound(fileName) {
    console.error(ERROR_MSGS.VIEW_NOT_FOUND + " File name: " + fileName + ", Views directory: " + CONFIG.viewsDir);
}