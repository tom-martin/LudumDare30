function Edge(planet1, planet2) {
  var deathStartTime = -1;
  var shardSpeed = 100;

  function update(tick, playEdgeDeadSound, healthyEdgeCount, removeEdge) {
    var now = Date.now();
    if(this.health <= 0 && deathStartTime < 0) {
      playEdgeDeadSound();
      deathStartTime = now;

      for(var i = 0; i < deathShardLocs.length; i++) {
        var planet = i % 2 == 0 ? planet1 : planet2;
        deathShardLocs[i] = new Vec2(planet.pos);
        deathShardVels[i] = new Vec2((Math.random() * shardSpeed) - (shardSpeed / 2), (Math.random() * shardSpeed) - (shardSpeed / 2));
      }
    }

    if(deathStartTime > 0 && Date.now() - deathStartTime < 1000) {
      for(var i = 0; i < deathShardLocs.length; i++) {
        deathShardLocs[i].x += deathShardVels[i].x * tick;
        deathShardLocs[i].y += deathShardVels[i].y * tick;
      }
    }

    if(this.health > 0 && healthyEdgeCount >= 100) {
      this.health = 0;
      removeEdge(this);
      this.planet1.hadAnEdge = false;
      this.planet2.hadAnEdge = false;
      deathStartTime = 1;
    }
    
  }

  var deathShardLocs = [];
  var deathShardVels = [];
  var shardSpeed = 500;
  for(var i = 0; i < 10; i++) {
    deathShardLocs[i] = new Vec2(0, 0);
    deathShardVels[i] = new Vec2(0, 0);
  }

  this.health = 2 + Math.round(Math.random() * 8);

  function drawBetween(context, a, aRadius, b, bRadius) {
    var diff = new Vec2(a).sub(b);
    var l = 255 - Math.min(255, Math.abs(diff.mag() / 6));
    var ci = Math.floor(l).toString(16);
    var c = "#"+ci+ci+ci;

    context.strokeStyle=c;
    context.lineWidth = this.health;

    var perp1 = diff.norm().ort();
    var perp2 = perp1.clone();
    
    perp1.scale(aRadius * 0.1);
    perp2.scale(bRadius * 0.1);

    context.beginPath();
    context.moveTo(a.x + perp1.x, a.y + perp1.y);
    context.lineTo(b.x - perp2.x, b.y - perp2.y);
    context.lineTo(b.x + perp2.x, b.y + perp2.y);
    context.lineTo(a.x - perp1.x, a.y - perp1.y);
    context.lineTo(a.x + perp1.x, a.y + perp1.y);
    context.stroke();
  }

  function render(context) {
    if(this.health > 0) {
      this.drawBetween(context, planet1.pos, planet1.radius, planet2.pos, planet2.radius);
    } else if(deathStartTime > 0 && Date.now() - deathStartTime < 1000) {
      context.fillStyle="#FFFFFF";
      for(var i = 0; i < deathShardLocs.length; i++) {
        var loc = deathShardLocs[i];
        context.fillRect(loc.x, loc.y, 10, 10)
      }
    }
  }

  this.update = update;
  this.render = render;
  this.planet1 = planet1;
  this.planet2 = planet2;
  this.drawBetween = drawBetween;
}