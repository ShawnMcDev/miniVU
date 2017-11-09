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

const version = "0.0.2";
console.log("miniVU beta version " + version);

class miniVU {

    /**
     * Constructor. Initializes miniVU with the target element to append views to.
     * @param {class or id selector} targetElementSelector 
     */
    constructor(targetElementSelector, config = {}) {
        this.ready = false;
        this.currentView = null;
        this.contentBuffer = null;
        this.targetArea = null;

        let element;

        if (targetElementSelector != null && typeof (targetElementSelector == String)) {
            if (targetElementSelector[0] === ".") { // If selector is a class selector
                element = document.getElementsByClassName(targetElementSelector.substr(1))[0];
            } else if (targetElementSelector[0] === "#") { // If selector is an ID selector
                element = document.getElementById(targetElementSelector.substr(1));
            }
            else {
                this.errorInvalidSelector();
            }
            if (element) {
                this.targetArea = element;
                this.ready = true;
            }
            else {
                this.errorTargetNotFound();
            }
        } else {
            console.error("targetElementSelector parameter must be a non-empty string.");
        }
    }

    /** Loads an HTML document from the filename given and returns a promise which resolves with the HTML document */
    loadHTMLContent(fileName) {
        return new Promise(function (resolve, reject) {
            let xhr = new XMLHttpRequest();

            xhr.onload = function (e) {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) { // 200: HTTP OK
                        console.log(xhr.response);
                        resolve(xhr.response);
                    } else {
                        console.debug("Error");
                        errorViewNotfound(fileName);
                        reject(xhr.statusText);
                    }
                }
            }

            xhr.onerror = function (e) {
                errorViewNotfound(fileName);
                reject(xhr.statusText);
            }

            xhr.open("GET", CONFIG.viewsDir + "/" + fileName, true);
            xhr.responseType = "document";
            xhr.send();
        });
    }

    /** Clear the target area to make space for the new content */
    clearContent() {
        while (this.targetArea.hasChildNodes()) {
            this.targetArea.removeChild(this.targetArea.lastChild);
        }
    }
    /** Append the nodes of the newly loaded content to the target area */
    appendContent(content) {
        content.body.childNodes.forEach((node) => this.targetArea.appendChild(node));
    }
    /** Takes HTML content, makes a call to clear the target area and then a call to append the new content. */
    swapContent(content) {
        console.log("Swapping to " + content);
        this.clearContent();
        this.appendContent(content);
    }
    /** Initiate the view changing process */
    go(view, file) {
        if (view !== this.currentView) {
            this.loadHTMLContent(view + ".html")
                .then((content) => this.swapContent(content))
                .catch((e) => console.error("Error loading content.", e));
        }
    }

    /** Error display functions. Prints a console.error message. */
    errorInvalidSelector(targetElementSelector) {
        console.error(ERROR_MSGS.INVALID_SELECTOR);
    }
    errorTargetNotFound(targetElementSelector) {
        console.error(ERROR_MSGS.ELEMENT_NOT_FOUND);
    }
    errorViewNotfound(fileName) {
        console.error(ERROR_MSGS.VIEW_NOT_FOUND + " File name: " + fileName + ", Views directory: " + CONFIG.viewsDir);
    }
}


let m = new miniVU("#miniVUContent");