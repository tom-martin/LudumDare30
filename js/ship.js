function Ship() {
  var rotationSpeed = 20;
  var momentumSpeed = 2500;

  var speed = 300;

  this.rotation = 0;
  this.x = 0;
  this.y = 0;

  var momentumX = 0;
  var momentumY = 0;

  var movementVec = new Vec2(0, 0);
  var previousVec = new Vec2(0, 0);

  var colRadius = 15;
  var collided = false;

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


  function testEdgeCollision(edge, tick) {
    // Transform to local coordinates
    var localP1 = new Vec2(edge.planet1.pos).sub(this.x, this.y);
    // var LocalP2 = LineP2 – CircleCentre;
    // // Precalculate this value. We use it often
    // P2MinusP1 = LocalP2 – LocalP1 

    // a = (P2MinusP1.X) * (P2MinusP1.X) + (P2MinusP1.Y) * (P2MinusP1.Y)
    // b = 2 * ((P2MinusP1.X * LocalP1.X) + (P2MinusP1.Y * LocalP1.Y))
    // c = (LocalP1.X * LocalP1.X) + (LocalP1.Y * LocalP1.Y) – (Radius * Radius)
    // delta = b * b – (4 * a * c)
    // if (delta < 0) // No intersection
    //   return null;
    // else if (delta == 0) // One intersection
    //   u = -b / (2 * a)
    //   return LineP1 + (u * P2MinusP1)
    //   /* Use LineP1 instead of LocalP1 because we want our answer in global
    //      space, not the circle's local space */
    // else if (delta > 0) // Two intersections
    //   SquareRootDelta = sqrt(delta)

    //   u1 = (-b + SquareRootDelta) / (2 * a)
    //   u2 = (-b - SquareRootDelta) / (2 * a)

    //   return { LineP1 + (u1 * P2MinusP1) ; LineP1 + (u2 * P2MinusP1)}
  }

  function update(tick, input, planets, edges) {
    // var damp = Math.min(0.99, (20 * tick));
    // if(damp == 0.99) {
    //   console.log("Warning. Max Damping "+(50 * tick))
    // }
    // momentumX *= damp;
    // momentumY *= damp;
    // if(input.leftdown) {
    //   this.rotation -= (tick * rotationSpeed);
    // }

    // if(input.rightdown) {
    //   this.rotation += (tick * rotationSpeed);
    // }

    // if(input.updown) {
    //   var momentumDelta = tick * momentumSpeed;
    //   momentumX += ((0) * Math.cos(this.rotation)) - ((-momentumDelta) * Math.sin(this.rotation));
    //   momentumY += ((momentumDelta) * Math.cos(this.rotation)) - ((0) * Math.sin(this.rotation));

    //   momentumX = Math.min(momentumX, momentumSpeed);
    //   momentumY = Math.min(momentumY, momentumSpeed);
    //   momentumX = Math.max(momentumX, -momentumSpeed);
    //   momentumY = Math.max(momentumY, -momentumSpeed);
    // }

    // this.x += (tick * momentumX);
    // this.y -= (tick * momentumY);

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

    this.x += movementVec.x * tick*speed;
    this.y += movementVec.y * tick*speed;

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

    for(var i = 0; i < edges.length; i++) {
      var edge = edges[i];
      this.testEdgeCollision(edge, tick);
    }
  }

  function render(context) {
    if(collided) {
      context.fillStyle="#FFAAAA";
    } else {
      context.fillStyle="#EEEEEE";
    }
    context.translate(this.x, this.y);
    context.rotate(this.rotation);
    context.fillRect(-10, -10, 20, 20);
    context.fillRect(-10, -10, 20, 20);
    context.beginPath();
    context.arc(0,-10,10,0,2*Math.PI);
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