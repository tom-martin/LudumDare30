function Edge(planet1, planet2) {

  function update() {
    
  }

  var health = 2 + Math.round(Math.random() * 8);

  function drawBetween(a, aRadius, b, bRadius) {
    var diff = new Vec2(a).sub(b);
    var l = 255 - Math.min(255, Math.abs(diff.mag() / 6));
    var ci = Math.floor(l).toString(16);
    var c = "#"+ci+ci+ci;

    context.strokeStyle=c;
    context.lineWidth = health;

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
    this.drawBetween(planet1.pos, planet1.radius, planet2.pos, planet2.radius);
  }

  this.update = update;
  this.render = render;
  this.planet1 = planet1;
  this.planet2 = planet2;
  this.drawBetween = drawBetween;
}