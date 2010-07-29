/*

            _/    _/_/    _/_/_/_/_/                              _/       
               _/    _/      _/      _/_/    _/    _/    _/_/_/  _/_/_/    
          _/  _/  _/_/      _/    _/    _/  _/    _/  _/        _/    _/   
         _/  _/    _/      _/    _/    _/  _/    _/  _/        _/    _/    
        _/    _/_/  _/    _/      _/_/      _/_/_/    _/_/_/  _/    _/     
       _/                                                                  
    _/

    Created by David Kaneda <http://www.davidkaneda.com>
    Documentation and issue tracking on Google Code <http://code.google.com/p/jqtouch/>
    
    Special thanks to Jonathan Stark <http://jonathanstark.com/>
    and pinch/zoom <http://www.pinchzoom.com/>
    
    (c) 2009 by jQTouch project members.
    See LICENSE.txt for license.

activityIndicator - Daniel J. Pinter - DataZombies
Based on http://starkravingcoder.blogspot.com/2007/09/canvas-loading-indicator.html

Object Properties (all properties are set in the canvas tag):
  animating
    is the object in motion? Use object methods to change - true/false - Default = false
  barHeight
    height of the bars in px - Default = 5
  barWidth
    width of the bars in px - Default = 2
  color
    uses canvas's style attribute to set the bar color - in rgb() - Default = 0, 0, 0 (black)
  direction
    the direction the object rotates - counterclockwise/clockwise - Default = clockwise
  innerRadius
    radius of the hole in the middle in px - Default = 5
  numberOfBars
    how many bars the object has - Default = 12
  speed
    how fast the object rotates - larger numbers are slower - Default = 50
  xPos
    x-position on canvas in px - Default = center of canvas
  yPos
    y-position on canvas in px - Default = middle of canvas

Object Methods:
  start()
    begins the object's rotation
  stop()
    ends the object's rotation

Object Instantiation:
  var aiGreenStar = new activityIndicator($('#GreenStar'));

Bind Object to Events via jQuery:
  $('#page1').bind('pageAnimationStart', function (e, data) {if (data.direction === 'in'){aiGreenStar.start();}});
  $('#page').bind('pageAnimationEnd', function (e, data) {if (data.direction === 'out'){aiGreenStar.stop();}});

Canvas tag with Object's ID:
This displays an green asterisk-like (*) activityIndicator in the top left corner of a 100 x 250 canvas.
  <canvas id="GreenStar" height="100" width="250" barHeight="10" barWidth="3" style="color:rgb(0,255,0);"
    direction="counterclockwise" innerRadius="5" numberOfBars="6" speed="50" xPos="30" yPos="45"></canvas>
*/
function activityIndicator(canvas) {
  var animating = false;
  var barHeight = $(canvas).attr('barHeight') - 0;
  var barWidth = $(canvas).attr('barWidth') - 0;
  var color = $(canvas).css('color');
  var context = $(canvas).get(0).getContext('2d');
  var direction = $(canvas).attr('direction');
  var innerRadius = $(canvas).attr('innerRadius') - 0;
  var numberOfBars = $(canvas).attr('numberOfBars') - 0;
  var speed = $(canvas).attr('speed') - 0;
  var xPos = $(canvas).attr('xPos') - 0;
  var yPos = $(canvas).attr('yPos') - 0;
  var offset = 0;

  if (isNaN(barHeight)) {barHeight = 5;}
  if (isNaN(barWidth)) {barWidth = 2;}
  var a = color.indexOf('(') + 1;
  var b = a;
  if (a !== -1) {
    if (color.substr(0, 4) === 'rgb('){
      b = color.lastIndexOf(')') - a;
    } else if (color.substr(0, 5) === 'rgba(') {
      b = color.lastIndexOf(',') - a;
    }
    color = b > a ? color.substr(a, b) + ', ' : '0, 0, 0, ';
  } else {
    color = '0, 0, 0, ';
  }
  switch (direction){
    case 'counterclockwise':
      direction = -1;
      break;
    case 'clockwise': default:
      direction = 1;
      break;
  }
  if (isNaN(innerRadius)) {innerRadius = 5;}
  if (isNaN(numberOfBars)) {numberOfBars = 12;}
  if (isNaN(speed)) {speed = 50;}
  if (isNaN(xPos)) {xPos = $(canvas).attr('width') / 2;}
  if (isNaN(yPos)) {yPos = $(canvas).attr('height') / 2;}

  function clear() {context.clearRect(0, 0, context.canvas.clientWidth, context.canvas.clientHeight);};

  function draw(offset) {
    clear();
    context.save();
    context.translate(xPos, yPos);
    for (var i = 0; i < numberOfBars; i++) {
      var angle = 2 * ((offset + i) % numberOfBars) * Math.PI / numberOfBars;
      context.save();
      context.translate((innerRadius * Math.sin(-angle)), (innerRadius * Math.cos(-angle)));
      context.rotate(angle);
      context.fillStyle = 'rgba(' + color + (numberOfBars + 1 - i) / (numberOfBars + 1) + ')';
      context.fillRect(-barWidth / 2, 0, barWidth, barHeight);
      context.restore();
    }
    context.restore();
  };

  function animate() {
    if (!animating) {return;};
    offset = (offset + direction) % numberOfBars;
    draw(offset);
    setTimeout(animate, speed);
  };

  function start(){
    animating = true;
    animate();
  };

  function stop(){
    animating = false;
    clear();
  };

  return {
    start: start,
    stop: stop
  };
};