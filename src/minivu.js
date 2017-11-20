
/**
 * miniVU
 * A minimalistic HTML/JS view engine
 * Author: Shawn McLaughlin <shawnmcdev@gmail.com>
 * Website: https://github.com/shawnmcla/miniVU
 */


class miniVU {
    /**
     * Represents a miniVU instance.
     * @constructor
     * @param {string} targetElementSelector - The target element to use as a view container. Must be a CSS class or id selector.
     * @param {string} defaultView - The name of the defaultView. This view is presented when the hash is empty.
     * @param {Object} config - Optional configuration variables. See documentation for details.
     */
    constructor(targetElementSelector, defaultView = null, config = {}) {
        this.VERSION = "beta 2.0";
        this.TITLE_PLACEHOLDER = "{{miniVU title}}";
        this.DEFAULT_NOT_FOUND = "<h1>404 not found</h1>";
        this.ERROR_MSGS = {
            "GENERIC_ERROR": "Something went wrong. For more help and documentation, see https://github.com/shawnmcla/miniVU and/or see error stack trace.",
            "INVALID_SELECTOR": "The targetElementSelector parameter must be a non-empty string selector for which there is a corresponding element. (e.g. #idSelector, .classSelector)",
            "ELEMENT_NOT_FOUND": "The targetElementSelector passed cannot be found in the DOM.",
            "VIEW_NOT_FOUND": "The associated HTML document for the view specified could not be found. Check that the file exists and is in the correct directory.",
            "NO_DEFAULT_VIEW": "No default view was specified. Specifying a default view is strongly recommended. To specify a default view, pass the view name as the second argument when instantiating miniVU."
        };
        this.CONFIG = {
            "viewsDirectory": "./views", /** Relative path to the directory where view HTML files are stored */
            "changeTitle": false, /** Change the window title whenever a new view is loaded? */
            "titlePattern": "{{miniVU title}}", /** This string is replaced in the title with whatever title is associated to the view. */
            "customNotFound": null, /** Name of the view to show for 404 Errors */
            /**
             * Custom titles for views. By default, the view's title is simply its name.
             * Provide here a dictionary object of the format:
             * {viewname: "Title to display"}
             * Only has an effect if changeTitle is enabled, of course.
             */
            "customTitles": null,
        };

        if (Object.keys(config).length !== 0) {
            this.loadConfig(config);
        }

        this.currentView = null;
        this.defaultView = defaultView;

        this.targetArea = this.getElementFromSelector(targetElementSelector);
        if (!this.targetArea) {
            // The target area was not found, abort initialization.
            return null;
        }

        window.addEventListener('hashchange', (e) => this.hashChangeHandler(e));
        window.addEventListener('popstate', (e) => this.popStateHandler(e));

        console.log("Initialized miniVU version: " + this.VERSION);
        this.loadView(this.getViewFromHash());
    }

    /**
     * Returns the view name as a string, parsed from the hash.
     * @return {string} A view name.
     */
    getViewFromHash() {
        let hash = location.hash;
        let viewName = "";

        if (hash && hash.substr(0, 2) === "#/")
            viewName = hash.substr(2);

        return viewName === "" ? this.defaultView : viewName;
    }

    /**
     * Iterates through the passed object and sets valid values to the instance's configuration.
     * @param {Object} config - The config object containing configuration variables.
     */
    loadConfig(config) {
        Object.keys(config).forEach((key) => {
            if (this.CONFIG.hasOwnProperty(key)) {
                this.CONFIG[key] = config[key];
                console.info(`Set config ${key} to ${config[key]}`);
            } else {
                console.error("Invalid config key: " + key + ". Ignoring.");
            }
        });
    }

    /**
     * Handles window hash changes.
     * @param {Event} e - The event emitted. 
     */
    hashChangeHandler(e) {
        e.preventDefault();
        this.loadView(this.getViewFromHash());
    }

    /**
     * Handles window popstate events.
     * @param {Event} e - The event emitted
     */
    popStateHandler(e) {
        if (e.state && e.state.viewName) {
            this.loadView(e.state.viewName);
        }
    }

    /**
     * Tries to find an element matching the specified class or id selector.
     * @param {string} selector - A class or id css element selector.
     * @return {element} The DOM element corresponding to the selector - or null if not found.
     */
    getElementFromSelector(selector) {
        let element = null;
        if (selector !== null && typeof selector == "string") {
            if (selector[0] === ".") {
                element = document.getElementsByClassName(selector.substr(1))[0];
            } else if (selector[0] === "#") {
                element = document.getElementById(selector.substr(1));
            }
        } else {
            this.errorInvalidSelector();
        }
        if (!element)
            this.errorTargetNotFound();

        return element;
    }

    /**
     * Pushes a state object to the history to allow for Forward/Back button functionality.
     * @param {string} view - The view name.
     */
    pushState(view) {
        history.replaceState(
            { viewName: view },
            null, view === this.defaultView ? "" : "#/" + view);
    }

    /**
     * Clears the target element of all content.
     * @param {element} target - The target DOM element to clear.
     */
    clearContent(target) {
        while (target.firstChild)
            target.removeChild(target.firstChild);
    }

    /**Append content to the specified DOM element
     * @param {NodeList or Raw HTML string} content Content to append to the target
     * @param {DOM Element} target The element to which the content will be appended
     */
    appendContent(content, target) {
        console.log("appending contnet..");
        if (typeof content === "string") {
            console.log("Raw");
            target.innerHTML = content;
        }
        else {
            // Strip the content from the body tags that get automatically added.
            content = content.body.childNodes;
            if (content.forEach) {
                console.log("NodeList foreach implemented..");
                content.forEach((node) => target.appendChild(node));
            }
            else { // Edge does not support forEach on NodeLists 
                console.log("Array prototype .call() fallback");
                Array.prototype.forEach.call(content, (node) => target.appendChild(node));
            }
        }
    }

    /**
     * Asynchronously requests the specified resource from the views directory.
     * @param {string} fileName - The name of the file to request.
     * @param {bool} raw - If true, will not set the response type to document.
     * @return {Promise}
     */
    loadHTMLContent(fileName, raw = false) {
        return new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest();

            xhr.onload = (e) => {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        resolve(xhr.response);
                    } else {
                        reject(xhr.statusText);
                    }
                }
            };

            xhr.onerror = (e) => {
                reject(xhr.statusText);
            };
            let dir = this.CONFIG.viewsDirectory;
            xhr.open("GET", dir + (dir.substr(-1) === "/" ? fileName : "/" + fileName));

            if (!raw)
                xhr.responseType = "document";

            xhr.send();
        });
    }

    /**
     * Replaces the content of the miniVU target area with new content.
     * @param {string} view - The name of the view.
     * @param {NodeList or string} content - The HTML content which replaces the old content.
     */
    replaceContent(view, content) {
        this.clearContent(this.targetArea);
        this.appendContent(content, this.targetArea);
        this.currentView = view;
        if (this.CONFIG.changeTitle) {
            let title = view;
            if (this.CONFIG.customTitles &&
                this.CONFIG.customTitles[view])
                title = this.CONFIG.customTitles[view];
            document.title =
                this.CONFIG.titlePattern.replace(this.TITLE_PLACEHOLDER, title);
        }
        this.pushState(view);
    }

    /**
     * Loads a view and displays it in the target area.
     * @param {string} view - The name of the view to load.
     */
    loadView(view) {
        if (view === null)
            console.error("Tried to load 'null' view. Did you specify a default view?");
        if (view !== this.currentView) {
            this.loadHTMLContent(view + ".html")
                .then((content) => this.replaceContent(view, content))
                .catch((err) => this.errorViewNotfound(view, err));
        }
    }
    /** Error display functions. Prints a console.error message. */
    errorGeneric(error) {
        console.error(this.GENERIC_ERROR, error);
    }
    errorInvalidSelector() {
        console.error(this.ERROR_MSGS.INVALID_SELECTOR);
    }
    errorTargetNotFound() {
        console.error(this.ERROR_MSGS.ELEMENT_NOT_FOUND);
    }

    /**
     * Handles 404 errors. Redirecting the user to the custom or default 404 page.
     * @param {string} view - The name of the view that was attempted to load
     */
    errorViewNotfound(view, err) {
        console.error(this.ERROR_MSGS.VIEW_NOT_FOUND + " View name: " + view + ", Views directory: " + this.CONFIG.viewsDirectory, err);
        if (this.CONFIG.customNotFound && view !== this.CONFIG.customNotFound) {
            this.loadView(this.CONFIG.customNotFound);
        } else {
            this.replaceContent("404", this.DEFAULT_NOT_FOUND, true);
        }
    }
}
