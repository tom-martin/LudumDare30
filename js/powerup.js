function PowerUp() {
   this.pos = new Vec2(0, 0);
   this.disp = new Vec2(0, 0);

  var speed = 501;
  var colRadius = 10;

  this.active = false;

  this.caughtCount = 1;

  function update(tick, ship, spiders) {
    if(this.active && !ship.dead) {
      this.disp.set(ship.x, ship.y);
      this.disp.sub(this.pos);
      var dist = Math.abs(this.disp.mag());
      this.disp.norm();

      this.pos.x += this.disp.x * speed * tick;
      this.pos.y += this.disp.y * speed * tick;

      if(!( this.pos.x + colRadius < ship.x - 15 ||
            this.pos.x - colRadius > ship.x + 15 ||
            this.pos.y + colRadius < ship.y - 15 ||
            this.pos.y - colRadius > ship.y + 15)) {
        var difference = new Vec2(this.pos.x, this.pos.y).sub(ship.pos);
        if(Math.abs(difference.mag()) < colRadius + 15) {
          this.active = false;
          this.caughtCount += 1;
          this.pos.x = 0;
          this.pos.y = 0;
        }
      }
    } else {
      if(this.caughtCount < Math.min(4, spiders.length)) {
        this.active = true;
      }
    }
  }

  function render(context) {
    if(this.active) {
      context.translate(this.pos.x, this.pos.y);
      context.fillStyle = "#FFFF88";

      context.beginPath();
      context.arc(0,0,10,0,2*Math.PI);
      context.fill();

      context.fillStyle = "#000000";
      context.fillRect(-4, -1, 8, 2);
      context.fillRect(-1, -4, 2, 8);
      context.translate(-this.pos.x, -this.pos.y);
    }
  }

  this.update = update;
  this.render = render;
}