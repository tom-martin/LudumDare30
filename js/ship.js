function Ship() {
  var rotationSpeed = 20;
  var momentumSpeed = 2500;

  var speed = 300;

  this.rotation = 0;
  this.x = 0;
  this.y = 0;

  var k2 = 170;
  var maxStuckSpeed =75;

  var momentumX = 0;
  var momentumY = 0;

  var movementVec = new Vec2(0, 0);
  var previousVec = new Vec2(0, 0);

  var colRadius = 15;
  var collided = false;
  var edgeColliding = false;
  var edgeCollidingStart = -1;
  var stuck = false;
  var stuckEdge = null;

  var planetIndex = 0;
  var collidedPlanet = null;

  function testPlanetCollision(planet, tick) {
    if(!( this.x + colRadius < planet.pos.x - planet.radius ||
            this.x - colRadius > planet.pos.x + planet.radius ||
            this.y + colRadius < planet.pos.y - planet.radius ||
            this.y - colRadius > planet.pos.y + planet.radius)) {
      var difference = new Vec2(this.x, this.y).sub(planet.pos);
      if(Math.abs(difference.mag()) < colRadius + planet.radius) {
        difference.norm();
        this.x += difference.x * (tick * speed);
        this.y += difference.y * (tick * speed);
        return true;
      }
    }

    return false;
  }

  function closestPoint(x, y, edge) {
    var seg_v = new Vec2(edge.planet2.pos).sub(edge.planet1.pos);
    var seg_v_mag = seg_v.mag();
    var pt_v = new Vec2(x, y).sub(edge.planet1.pos);
    
    seg_v.norm();
    var proj = pt_v.dot(seg_v);
    if (proj <= 0) {
      return edge.planet1.pos.clone();
    }
    if(proj >= seg_v_mag) {
      return edge.planet1.pos.clone();
    }
        
    return seg_v.scale(proj).add(edge.planet1.pos);
  }

 function testEdgeCollision(edge, tick) {
    var closest = closestPoint(this.x, this.y, edge);
    var dist_v = new Vec2(this.x, this.y).sub(closest);
    return dist_v.mag() < colRadius;
  }


  function update(tick, input, planets, edges) {

    edgeColliding = false;
    for(var i = 0; i < edges.length; i++) {
      var edge = edges[i];
      if(this.testEdgeCollision(edge, tick)) {
        edgeColliding = true;
        if(edgeCollidingStart == -1) {
          stuckEdge = edge;
          edgeCollidingStart = Date.now();
        }
        break;
      }
    }

    var timeSince = (Date.now() - edgeCollidingStart);
    if(edgeCollidingStart != -1 && timeSince < 3000) {
      stuck = true;
    } else if(timeSince < 6000) {
      stuck = false;
      stuckEdge = null;
    } else {
      edgeCollidingStart = -1;
    }

    movementVec.set(0, 0);

    if(input.rightdown) {
      movementVec.x = 1;
    }

    if(input.leftdown) {
      movementVec.x = -1;
    }

    if(input.downdown) {
      movementVec.y = 1;
    }

    if(input.updown) {
      movementVec.y = -1;
    }
    
    movementVec.norm();

    if(input.rightdown || input.leftdown || input.updown || input.downdown) {
      previousVec.set(movementVec);
    }

    var targetRotation = Math.atan2(previousVec.y, previousVec.x)+(Math.PI/2);
    this.rotation = this.rotation % (Math.PI * 2);
    var rotationDA = targetRotation - this.rotation;
    var rotationDB =  targetRotation - ((Math.PI * 2) +this.rotation);
    var rotationDC =  targetRotation - (this.rotation - (Math.PI * 2) );
    var rotationD = rotationDA;
    if(Math.abs(rotationDB) < Math.abs(rotationD)) {
      rotationD = rotationDB;
      this.rotation += (Math.PI * 2);
    }
    if(Math.abs(rotationDC) < Math.abs(rotationD)) {
      rotationD = rotationDC;
      this.rotation -= (Math.PI * 2);
    }
    this.rotation += Math.max(-tick*rotationSpeed, Math.min(tick*rotationSpeed, rotationD));

    if(stuck) {
      this.x += movementVec.x * tick*speed * 0.1;
      this.y += movementVec.y * tick*speed * 0.1;

      var diff1 = new Vec2(this.x, this.y)
      diff1.sub(stuckEdge.planet1.pos).norm();

      var diff2 = new Vec2(this.x, this.y);
      diff2.sub(stuckEdge.planet2.pos).norm();

      this.x -= (diff1.x * tick * maxStuckSpeed);
      this.x -= (diff2.x * tick * maxStuckSpeed);
      this.y -= (diff1.y * tick * maxStuckSpeed);
      this.y -= (diff2.y * tick * maxStuckSpeed);
    } else {
      this.x += movementVec.x * tick*speed;
      this.y += movementVec.y * tick*speed;
    }

    collided = false;
    if(collidedPlanet && this.testPlanetCollision(collidedPlanet, tick)) {
      collided = true;
      collidedPlanet = collidedPlanet; 
    }

    for(var i = 0; i < Math.min(planets.length, 50); i++) {
      var planet = planets[planetIndex];
      if(this.testPlanetCollision(planet, tick)) {
        collided = true;
        collidedPlanet = planet;
      }

      planetIndex += 1;
      if(planetIndex >= planets.length) {
        planetIndex = 0;
      }
    }
  }

  function render(context) {
    if(stuckEdge != null) {
      stuckEdge.drawBetween(new Vec2(this.x, this.y), colRadius, stuckEdge.planet1.pos, stuckEdge.planet1.radius);
      stuckEdge.drawBetween(new Vec2(this.x, this.y), colRadius, stuckEdge.planet2.pos, stuckEdge.planet2.radius);
    }
    if(collided) {
      context.fillStyle="#FFAAAA";
    } else {
      context.fillStyle="#FFFFAA";
    }

    var jitterX = 0;
    var jitterY = 0;
    if(stuck) {
      jitterX += (Math.random() * 4)- 2
      jitterY += (Math.random() * 4)- 2
    }

    context.translate(this.x, this.y);
    context.rotate(this.rotation);
    context.fillRect(jitterX-10, jitterY-10, 20, 20);
    context.beginPath();
    context.arc(jitterX,jitterY-10,10,0,2*Math.PI);
    context.fill();

    // context.strokeStyle="#222222";
    // context.beginPath();
    // context.arc(0,0,colRadius,0,2*Math.PI);
    // context.stroke();

    context.rotate(-this.rotation);
    context.translate(-this.x, -this.y);
  }

  this.update = update;
  this.render = render;
  this.testPlanetCollision = testPlanetCollision;
  this.testEdgeCollision = testEdgeCollision;
}