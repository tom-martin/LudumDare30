function Edge(planet1, planet2) {

  function update() {
    
  }

  function render(context) {
    var diff = new Vec2(planet1.pos).sub(planet2.pos);
    var l = 255 - Math.min(255, Math.abs(diff.mag() / 6));
    var ci = Math.floor(l).toString(16);
    var c = "#"+ci+ci+ci;

    context.strokeStyle=c;
    context.lineWidth = 5;

    var perp1 = diff.norm().ort();
    var perp2 = perp1.clone();
    
    perp1.scale(planet1.radius * 0.1);
    perp2.scale(planet2.radius * 0.1);

    context.beginPath();
    context.moveTo(planet1.pos.x + perp1.x, planet1.pos.y + perp1.y);
    context.lineTo(planet2.pos.x - perp2.x, planet2.pos.y - perp2.y);
    context.lineTo(planet2.pos.x + perp2.x, planet2.pos.y + perp2.y);
    context.lineTo(planet1.pos.x - perp1.x, planet1.pos.y - perp1.y);
    context.lineTo(planet1.pos.x + perp1.x, planet1.pos.y + perp1.y);
    context.stroke();
  }

  this.update = update;
  this.render = render;
  this.planet1 = planet1;
  this.planet2 = planet2;
}