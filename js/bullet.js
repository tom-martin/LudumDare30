function Bullet(startX, startY, movementVec) {
  this.pos = new Vec2(startX, startY);

  var speed = 1000;
  var colRadius = 4;

  this.active = true;

  var visualRadius = 2 + Math.round(Math.random()*4);

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
    var closest = closestPoint(this.pos.x, this.pos.y, edge);
    var dist_v = this.pos.clone().sub(closest);
    return dist_v.mag() < colRadius * 5;
  }

  function update(tick, edges) {
    if(this.active) {
      this.pos.add(movementVec.x * tick * speed, movementVec.y * tick * speed);

      for(var i = 0; i < edges.length; i++) {
        var edge = edges[i];
        if(edge.health > 0) {
          if(this.testEdgeCollision(edge)) {
            edge.health -= 2;

            if(edge.health <= 0) {
              edge.planet1.healthyEdges -= 1;
              edge.planet2.healthyEdges -= 1;
            }
            this.active = false;
            break;
          }
        }
      }
    }
  }

  function render(context) {
    if(this.active) {
      context.translate(this.pos.x, this.pos.y);
      context.fillStyle = "#FFFFFF"

      context.fillRect(-visualRadius,-visualRadius,visualRadius*2,visualRadius*2);
      context.translate(-this.pos.x, -this.pos.y);
    }
  }

  this.update = update;
  this.render = render;
  this.testEdgeCollision = testEdgeCollision;
}