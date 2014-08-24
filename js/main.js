var fs = require('fs');

function zeroPad(num, places) {
  var zero = places - num.toString().length + 1;
  return Array(+(zero > 0 && zero)).join("0") + num;
}

function convert(uri) {
    var mime   = uri.split(',')[0].split(':')[1].split(';')[0];
    var bytes  = atob(uri.split(',')[1]);
    var len    = bytes.length;
    var buffer = new window.ArrayBuffer(len);
    var arr    = new window.Uint8Array(buffer);

    for (var i = 0; i < len; i++) {
        arr[i] = bytes.charCodeAt(i);
    }

    return new Buffer(arr);
}


var frames = [];

var Vec2 = dcodeIO.JustMath.Vec2;

var input = new Input();
var ship = new Ship();
var planets = [];
var edges = [];

var canvas = document.getElementById('gameCanvas');
var context = canvas.getContext('2d');

document.addEventListener('keydown', input.keydown);
document.addEventListener('keyup', input.keyup);

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;	

window.onresize=function(){
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;	
};

var startCap = false;

document.addEventListener('keyup', function (e) {
	if (e.keyCode == 'R'.charCodeAt(0)) {
		location.reload();
	}

	if(e.keyCode == 'C'.charCodeAt(0)) {
		for(var i = 0; i < frames.length; i++) {
			fs.writeFile("capture/frame"+zeroPad(i, 5)+".png", convert(frames[i]));
		}
	}

	if(e.keyCode == 'X'.charCodeAt(0)) {
		startCap = true;
	}
});

var fps = 0;
var previousTs = -1;

var frameIndex = 0;

var nextPlanetAddTime = Date.now() + 1000;
var nextEdgeAddTime = Date.now() + 1000;

function render() {
	frameIndex ++;

	var nts = Date.now();
  var dt = 0
  if(previousTs > -1) {
    dt = Math.min(100, nts - previousTs);

    var thisFrameFPS = 1000 / (dt);
    fps += (thisFrameFPS - fps) / 50;
  }
  previousTs = nts;

  var tick = dt / 1000;

	if(planets.length < 50 && nts > nextPlanetAddTime) {
		var newPlanet = new Planet(Math.random() * window.innerWidth, Math.random() * window.innerHeight);
		planets.push(newPlanet);
		nextPlanetAddTime += Math.random() * 5000;

		// if(planets.length > 1 && planets.length % 5 != 0) {
		// 	var prevPlanet = planets[planets.length - 2];
		// 	var newEdge = new Edge(newPlanet, prevPlanet);
		// 	edges.push(newEdge);

		// 	newPlanet.edges.push(newEdge);
		// 	prevPlanet.edges.push(newEdge);
		// }

		if(planets.length > 2) {
			var prevPlanet = planets[Math.floor(Math.random() * planets.length)];
			var newEdge = new Edge(newPlanet, prevPlanet);
			edges.push(newEdge);

			if(newPlanet != prevPlanet) {
				newPlanet.edges.push(newEdge);
				prevPlanet.edges.push(newEdge);
			}
		}
	}

	for(var i = 0; i < planets.length; i++) {
  	planets[i].update(tick, planets, 0, 0);
  }

	ship.update(tick, input, planets, edges);

	canvas.width = canvas.width;
  context.fillStyle="#111111";
  context.fillRect(0,0,canvas.width,canvas.height);

  context.translate(-ship.x + canvas.width / 2, -ship.y + canvas.height / 2);	  

  for(var i = 0; i < edges.length; i++) {
  	edges[i].render(context);
  }

	ship.render(context);

  for(var i = 0; i < planets.length; i++) {
  	planets[i].render(context);
  }

  if(startCap && frameIndex % 3 == 0) {
		frames.push(canvas.toDataURL("image/png"));
	}

	requestAnimationFrame(render);
}

requestAnimationFrame(render);