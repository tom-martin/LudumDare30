function Spider(startX, startY, img1, img2) {
  this.pos = new Vec2(startX, startY);
  this.disp = new Vec2(0, 0);

  var targetPlanet = null;
  var prevPlanet = null;
  var speed = 550;
  var colRadius = 25;
  this.radius = colRadius;

  var dummyEdge = new Edge();

  var rotation = 0;
  var rotationSpeed = 6;

  function testPlanetCollision(planet, tick) {
    if(!( this.pos.x + colRadius < planet.pos.x - planet.radius ||
            this.pos.x - colRadius > planet.pos.x + planet.radius ||
            this.pos.y + colRadius < planet.pos.y - planet.radius ||
            this.pos.y - colRadius > planet.pos.y + planet.radius)) {
      var difference = new Vec2(this.pos.x, this.pos.y).sub(planet.pos);
      if(Math.abs(difference.mag()) < colRadius + planet.radius) {
        return true;
      }
    }

    return false;
  }

  function update(tick, planets, addEdge) {
    this.disp.set(0, 0);

    if(targetPlanet == null) {
      if(planets.length > 0) {
        var randPlanet = planets[Math.floor(Math.random() * planets.length)];
        if(randPlanet != prevPlanet && (!randPlanet.hadAnEdge || randPlanet.healthyEdges > 0)) { 
          targetPlanet = planets[Math.floor(Math.random() * planets.length)];
        }
      }
    } else {
      this.disp.set(targetPlanet.pos);
      this.disp.sub(this.pos);
      this.disp.norm();

      if(this.testPlanetCollision(targetPlanet)) {
        if(prevPlanet == null) {
          prevPlanet = targetPlanet;
        } else {
          addEdge(prevPlanet, targetPlanet);
          prevPlanet = null;
        }
        targetPlanet = null;
      }
    }

    if(targetPlanet != null && targetPlanet.hadAnEdge && targetPlanet.healthyEdges <= 0) {
        targetPlanet = null;
    }

    if(prevPlanet != null && prevPlanet.hadAnEdge && prevPlanet.healthyEdges <= 0) {
        prevPlanet = null;
    }

    var adjSpeed = speed;

    if(ship.stuck && !ship.dead) {
      this.disp.set(ship.x, ship.y);
      this.disp.sub(this.pos);
      var dist = Math.abs(this.disp.mag());
      this.disp.norm();

      adjSpeed *= (Math.min(300, dist) / 300);
    }

    
    var targetRotation = Math.atan2(this.disp.y, this.disp.x)-(Math.PI/2);
    rotation += Math.max(-tick*rotationSpeed, Math.min(tick*rotationSpeed, targetRotation - rotation));
    

    this.pos.add(this.disp.x * tick * adjSpeed, this.disp.y * tick * adjSpeed);
  }

  function render(context) {
    if(prevPlanet != null) {
      dummyEdge.drawBetween(this.pos, colRadius, prevPlanet.pos, prevPlanet.radius);
    }

    // context.fillStyle="#000000";
    // context.strokeStyle="#FFFFFF";
    context.translate(this.pos.x, this.pos.y);
    context.rotate(rotation);
    // context.fillRect(-25,-25,50,50);
    // context.beginPath();
    // context.moveTo(0, 0);
    // context.rect(-25,-25,50,50);
    // context.stroke();
    var img = img1;
    if((Date.now()) % 600 > 300) {
      img = img2;
    }
    context.drawImage(img, -img.width / 2, -img.height / 2);
    context.rotate(-rotation);
    context.translate(-this.pos.x, -this.pos.y);
  }

  this.update = update;
  this.render = render;
  this.testPlanetCollision = testPlanetCollision;
}