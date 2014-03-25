# [Network Canvas 0.1]( http://jthrilly.github.io/netCanvas)

Network Canvas is an application built to help researchers capture personal networks. 


In developing the application, I have the following design goals:

* **Simplicity**: A minimalist interface, free from clutter and distraction.
* **Touch Based**: Drawing on the intuitive nature of touch based interaction.
* **Modularity**: A simple JSON based configuration system, to enable the tool to be customised to suit different research contexts and goals.
* **Standards Complliance**: Too much academic software has been lost to obsolescence. Often this is the result of poor planning, and the use of proprietory/closed source libraries, languages, and packages. This application will be written in HTML5 and JavaScript, meaning it should be platform independant and simple to maintain and extend.


## Recent Changes

	25/03/2014
	Switched to bower for dependency management and (finally!) wrote the readme.

## Todo

* Handle audio recording.
* Implement interaction log, with replay function. Tie interaction events to audo recording.
* Implement node attribute mapping.
* Community grouping with free draw tool.
* Linking up name generator with name interpreter steps.
* Consider packaging as an android/iOS app.

#Browser Requirements
Extensive testing across browsers has not been a development priority. Because of the nature of the technologies involved, a 'modern' browser is an **absolute necessity**. What does modern mean in this context? You should be fine with the latest versions of Chrome (33+) or Firefox (28+). I am not interested in supporting the idiosyncracies of internet explorer (and yes, I have tried the latest version on Win8)– sorry!

## Installation and Use

Since this is a web application, it does not need to be installed in the traditional sense. Instead you simply need to download the project and use the HTTP server of your choice to serve it to a web browser. To set up the application for first use, follow these instructions:

1. Download the latest stable release from
   [the project website](http://jthrilly.github.io/netCanvas), or clone this repository using git (`git clone
   https://github.com/jthrilly/netCanvas.git` is a good place to start) into a directory of your choice within the web-root of your HTTP server.
3. Visit `http://localhost/<directory you cloned into>` in a web browser.

## Development
I use CodeKit to contatenate and minify my JavaScript, and also to process the LESS files (which include bootstrap) into style.css.


## (Eventual) Features

**Note:** Since Network Canvas is still in active development, some/many of these features may not yet be implemented.

* Uses HTML5 localstorage API to allow data to persist between page refreshes (...or browser crashes).
* Allows network data to be exported in a variety of common file formats (for the time being, only XML-like file formats will be supported). 


## Dependencies

This project makes extensive use of existing libraries and frameworks. Currently, it is built on:

* Bower
* KineticJS
* jQuery
* Bootstrap 3.x
* Swiper
* jQuery.transit 


## Contribution/Collaboration

Network Canvas is under intensive development, with the aim of being fully feature complete (according to specification) by summer 2014. I would welcome fixes, improvements, and refinements to the code (I am very much a begginer with these technologies!). 

If you want to use Network Canvas with your own work or research, please contact me!
