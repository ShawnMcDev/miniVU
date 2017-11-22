![miniVU Logo](https://github.com/shawnmcla/miniVU/blob/master/images/logo_small.png)

### A minimalistic HTML view engine

miniVU is an ultra-simple view engine for single-page websites. 

Overview:
* Easy to use: No JavaScript programming knowledge required
* Completely client-side. Ideal for basic, static hosting (such as GitHub pages!)
* Customization options
* Tiny! ( < 6KB, minified )
* Open-Source, MIT Licensed
* No dependencies
* Plugin support in the near future™ (e.g. support for template engines)
* Fast!

Have a peak at miniVU in action [here](https://shawnmcdev.github.io/miniVU/demo/index.html)

For in-depth documentation of features, configuration, and more, view [the docs](#) (Coming soon!)

To jump right in, follow the instructions below:

---

## Quick Start - Minimum Configuration

The concept of miniVU is simple. A container is specified and views are defined as HTML files in the "views" directory. Views are simply regular HTML files with no surrounding body, head or HTML tags. This HTML will be injected in the targeted area dynamically through AJAX calls. The user never experiences a page refresh and forward/back button functionality is maintained through manipulation of the history API.


A miniVU link looks like this:
```http://yoursite.com/#/aboutus```


Notice the ```#/``` in the URL. This is a hash which is generally used to specify a position in the page with anchor tags, however, we use it to specify *which* page to load.


Set up your website directory structure as such:
```
(root) /
|--- index.html
|--- minivu.min.js
|--- views /
     |--- home.html
     |--- aboutus.html
     |--- contact.html
     |--- services.html

Include the miniVU library on the page where you wish to use it, at the bottom of the <body> element:
  ```HTML
  ...
  <script src="minivu.min.js"></script>
  </body>
  </html>
  ```
  
Create an empty container element that will host the various views of your website and give it a unique id= or class= tag.
  ```HTML
  <div id="miniVUcontent">
  </div>
  <script src="minivu.min.js"></script>
  </body>
  </html>
  ```
  
 Instantiate miniVU by creating a second script tag, **below** the miniVU tag. Pass to the constructor the selector pointing to the target element and the default view to display (home.html in this case, we omit the .html part):
 
   ```HTML
  <div id="miniVUcontent">
  </div>
  <script src="minivu.min.js"></script>
<script>let m = new miniVU("#miniVUContent", "home")</script>
  </body>
  </html>
  ```
  
  Tada. If all went well, you have a ```home.html``` file in the ```views``` directory, its content should appear in the container.
  
  Changing views is easy. Simply create regular links, but with hashes. If we wanted to link to the hypothetical pages I have listed in the directory structure above we could simply do:
 
  ```HTML
<a href="/">Home</a>
<a href="#/aboutus">About Us</a>
<a href="#/contact>Contact</a>
<a href="#/services>Services</a>
```

Clicking these link will trigger a "onhashchange" event in the browser, which miniVU intercepts and then uses to determine which view to display. Notice how the Home link simply links to the root. Navigating to the root (the "*real*" page) will always display the *default view* specified in the constructor.

That's the basics. Hopefully it's simple enough to your taste! For more information on configuration of things such as custom page titles, custom 404 errors, and more. See [the docs](#) (Coming soon!).
