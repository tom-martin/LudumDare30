function Planet(startX, startY) {
  this.pos = new Vec2(startX, startY);
  this.disp = new Vec2(0, 0);

  this.edges = [];

  this.healthyEdges = 0;

  var k = 230;
  var k2 = 250;

  var maxSpeed = 500;

  this.hadAnEdge = false;

  this.radius = 10 + (Math.random() * 40);
  var origin = new Vec2(0, 0);

  var r = Math.floor((100 + Math.random()*156)).toString(16);
  var g = Math.floor((100 + Math.random()*156)).toString(16);
  var b = Math.floor((100 + Math.random()*156)).toString(16);

  var c = "#"+r+g+b;

  function update(tick, planets, centerX, centerY) {
    this.disp.set(0, 0);

    // Push away from other planets
    for(var i = 0; i < planets.length; i++) {
      var p = planets[i];
      var diff = new Vec2(this.pos).sub(p.pos);
      var distance = diff.mag();

      if(distance != 0) {
        this.disp.x += (diff.x / distance) * ((k * k) / distance);
        this.disp.y += (diff.y / distance) * ((k * k) / distance);
      }
    }

    // Push toward connected planets
    for(var i = 0; i < this.edges.length; i++) {
      var edge = this.edges[i];
      if(edge.health > 0) {
        var otherPlanet = edge.planet1;
        if(otherPlanet == this) {
          otherPlanet = edge.planet2;
        }

        var diff = new Vec2(this.pos).sub(otherPlanet.pos);
        var distance = diff.mag() + 0.1;

        if(distance != 0) {
          this.disp.x -= (diff.x / distance) * ((distance * distance) / k2);
          this.disp.y -= (diff.y / distance) * ((distance * distance) / k2);
        }
      }

    }

    // Gravitate to center)
    var diff = new Vec2(this.pos).sub(centerX, centerY);
    var distance = diff.mag() + 0.1;
    if(this.healthyEdges > 0) {
      this.hadAnEdge = true;
    }
    if(this.healthyEdges > 0 || !this.hadAnEdge) {
      this.disp.x -= (diff.x / distance) * ((distance * distance) / k2);
      this.disp.y -= (diff.y / distance) * ((distance * distance) / k2);
    }
    

    this.disp.x = Math.max(-maxSpeed, this.disp.x);
    this.disp.y = Math.max(-maxSpeed, this.disp.y);
    this.disp.x = Math.min(maxSpeed, this.disp.x);
    this.disp.y = Math.min(maxSpeed, this.disp.y);

    this.pos.add(this.disp.x * tick, this.disp.y * tick);

    if(Math.abs(this.pos.distSq(origin)) > 4000000) {
      this.hadAnEdge = false;
      this.healthyEdges = 0;
      this.pos.set(startX, startY);

      var r = Math.floor((100 + Math.random()*156)).toString(16);
      var g = Math.floor((100 + Math.random()*156)).toString(16);
      var b = Math.floor((100 + Math.random()*156)).toString(16);

      c = "#"+r+g+b;
      
      this.radius = 10 + (Math.random() * 40);
    }
  }

  function render(context) {
    context.fillStyle=c;
    context.translate(this.pos.x, this.pos.y);
    context.beginPath();
    context.moveTo(0, 0);
    context.arc(0,0,this.radius,0,2*Math.PI);
    context.fill();

    // context.strokeStyle = "#FEFEFE";
    // context.rect(- this.radius, -this.radius, this.radius * 2, this.radius * 2);
    // context.stroke();

    context.translate(-this.pos.x, -this.pos.y);
  }

  this.update = update;
  this.render = render;
}