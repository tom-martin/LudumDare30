function Spider(startX, startY) {
  this.pos = new Vec2(startX, startY);
  this.disp = new Vec2(0, 0);

  var targetPlanet = null;
  var prevPlanet = null;
  var speed = 500;
  var colRadius = 25;

  var dummyEdge = new Edge();

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
        if(randPlanet != prevPlanet) { 
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

    this.pos.add(this.disp.x * tick * speed, this.disp.y * tick * speed);
  }

  function render(context) {
    if(prevPlanet != null) {
      dummyEdge.drawBetween(this.pos, colRadius, prevPlanet.pos, prevPlanet.radius);
    }

    context.fillStyle="#000000";
    context.strokeStyle="#FFFFFF";
    context.translate(this.pos.x, this.pos.y);
    context.fillRect(-25,-25,50,50);
    context.rect(-25,-25,50,50);
    context.stroke();
    context.translate(-this.pos.x, -this.pos.y);
  }

  this.update = update;
  this.render = render;
  this.testPlanetCollision = testPlanetCollision;
}