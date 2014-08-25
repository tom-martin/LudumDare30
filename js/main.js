//  var fs = require('fs');

// function zeroPad(num, places) {
//   var zero = places - num.toString().length + 1;
//   return Array(+(zero > 0 && zero)).join("0") + num;
// }

// function convert(uri) {
//     var mime   = uri.split(',')[0].split(':')[1].split(';')[0];
//     var bytes  = atob(uri.split(',')[1]);
//     var len    = bytes.length;
//     var buffer = new window.ArrayBuffer(len);
//     var arr    = new window.Uint8Array(buffer);

//     for (var i = 0; i < len; i++) {
//         arr[i] = bytes.charCodeAt(i);
//     }

//     return new Buffer(arr);
// }
var nwk = false;

if(nwk) {
	var gui = require('nw.gui');
}

document.addEventListener('keyup', function (e) {
	if (e.keyCode == 'R'.charCodeAt(0)) {
		game.running = false;

		game = new Game();
	}

	if(e.keyCode == 27 && nwk) {
		gui.App.quit();
	}
});

var game = null;

var edgeDeadSounds = [new Audio("../audio/edgeDead1.ogg"),
												new Audio("../audio/edgeDead2.ogg"),
												new Audio("../audio/edgeDead3.ogg")];

var shipDeadSounds = [new Audio("../audio/shipDead1.ogg"),
											new Audio("../audio/shipDead2.ogg"),
											new Audio("../audio/shipDead3.ogg")];

var shootSounds = [ new Audio("../audio/shoot1.ogg"),
										new Audio("../audio/shoot2.ogg"),
										new Audio("../audio/shoot1.ogg"),
										new Audio("../audio/shoot2.ogg"),
										new Audio("../audio/shoot1.ogg"),
										new Audio("../audio/shoot2.ogg")];

var messageSounds = [ new Audio("../audio/message1.ogg",
																"../audio/message2.ogg",
																"../audio/message3.ogg")];

var spiderImage1 = new Image();
spiderImage1.src = "../img/spider1.png";

var spiderImage2 = new Image();
spiderImage2.src = "../img/spider2.png";

var Vec2 = dcodeIO.JustMath.Vec2;

var input = new Input();
document.addEventListener('keydown', input.keydown);
document.addEventListener('keyup', input.keyup);

function Game() {

	input.spacedown = false;

	function playSound(audios, volume) {
		var a = audios[Math.floor(Math.random() * audios.length)];
		a.volume = volume;
		a.play();
	}

	function playMessageSound() {
		playSound(messageSounds, 0.3);
	}

	function playEdgeDeadSound() {
		playSound(edgeDeadSounds, 0.6);
	}

	function playShipDeadSound() {
		playSound(shipDeadSounds, 1.0);
	}

	var shootIndex = 0;
	function playShootSound() {
		shootIndex++;
		var a = shootSounds[Math.round(shootIndex) % shootSounds.length];
		a.volume = 0.05;
		a.play();
	}

	var frames = [];

	var ship = new Ship(playShootSound);
	var powerUp = new PowerUp();
	var planets = [];
	var edges = [];
	var spiders = [];
	var bullets = [];

	var started = false;
	var startOffset = 0;

	var messages = ["", "", "", "", ""];
	var messageOffset = 0;

	var scoreFlashTime = 0;

	var stars = [];

	for(var i = 0; i < 100; i++) {
		stars.push(new Vec2(Math.round(Math.random() * 2000 - 1000), Math.round(Math.random() * 2000 - 1000)));
	}

	var canvas = document.getElementById('gameCanvas');
	var context = canvas.getContext('2d');

	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;	

	window.onresize=function(){
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;	
	};

	var startCap = false;

	// document.addEventListener('keyup', function (e) {

	// 	if(e.keyCode == 'C'.charCodeAt(0)) {
	// 		for(var i = 0; i < frames.length; i++) {
	// 			fs.writeFile("capture/frame"+zeroPad(i, 5)+".png", convert(frames[i]));
	// 		}
	// 	}

	// 	if(e.keyCode == 'X'.charCodeAt(0)) {
	// 		startCap = true;
	// 	}

	// 	if(e.keyCode == 27) {
	// 		gui.App.quit();
	// 	}
	// });

	var fps = 0;
	var previousTs = -1;

	var frameIndex = 0;

	var nextPlanetAddTime = Date.now() + 1000;
	var nextEdgeAddTime = Date.now() + 1000;
	var newPlanetRequired = false;
	var newSpiderRequired = false;

	this.running = true;
	var gameScope = this;

	var healthyEdgeCount = 0;


	function addEdge(planet1, planet2) {
		if(planet1 != planet2) {
			var newEdge = new Edge(planet1, planet2);
			edges.push(newEdge);
			planet1.edges.push(newEdge);
			planet2.edges.push(newEdge);

			planet1.healthyEdges += 1;
			planet2.healthyEdges += 1;

			healthyEdgeCount += 1;
			
			if(planets.length < 50 && planet1.healthyEdges > 1 && planet2.healthyEdges > 1) {
				newPlanetRequired = true;
			}
		}
	}

	function removeEdge(edge) {
		healthyEdgeCount -= 1;

		edge.planet1.healthyEdges -= 1;
    edge.planet2.healthyEdges -= 1;
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

	function upScore(amount, name) {
		playMessageSound();
		ship.score += amount;
		var chance = Math.random();
		var m = ""
		if(chance < 0.3) {
			m = name+" just made it!";
		} else if(chance < 0.6) {
			m = name+" escaped!";
		} else {
			m = name+" is saved!";
		}

		if(Math.random() < 0.01) {
			m+= " Thanks to you!";
		}
		messages.push(m);
		scoreFlashTime = Date.now();
	}

	function render() {
		if(!gameScope.running) {
			return;
		}

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

	  if(started) {

			if(planets.length < 7 || (newPlanetRequired && Date.now() > nextPlanetAddTime)) {
				var newPlanet = new Planet((Math.random() * 1000) - 500, (Math.random() * 1000) - 500);
				planets.push(newPlanet);
				nextPlanetAddTime += Math.random() * 5000;

				if(planets.length / 10 > spiders.length) {
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
		  	spiders[i].update(tick, ship, planets, addEdge, healthyEdgeCount);
		  }

			ship.update(tick, input, planets, edges, addBullet, spiders, playShipDeadSound, powerUp);

			for(var i = 0; i < bullets.length; i++) {
		  	bullets[i].update(tick, edges, removeEdge);
		  }

		  for(var i = 0; i < edges.length; i++) {
		  	edges[i].update(tick, playEdgeDeadSound, healthyEdgeCount, removeEdge);
		  }
		  powerUp.update(tick, ship, spiders);
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

	  if(started && (ship.lives > 0 || (Date.now() - ship.deadTime < 6000))) {
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

		  powerUp.render(context);

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

		  var scoreSize = 35;
		  var scoreOffset = 0;
		  var sinceFlash = Date.now() - scoreFlashTime
		  if(sinceFlash < 250) {
		  	scoreSize += Math.round(sinceFlash / 20);
		  	scoreOffset -= (sinceFlash / 40);
		  }

			context.fillStyle="#FFFFFF";
			context.strokeStyle="#000000";
			context.lineWidth = 4;
			context.font = "italic "+scoreSize+"pt sans-serif";
			context.strokeText(""+ship.score, 105, 43-scoreOffset);
		  context.fillText(""+ship.score, 105, 43-scoreOffset);

		  messageOffset = Math.max(0, messageOffset - (10 * messages.length * tick));
		  if(messageOffset <= 0) {
		  	messageOffset = 35;
				messages.splice(0, 1);
		  }
		  context.font = '15pt monospace';
		  for(var i = 0; i < messages.length; i++) {
		  	context.strokeText(messages[i], 20, 70 + messageOffset + (35 * i));
		  }
		  for(var i = 0; i < messages.length; i++) {
		  	context.fillText(messages[i], 20, 70 + messageOffset + (35 * i));
		  }
		} else {
			ship.x = 0;
			ship.y = 0;
			context.fillStyle="#FFFFFF";
			context.strokeStyle="#000000";
			context.font = '20pt monospace';
			context.lineWidth = 4;

			startOffset -= (tick * 50);

			var yOffset = startOffset;
			var xOffset = -200;

			if(ship.lives > 0) {
				context.strokeText("Galactic Pest Control", xOffset, yOffset);
				context.fillText("Galactic Pest Control", xOffset, yOffset);

				context.font = '15pt monospace';
				yOffset += 40;
				context.strokeText("Huge spiders are ensnaring", xOffset, yOffset);
				context.fillText("Huge spiders are ensnaring", xOffset, yOffset);

				yOffset += 40;
				context.strokeText("all the planets in the galaxy.", xOffset, yOffset);
				context.fillText("all the planets in the galaxy.", xOffset, yOffset);

				yOffset += 40;
				context.strokeText("Only you can stop them.", xOffset, yOffset);
				context.fillText("Only you can stop them.", xOffset, yOffset);

				yOffset += 40;
				context.strokeText("WSAD controls the ship.", xOffset, yOffset);
				context.fillText("WSAD controls the ship.", xOffset, yOffset);

				yOffset += 40;
				context.strokeText("Spacebar to fire.", xOffset, yOffset);
				context.fillText("Spacebar to fire.", xOffset, yOffset);

				yOffset += 40;
				context.strokeText("They are invulnerable.", xOffset, yOffset);
				context.fillText("They are invulnerable.", xOffset, yOffset);

				yOffset += 40;
				context.strokeText("Aim for their webs.", xOffset, yOffset);
				context.fillText("Aim for their webs.", xOffset, yOffset);

				yOffset += 40;
				context.strokeText("Good Luck!", xOffset, yOffset);
				context.fillText("Good Luck!", xOffset, yOffset);

				yOffset += 40;
				context.strokeText("<Push spacebar to start>", xOffset, Math.max(0, yOffset));
				context.fillText("<Push spacebar to start>", xOffset, Math.max(0, yOffset));

 				if(nwk) {
					yOffset += 40;
					context.font = '10pt monospace';
					context.strokeText("(Press <esc> to quit)", xOffset, Math.max(40, yOffset));
					context.fillText("(Press <esc> to quit)", xOffset, Math.max(40, yOffset));
				}

				if(input.spacedown) {
					started = true;
					input.spacedown = false;
					startOffset = 0;
				}
				
			} else {
				context.strokeText("Game Over!", xOffset, yOffset);
				context.fillText("Game Over!", xOffset, yOffset);

				context.font = '15pt monospace';
				yOffset += 40;
				context.strokeText("You scored "+ship.score, xOffset, yOffset);
				context.fillText("You scored "+ship.score, xOffset, yOffset);

				yOffset += 40;
				context.strokeText("<Push spacebar to play again>", xOffset, Math.max(0, yOffset));
				context.fillText("<Push spacebar to play again>", xOffset, Math.max(0, yOffset));

				if(input.spacedown) {
					gameScope.running = false;

					game = new Game();
				}
			}
		}


	 //  if(startCap && frameIndex % 3 == 0) {
		// 	frames.push(canvas.toDataURL("image/png"));
		// }

		if(gameScope.running) {
			requestAnimationFrame(render);
		}
	}

	requestAnimationFrame(render);
}

game = new Game();