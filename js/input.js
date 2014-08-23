function Input() {
  this.leftdown = false;
  this.rightdown = false;
  this.updown = false;
  this.downdown = false;

  var inputThis = this;

  function keydown(e) {
    if (e.keyCode == 65) {
      inputThis.leftdown = true;
    }

    if (e.keyCode == 68) {
      inputThis.rightdown = true;
    }

    if (e.keyCode == 87) {
      inputThis.updown = true;
    }

    if (e.keyCode == 83) {
      inputThis.downdown = true;
    }
  }

  function keyup(e) {
    if (e.keyCode == 65) {
      inputThis.leftdown = false;
    }

    if (e.keyCode == 68) {
      inputThis.rightdown = false;
    }

    if (e.keyCode == 87) {
      inputThis.updown = false;
    }

    if (e.keyCode == 83) {
      inputThis.downdown = false;
    }
  }

  this.keydown = keydown;
  this.keyup = keyup;
}