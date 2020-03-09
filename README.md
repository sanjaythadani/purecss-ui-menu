# purecss-ui-menu

<i>purecss-ui-menu</i> is a responsive menu control that implements submenus and a hamburger menu with dropdowns using vanilla JavaScript.  
Demo: https://sanjaythadani.github.io/purecss-ui-menu/

This submenu system builds on top of the horizontal menu from purecss-ui design system:  
npm install purecss-ui --save  
GitHub: https://github.com/sanjaythadani/purecss-ui

Once the parent design system is installed, then install the submenu package:  
npm install purecss-ui-menu --save  

Include any one of the CSS stylesheets from the dist folders of the package, depending on the required theme and the minification.  
<link href="purecss-ui-default.css" rel="stylesheet">
<link href="purecss-ui-menu-default.css" rel="stylesheet">

<link href="purecss-ui-default.min.css" rel="stylesheet">
<link href="purecss-ui-menu-default.min.css" rel="stylesheet">

<link href="purecss-ui-dark.css" rel="stylesheet">
<link href="purecss-ui-menu-dark.css" rel="stylesheet">

<link href="purecss-ui-dark.min.css" rel="stylesheet">
<link href="purecss-ui-menu-dark.min.css" rel="stylesheet">

Then include one of the JS files.  
<script src="purecss-ui-menu.js"></script>
<script src="purecss-ui-menu.min.js"></script>
The JS file does support UMD so it can be used in a modular capacity.  


The menu system uses CSS processed through PostCSS to create a design system with a minimal footprint that is easily customized and currently supports the following themes:  
-- default  
-- dark  

The project use gulp as its task runner and will work easier if you have gulp-cli installed globally and want to work with it locally.  
npm install gulp-cli -g  

Runninng the project locally:  
1. Run 'npm install' to install all Node.js dependencies.  
2. Run 'npm run build:dev' to create all the local artifacts.  
3. Run 'npm run serve' to run the local Express server. If the files need to be watched then use 'npm run watch' instead.  

Creating a distribution:  
1. Run 'npm install' to install all Node.js dependencies.  
2. Run 'npm run build:dist' to create the distribution artifacts.  
