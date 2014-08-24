//  var fs = require('fs');

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

var spiderImage1 = new Image();
spiderImage1.src = "../img/spider1.png";

var spiderImage2 = new Image();
spiderImage2.src = "../img/spider2.png";

var frames = [];

var Vec2 = dcodeIO.JustMath.Vec2;

var input = new Input();
var ship = new Ship();
var planets = [];
var edges = [];
var spiders = [];
var bullets = [];

var stars = [];

for(var i = 0; i < 100; i++) {
	stars.push(new Vec2(Math.round(Math.random() * 2000 - 1000), Math.round(Math.random() * 2000 - 1000)));
}

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
var newPlanetRequired = false;
var newSpiderRequired = false;


function addEdge(planet1, planet2) {
	if(planet1 != planet2) {
		var newEdge = new Edge(planet1, planet2);
		edges.push(newEdge);
		planet1.edges.push(newEdge);
		planet2.edges.push(newEdge);

		planet1.healthyEdges += 1;
		planet2.healthyEdges += 1;
		
		if(planets.length < 100 && planet1.healthyEdges > 1 && planet2.healthyEdges > 1) {
			newPlanetRequired = true;
		}
	}
}

var nextBulletIndex = 0;
function addBullet(bullet) {
	if(bullets.length < 50) {
		bullets.push(bullet);
	} else {
		bullets[nextBulletIndex % bullets.length] = bullet;
		nextBulletIndex++;
	}
}

var grd=context.createRadialGradient(0, 0, 20, 0, 0, 10000);
grd.addColorStop(0,"#2D2D2D");
grd.addColorStop(1,"#FEFEFD");

var grd2=context.createRadialGradient(0, 0, 980, 0, 0, 1020);
grd2.addColorStop(0,"#C0C0C0");
grd2.addColorStop(0.5,"#DDDDDD");
grd2.addColorStop(1,"#C0C0C0");

function upScore(amount) {
	ship.score += amount;
}

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

	if(planets.length < 5 || (newPlanetRequired && Date.now() > nextPlanetAddTime)) {
		var newPlanet = new Planet(Math.random() * window.innerWidth, Math.random() * window.innerHeight);
		planets.push(newPlanet);
		nextPlanetAddTime += Math.random() * 5000;

		if(planets.length / 15 > spiders.length) {
			newSpiderRequired = true;
		}

		newPlanetRequired = false;
	}

	if(newSpiderRequired) {
		spiders.push(new Spider(1000, 1000, spiderImage1, spiderImage2));
		newSpiderRequired = false;
	}

	for(var i = 0; i < planets.length; i++) {
  	planets[i].update(tick, planets, 0, 0, upScore);
  }

  for(var i = 0; i < spiders.length; i++) {
  	spiders[i].update(tick, planets, addEdge);
  }

	ship.update(tick, input, planets, edges, addBullet, spiders);

	for(var i = 0; i < bullets.length; i++) {
  	bullets[i].update(tick, edges);
  }

	canvas.width = canvas.width;

	// context.imageSmoothingEnabled= false;
  
  
	context.fillStyle=grd;
  context.translate(-ship.x + canvas.width / 2, -ship.y + canvas.height / 2);	  
  context.fillRect(ship.x - canvas.width / 2, ship.y - canvas.height / 2, canvas.width,canvas.height);

	context.fillStyle="#FAFAFA";
  for(var i = 0; i < stars.length; i++) {
  	var star = stars[i];
  	var winkness = ((((nts / ((i + 10) * 10)) + (i % 6)) % 6) - 3);
  	context.fillRect(star.x - winkness, star.y - winkness, winkness*2, winkness*2);
  }

  for(var i = 0; i < edges.length; i++) {
  	edges[i].render(context);
  }

	ship.render(context);

	for(var i = 0; i < spiders.length; i++) {
  	spiders[i].render(context);
  }

  for(var i = 0; i < planets.length; i++) {
  	planets[i].render(context);
  }

  for(var i = 0; i < bullets.length; i++) {
  	bullets[i].render(context);
  }

  context.strokeStyle = grd2;
  context.lineWidth = 30;
  context.beginPath();
  context.arc(0, 0, 1000, 0, 2 * Math.PI);
  context.stroke();

  context.translate(ship.x - canvas.width / 2, ship.y - canvas.height / 2);	
  context.fillStyle="#111111";
  for(var i = 0; i < ship.lives; i++) {
  	context.fillRect(17 + (i * 30), 17, 26, 26);
  	context.beginPath();
    context.arc(30 + (i *30), 20, 13, 13, 0,2*Math.PI);
    context.fill();
  }

  context.fillStyle="#FFFF88";
  for(var i = 0; i < ship.lives; i++) {
  	context.fillRect(20 + (i * 30), 20, 20, 20);
  	context.beginPath();
    context.arc(30 + (i * 30), 20, 10, 10, 0,2*Math.PI);
    context.fill();
  }

	context.fillStyle="#FFFFFF";
	context.font = 'italic 35pt sans-serif';
  context.fillText(""+ship.score, 105, 43);;


  if(startCap && frameIndex % 3 == 0) {
		frames.push(canvas.toDataURL("image/png"));
	}

	requestAnimationFrame(render);
}

requestAnimationFrame(render);