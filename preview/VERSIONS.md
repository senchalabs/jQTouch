# New and Noteworthy — jQTouch

## 1.0rc7

### Innsbruck (iOS 7) Theme 

###### Dec, 2013

A new theme that resemble to iOS 7 is added.

![Innsbruck Screenshot 1][11] | ![Innsbruck Screenshot 2][12] | ![Innsbruck Screenshot 3][13] | ![Innsbruck Screenshot 4][14]

## 1.0rc6

### Coffee Script

###### Feb, 2013 -- Dec, 2013

The main JavaScript file was ported / rewritten in CoffeeScript. Dave simplified the codebase and fixed a good number of bugs.


## 1.0.0 - b5

### Actionsheet

###### Oct, 2012

![ActionSheet Screenshot][9]

Actionsheet is similar to iOS's [UIActionSheet][2]. It is a modal sheet that can be used to prompt user for choices. 

It is added to this version as an extension: `jqt.actionsheet.js`. When loaded, it attempts to load `jqt.actionsheet.css` from the same directory. (If you use ASL, such as require.js, you might need to include the css explicitly.) 

The actionsheet uses the same markup as a jQT page and must be a direct child of `<div id="jqt"/>`.

To trigger an actionsheet, use an anchor with class, `action` (ie, `<a class="action">`) 

Tapping on any anchor on the sheet causes the sheet to dismiss. After the sheet is dismissed, the original jQT action will be triggered. 

Here is an example sniplet:

```html    
<div id="ui">
    < ... >
        <ul class="rounded">
            <li class="arrow"><a class="action" href="#actionsheet">Action</a></li>
        </ul>
    < ... >
</div>
<div id="actionsheet" class="actionsheet">
    <div class="actionchoices">
        <a href="#action_performed" class="whiteButton">Open in Safari</a>
        <a href="#action_performed" class="whiteButton">Plan B</a>
        <a href="#" class="redButton dismiss">Cancel</a>
    </div>
</div>
```

Please refers to [demos/main/index.html#ui][4] for code sample.

### Menusheet

###### Oct, 2012

![MenuSheet Screenshot][10] 

Menusheet is first made popular by facebook app on iOS. The menusheet hides beneath the main page and is revealed by a slide animation when activated.

Its usage is very similar to actionsheet. 

It is added to this version of jQT as an extension: `jqt.menusheet.js`. When loaded, it attempts to load `jqt.menusheet.css` from the same directory. (If you use ASL, such as require.js, you might need to include the css explicitly.) 

The menusheet uses the same markup as a jQT page and must be a direct child of `<div id="jqt">`. 

To trigger an actionsheet, use an anchor with class, menu (ie, `<a class="menu">`) 

Tapping on any anchor on the sheet will cause the sheet to dismiss. After the sheet is dismissed, the original jQT action will be triggered. 

Please refers to [demos/main/index.html#ui][4] for code sample. 

### Unit Tests

###### Dec 18th, 2012

We have added unit tests into this release.

They can be found under test/unit/. Each test is a *.html file and can be run by simply open it with a web browser.

The tests can also be run from a command line. Under build/, exec `grunt test`.

### Init Options: updateHash

###### Dec 18th, 2012

When options updateHash is set to true (default), page navigation will cause the url hash(#) to be updated.

```javascript
var jQT = new $.jQTouch({updateHash: false});
```                      

### Init Options: starter (Experimental)

###### Dec 23rd, 2012

Added init options, starter. By defaults, jQTouch is started upon `$(document).ready`.

For example, this option can be overridden:

- to work with dynamically loaded body. The relevant part of the dom might not be available at `$(document).ready`.

- to react upon user action

Here is some code example:

```javascript
function starter(start) {
    $(document).bind('ready', function() {
       $('https://beedesk.fwd.wf#magic_button').bind('touchstart mousedown', function() {
           start();
       });
    });
 }
 var jQT = new $.jQTouch({starter: starter});  
```

### Fixed Tap During Animation Break Navigation Bug

###### Nov 2012

Prior to this release, rapid taps on anchor before page transition ended might cause page navigation to break. The problem is fixed in this release.

### Fixed intermittent touchscroll not-scrollable problem

###### Dec 19th, 2012

For .scroll, overflow-y: scroll is used instead. Some old workaround on minHeight is removed. Tested on iPhone 4s, iPad 3, Nexus 7 and Safari


### Grunt.js Build

###### Jan 24th, 2012

We converted our build system from `Ant` into `Gruntjs`, for better dependeincies mangaement, build performance and flexibility. 

### Travis CI Integration

###### Jan 24th, 2012

jQTouch repository is now connected to Travis CI.

## 1.0 - b4

### Improved Theming System

![Theme Screenshot][3]

See, [jQTouch blog][6] for details.

### iOS Native Scrolling

See, [jQTouch blog][7] for details.

### Zepto.js Integration

See, [jQTouch blog][8] for details.

 [1]: images/ActionSheet_Small.png
 [2]: http://developer.apple.com/library/ios/#documentation/uikit/reference/UIActionSheet_Class/Reference/Reference.html
 [3]: http://25.media.tumblr.com/tumblr_lwknln4IbI1qa206po1_500.png
 [4]: demos/main/index.html#ui
 [6]: http://blog.jqtouch.com/post/14579716419/improved-theming
 [7]: http://blog.jqtouch.com/post/14586457670/ios5-scrolling
 [8]: http://blog.jqtouch.com/post/14576505296/zepto-js
 [9]: https://raw.github.com/senchalabs/jQTouch/gh-pages/screenshots/ActionSheet_Small.png
 [10]: https://raw.github.com/senchalabs/jQTouch/gh-pages/screenshots/MenuSheet_Small.png
 [11]: https://raw.github.com/senchalabs/jQTouch/gh-pages/screenshots/Innsbruck_Main_Small.png
 [12]: https://raw.github.com/senchalabs/jQTouch/gh-pages/screenshots/Innsbruck_EdgetoEdge_List_Small.png
 [13]: https://raw.github.com/senchalabs/jQTouch/gh-pages/screenshots/Innsbruck_Buttons_Small.png
 [14]: https://raw.github.com/senchalabs/jQTouch/gh-pages/screenshots/Innsbruck_Actionsheet_Small.png
