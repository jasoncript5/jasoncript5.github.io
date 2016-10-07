// shim layer with setTimeout fallback
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})()

// Key detection 

var keys = {};

var keydown = {
  'a': 65,
  'd': 68,
  'space': 32
}

window.addEventListener('keydown', function(e) {
  var keyCode = e.keyCode?e.keyCode:e.charCode;
  keys[keyCode] = true;
  e.preventDefault();
});

window.addEventListener('keyup', function(e) {
  	var keyCode = e.keyCode?e.keyCode:e.charCode;
    delete keys[keyCode];
});

var sWidth = 640, sHeight = 480;

var images;
var bCanvas, bCtx;
var sCanvas, sCtx;

var started = false;

var healthTxt = document.getElementById('Health');
var scoreTxt = document.getElementById('Score');

function addCanvas(canvas, ctx) {
  canvas = document.createElement('canvas');
  
  canvas.width = sWidth;
  canvas.height = sHeight;
  
  document.body.appendChild(canvas);
  
  return canvas;
}

function Images() {
  this.background = new Image();
  this.background.src = "http://il6.picdn.net/shutterstock/videos/4699283/thumb/1.jpg";
  
  this.playerShip = new Image();
  this.playerShip.src = "http://vignette4.wikia.nocookie.net/theuncledolanshow/images/9/95/Spoderman.gif/revision/latest?cb=20130403143047";
  
  this.enemyShip = new Image();
  this.enemyShip.src = "http://cdn.overclock.net/1/1a/900x900px-LL-1a87c97a_Spoderman.gif";
  
  this.bullet = new Image();
  this.bullet.src = "http://www.gameloft.com/minisites/spidermanunlimited-us/images/web.png";
}

var math = function() {
  this.clamp = function(i, min, max) {
    return Math.max(Math.min(i, max),min);
  }
}

var m = new math();

function Point(x, y) {
  this.x = x || 0;
  this.y = y || 0;
  
  this.set = function(point) {
    this.x = point.x;
    this.y = point.y;
  }
  
  this.add = function(point) {
    this.x += point.x;
    this.y += point.y;
  }
  
  this.subtract = function(point) {
    this.x -= point.x;
    this.y -= point.y;
  }
}

function Sprite(img, x, y, width, height) {
  this.image = img;
  this.size = new Point(width, height);
  this.pos = new Point(x, y);
  
  this.draw = function(ctx) {
    ctx.drawImage(this.image, this.pos.x, this.pos.y, this.size.x, this.size.y);
  }
}

function collidesWith(sprite1, sprite2) {
    if (sprite1.sprite.pos.x < sprite2.sprite.pos.x + sprite2.sprite.size.x &&
        sprite1.sprite.pos.x + sprite1.sprite.size.x > sprite2.sprite.pos.x   &&
       	sprite1.sprite.pos.y < sprite2.sprite.pos.y + sprite2.sprite.size.y &&
        sprite1.sprite.pos.y + sprite1.sprite.size.y > sprite2.sprite.pos.y) {
      return true;
    } else {
      return false;
    }
  }

function Player() {
  var pWidth = 50, pHeight = pWidth * (16/9);
  this.sprite = new Sprite(images.playerShip, sWidth / 2 - (pWidth / 2), sHeight - pHeight, pWidth, pHeight);
  
  var playerSpeed = 7;

  var bulletSx = this.sprite.pos.x + pWidth/2;
  var bulletSy = this.sprite.pos.y;
  var bullets = [];
  
  var counter = 0;
  var maxBullets = 4;
  
  this.health = 50;
  this.score = 0;
  this.dead = false;
  
  this.getBullets = function() {
    return bullets;
  }
  
  this.update = function() {
    bulletSx = this.sprite.pos.x + pWidth/2;
  	bulletSy = this.sprite.pos.y;
    healthTxt.innerHTML = "Health: " + this.health;
    scoreTxt.innerHTML = "Score: " + this.score;
    
    if (this.health <= 0) {
      this.dead = true;
    }
    
    if (keydown.a in keys) {
      this.sprite.pos.subtract(new Point(playerSpeed, 0));
    }
    
    if (keydown.d in keys) {
      this.sprite.pos.add(new Point(playerSpeed, 0));
    }
    
    if (keydown.space in keys) {
      if (bullets.length < maxBullets) {
      	var bullet = new Bullet("up", bulletSx, bulletSy);
				bullets.push(bullet);
      }
    }
    
    this.sprite.pos.x = m.clamp(this.sprite.pos.x, 0, sWidth - 50);
    
  }
  
  this.render = function() {
    for (var i = 0; i < bullets.length; i++) {
      if (bullets[i].sprite.pos.y <= 0 || bullets[i].sprite.pos.y + 10 >= sHeight) {
        bullets.splice(i, 1);
      } else {
       	bullets[i].update();
        bullets[i].render(); 
      }
    }
    this.sprite.draw(sCtx);
  }
}

function Enemy() {
  var x = Math.random() * (sWidth - 50);
  var y = Math.random() * ((sHeight / 2) - 100);
  this.sprite = new Sprite(images.enemyShip, x, y, 50, 50 * (16/9));
  
  var maxBullets = 4;
  var bullets = [];
  
  var bulletSx = this.sprite.pos.x + 50/2;
  var bulletSy = this.sprite.pos.y + 50;
  
  this.getBullets = function() {
    return bullets;
  }
  
  this.update = function() {
    bulletSx = this.sprite.pos.x + 50/2;
    bulletSy = this.sprite.pos.y + 50;
    setTimeout(function() {
      if (bullets.length < maxBullets) {
      	var bullet = new Bullet("down", bulletSx, bulletSy);
				bullets.push(bullet);
      }
    }, 900);
  }
  
  this.render = function() {
    for (var i = 0; i < bullets.length; i++) {
      if (bullets[i].sprite.pos.y <= 0 || bullets[i].sprite.pos.y + 10 >= sHeight) {
        bullets.splice(i, 1);
      } else {
       	bullets[i].update();
        bullets[i].render(); 
      }
    }
    this.sprite.draw(sCtx);
  }
}

function Bullet(direction, x, y) {
  this.sprite = new Sprite(images.bullet, x, y, 5, 10);
 
  var bulletSpeed = 8;
  var direction = direction;
  
  this.update = function() {
    if (direction == "up") {
      this.sprite.pos.subtract(new Point(0, bulletSpeed));
    } else if (direction == "down") {
      this.sprite.pos.add(new Point(0, bulletSpeed));
    }
  }
  
  this.render = function() {
    this.sprite.draw(sCtx);
  }
}

window.onload = function() {
  	bCanvas = addCanvas(bCanvas);
  	bCtx = bCanvas.getContext('2d');
  
  	sCanvas = addCanvas(bCanvas);
  	sCtx = bCanvas.getContext('2d');
  
  	images = new Images();
  
  	var g = new game();
		g.start();
  
 	 sCanvas.addEventListener('click', function() {
      if (!started)
      started = true;
    }, false);
}

var game = function() {
  	// Game Stuff
  	var backgroundImage = images.background;
  	var b1 = new Sprite(backgroundImage, 0, 0, 640, 480), b2 = new Sprite(backgroundImage, 0, -sHeight, 640, 480);
  
    var player = new Player();
  	var enemies = [];
  
  	for (var i = 0; i < enemies.length; i++) {
        var en = new Enemy();
      	enemies.push(en);
  	}
  
    this.start = function() {
         loop();   
    }
    
    var loop = function() {
        update();
        render();

        requestAnimFrame(loop.bind(this));
    }

    var update = function() {
      if (!player.dead && started) {
      player.update();
      var numBulletsP = player.getBullets();
      var numBulletsE;
      //console.log(numBullets.length);
      for (var i =0; i < numBulletsP.length; i++) {
        for (var e = 0; e < enemies.length; e++) {
          if (collidesWith(enemies[e], numBulletsP[i])) {
            enemies.splice(e, 1);
            numBulletsP.splice[i, 1];
            player.score += 1;
          }
        }
     }
      
      for (var i = 0; i < enemies.length; i++) {
        numBulletsE = enemies[i].getBullets();
        
        for (var j = 0; j < numBulletsE.length; j++) {
          if (collidesWith(player, numBulletsE[j])) {
            numBulletsE.splice(j, 1);
            player.health -= 0.5;
          }
        }
      }
      
      if (enemies.length < 1) {
      	enemies.push(new Enemy());
        enemies.push(new Enemy());
        enemies.push(new Enemy());
      }
      
      for (var i = 0; i < enemies.length; i++) {
    		enemies[i].update();
  		}
      
        if (b1.pos.y >= bCanvas.height) {
          b1.pos.subtract(new Point(0, sHeight*2));
        }
      
      	if (b2.pos.y >= bCanvas.height) {
          b2.pos.subtract(new Point(0, sHeight*2));
        }
      
      	b1.pos.add(new Point(0, 2));
      	b2.pos.add(new Point(0, 2));
      }
    }

    var render = function() {
      if (!player.dead && started) {
      	b1.draw(bCtx);
      	b2.draw(bCtx);
      	player.render();
      	for (var i = 0; i < enemies.length; i++) {
    		enemies[i].render();
  			}
      } else if (player.dead) {
        sCtx.clearRect(0, 0, sWidth, sHeight);
        bCtx.fillStyle = "black";
        bCtx.fillRect(0, 0, sWidth, sHeight);
        bCtx.fillStyle = "red";
        bCtx.font = "60px Comicsansms";
        bCtx.fillText("You Dead", (sWidth / 2) - 155, (sHeight / 2) + 30);
      }
      
      if (!started) {
        sCtx.clearRect(0, 0, sWidth, sHeight);
        bCtx.fillStyle = "black";
        bCtx.fillRect(0, 0, sWidth, sHeight);
        bCtx.fillStyle = "red";
        bCtx.font = "60px Comicsansms";
        bCtx.fillText("Click To Start", (sWidth / 2) - 180, (sHeight / 2) + 30);
      }
    }
}