function Ship() {
  var rotationSpeed = 10;
  var momentumSpeed = 2500;

  var speed = 500;

  this.rotation = 0;
  this.x = 0;
  this.y = 0;

  this.lives = 5;
  this.dead = false;
  this.deadTime = 0;

  this.pos = new Vec2(this.x, this.y);

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

  var maxFireFreq = 500;
  var lastFireTime = Date.now();

  var origin = new Vec2(0, 0);

  function testSpiderCollision(spider, tick) {
    if(!( this.x + colRadius < spider.pos.x - spider.radius ||
            this.x - colRadius > spider.pos.x + spider.radius ||
            this.y + colRadius < spider.pos.y - spider.radius ||
            this.y - colRadius > spider.pos.y + spider.radius)) {
      var difference = new Vec2(this.x, this.y).sub(spider.pos);
      if(Math.abs(difference.mag()) < colRadius + spider.radius) {
        return true;
      }
    }

    return false;
  }

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


  function update(tick, input, planets, edges, addBullet, spiders) {
    var now = Date.now();
    var recentlyDead = (now - this.deadTime < 6000);

    edgeColliding = false;
    if(!recentlyDead) {
      for(var i = 0; i < edges.length; i++) {
        var edge = edges[i];
        if(edge.health > 0) {
          if(this.testEdgeCollision(edge, tick)) {
            edgeColliding = true;
            if(edgeCollidingStart == -1) {
              stuckEdge = edge;
              edgeCollidingStart = now;
            }
            break;
          }
        }
      }
    }

    var timeSince = (now - edgeCollidingStart);
    if(edgeCollidingStart != -1 && timeSince < 3000) {
      stuck = true;
    } else if(timeSince < 6000) {
      stuck = false;
      stuckEdge = null;
    } else {
      edgeCollidingStart = -1;
    }

    movementVec.set(0, 0);

    if(!this.dead) {
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

    if(now - this.deadTime > 6000) {
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

      for(var i = 0; i < spiders.length; i++) {
        var spider = spiders[i];
        if(this.testSpiderCollision(spider, tick)) {
          this.dead = true;
          stuck = false;
          this.deadTime = now;
        }
      }
    }

    var fireFreq = maxFireFreq / spiders.length;
    if(!stuck && !recentlyDead && input.spacedown && now - lastFireTime > fireFreq) {
      var m = new Vec2(0, -1).rotate(this.rotation);
      addBullet(new Bullet(this.x, this.y, m));
      lastFireTime = now;
    }

    this.pos.set(this.x, this.y);
    if(Math.abs(this.pos.distSq(origin)) > 1000000) {
      origin.sub(this.pos);
      origin.norm();

      this.x += origin.x * tick * (speed * 2);
      this.y += origin.y * tick * (speed * 2);

      origin.set(0, 0);
    }

    if(now - this.deadTime > 3000) {
      this.dead = false;
    }
  }

  function render(context) {
    var now = Date.now();
    if(now - this.deadTime < 3000) {
      return;
    }
    if(now - this.deadTime < 6000 && (now % 500) < 250) {
      return;
    }
    if(stuckEdge != null) {
      stuckEdge.drawBetween(new Vec2(this.x, this.y), colRadius, stuckEdge.planet1.pos, stuckEdge.planet1.radius);
      stuckEdge.drawBetween(new Vec2(this.x, this.y), colRadius, stuckEdge.planet2.pos, stuckEdge.planet2.radius);
    }
    
    context.fillStyle="#FFFF88";
    

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
    context.moveTo(0, 0);
    context.arc(jitterX,jitterY-10,10,0,2*Math.PI);
    context.fill();

    context.rotate(-this.rotation);
    context.translate(-this.x, -this.y);
  }

  this.update = update;
  this.render = render;
  this.testPlanetCollision = testPlanetCollision;
  this.testEdgeCollision = testEdgeCollision;
  this.testSpiderCollision = testSpiderCollision;
}