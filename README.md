# Angular OVAC Gallery

Super simple Angular directive preview images as slide.

[Demo](http://www.ovac4u.com/angular-ovac-gallery)

## Installation

Install with Bower

`$ bower install angular-ovac-gallery`

or

Install with npm

`$ npm install angular-ovac-gallery`

or

Clone this repo

`$ git clone`

Add scripts to project

```html
<link rel="stylesheet" href="/bower_component/angular-ovac-gallery/angular-ovac-gallery.css" media="screen" title="no title" charset="utf-8">

<script src="/bower_component/angular-ovac-gallery/angular-ovac-gallery.js" charset="utf-8"></script>
```

Import into angular

```javascript
angular.module('AppName', ['ovac.gallery']);
```

--------------------------------------------------------------------------------

## Usage

### Add directive to element

Note: the images object must be passed in using the images attribute.

```html
<div ovac-gallery images="controllername.images" tumbs="true"></div>
```
