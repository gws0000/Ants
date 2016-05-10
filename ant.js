//Changed in VM
const DEAD = 0;
const ALIVE = 1;

var ANT_Game = {
	running: false,
	c: null,
	ctx: null,
	gridPath: null,
	cs: 20,
	x0: 50,
	y0: 50,
	w: 600,
	h: 400,
	cells: [],
	loops: 0,
	timeFPS: 0,
	countFPS: 0,
	timeLast: 0,
	maxAge: 30,
	spawnChance: 0.3,
	ants: [],
	lastID: 0,
	nextID: function() {
		return this.lastID++;
	},
  
	//Initializes the simulation
	//	1)  Calculates some grid size parameters
	//	2)  Creates a canvas/context for drawing
	//  3)  Starts the animation cycle running
	init: function() {
		$("BODY").append($("<canvas id='myCanvas' width=" + (ANT_Game.w+2*ANT_Game.x0) +" height=" + (ANT_Game.h + 2*ANT_Game.y0) + "></canvas>"));
		this.c = $("#myCanvas")[0];
		$("#myCanvas").click(function(e) {
			
			//Location is set with e.offsetX and e.offsetY
			//Is this a click in the grid?
			if (e.offsetX > ANT_Game.x0 && e.offsetX < ANT_Game.x0+ANT_Game.w && e.offsetY > ANT_Game.y0 && e.offsetY < ANT_Game.y0+ANT_Game.h) {
				var a = new Ant(e.offsetX, e.offsetY);
				var type = $("#antType").val();
				var b = new AntBehaviour(a);
				switch (type) {
					case '0':
						b.apply = runAnt(10, Math.PI/2);
						break;
					case '1':
						b.apply = spinAnt(20, 30);
						break;
				}
				a.addBehaviour(b);
				ANT_Game.ants.push(a);
				
				var alive = $("#antAlive").val();
				if (alive == '0') a.die(); //"Kill" the ant
			}
		});
		this.ctx = this.c.getContext("2d");
		this.ctx.font = "12px Verdana";
		ANT_Game.getFrame();
		
	},
	
	//Builds a static path for the grid so redrawing is quick
	setupGrid :	function (x0, y0, w, h, cs) {
	var g = new Path2D();
	
		if (x0 > x1 || y0 > y1) throw("Invalid values");
		var x1 = x0+w;
		var y1 = y0 + h;
	
		var nx = w/cs;
		var ny = h/cs;
		
		for (i=0;i<=nx;i++) {
			g.moveTo(x0 + i*cs,y0);
			g.lineTo(x0+i*cs, y1);
		}

		for (i=0;i<=ny;i++) {
			g.moveTo(x0,y0+i*cs);
			g.lineTo(x1,y0+i*cs);
		}
		
		return g;
	},
	
	//Builds an animation frame as required
	getFrame : function() {
		var d = new Date();
		var m1 = d.getTime();
		
		//Clear the rectangle, and draw the base grid
		ANT_Game.ctx.fillStyle = "black";
		ANT_Game.ctx.fillRect(0,0,ANT_Game.w+2*ANT_Game.x0,ANT_Game.h+2*ANT_Game.y0);
		
		ANT_Game.ctx.fillStyle = '#CCCCCC';
		ANT_Game.ctx.fillRect(5,5,2*ANT_Game.x0+ANT_Game.w-10, 2*ANT_Game.y0 + ANT_Game.h-10);
		
		ANT_Game.ctx.fillStyle = 'black';
		ANT_Game.ctx.fillRect(ANT_Game.x0, ANT_Game.y0, ANT_Game.w, ANT_Game.h);

		ANT_Game.ctx.fillStyle = '#EEEEEE';
		ANT_Game.ctx.fillRect(ANT_Game.x0+2, ANT_Game.y0+2, ANT_Game.w-4, ANT_Game.h-4);
		
		ANT_Game.ctx.textAlign = "center";
		ANT_Game.ctx.textBaseline = "middle";

		//Only change things if the simulation is "running"
		if (ANT_Game.running) {
			
			//Move the ants
			for (var i=0;i<ANT_Game.ants.length;i++) {
				//if (ANT_Game.ants[i].state == ALIVE) {
					ANT_Game.ants[i].applyBehaviours(1/60);
					ANT_Game.ants[i].update(1/60);
				/*} else {
					//The ant is dead, what do we do?  We could have them vanish after a while...
				}*/
			}
			
		}
		
		//Draw the ants
		for (var i=0;i<ANT_Game.ants.length;i++) {
			ANT_Game.ants[i].draw(ANT_Game.ctx);
		}

	
		//Sort cells by x, then by y, then by age.  This will speed checking for neighbours later on
		ANT_Game.cells.sort(function(a,b) {
			if (a.x < b.x) return -1;
			if (a.x > b.x) return 1;
			if (a.y < b.y) return -1;
			if (a.y > b.y) return 1;
			if (a.age < b.age) return -1;
			return 1;
		});
		
		//Update the cycle time
		d = new Date();
		var m2 = d.getTime();
		
		ANT_Game.ctx.textAlign = "left";
		ANT_Game.ctx.textBaseline = "top";

		ANT_Game.ctx.strokeStyle = "black";
		ANT_Game.ctx.strokeText(ANT_Game.ants.length + " " + (m2-m1), 10,10);
		window.requestAnimationFrame(ANT_Game.getFrame);
	},
	
	//Keep cells inside the box
	limitCell: function(c) {
		if (c.x < 0) c.x = 0;
		if (c.y < 0) c.y = 0;
		if (c.x > ANT_Game.w/ANT_Game.cs-1) c.x = ANT_Game.w/ANT_Game.cs-1;
		if (c.y > ANT_Game.h/ANT_Game.cs-1) c.y = ANT_Game.h/ANT_Game.cs-1;
	}
}

$(document).ready(function() {ANT_Game.init();});

//And ant that goes in a straight line
function Ant(x,y) {
	this.id = ANT_Game.nextID();
	this.state = ALIVE;
	this.x=x;
	this.y=y;
	this.direction = 0;
	this.speed = 0;
	this.color = "black";
	this.opacity = 1.0;
	this.behaviours = [];
}

Ant.prototype.die = function() {
	this.state = DEAD;
	this.draw = drawDead;
	this.speed = 0; //Dead ants don't move
	var b = new AntBehaviour(this);
	b.apply = rotAnt();
	this.addBehaviour(b);
}

Ant.prototype.update = function(dt) {
	this.x += Math.cos(this.direction) * this.speed * dt;
	this.y += Math.sin(this.direction) * this.speed * dt;
	
	//Keep the direction between 0 and 2 PI, for simplicity.
	if (this.direction > Math.PI*2) this.direction -= Math.PI*2;
	if (this.direction < 0) this.direction += Math.PI*2;
}

//Draw the ant on the screen
Ant.prototype.draw = function(ctx) {
	ctx.beginPath();
	ctx.strokeStyle = this.color;
	ctx.globalAlpha = this.opacity;
	//ctx.moveTo(this.x, this.y);
	ctx.arc(this.x, this.y, 3, 0, 2*Math.PI);
	ctx.moveTo(this.x,this.y);
	ctx.lineTo(this.x-Math.cos(this.direction)*10, this.y-Math.sin(this.direction)*10 );
	ctx.stroke();
	ctx.globalAlpha = 1.0;
}

//Assign a behaviour to an ant
Ant.prototype.addBehaviour = function(b) {
	this.behaviours.push(b);
}

//Run all behaviours for an ant
Ant.prototype.applyBehaviours = function(dt) {
	var completeList = [];
	for (var i=0;i<this.behaviours.length;i++) {
		this.behaviours[i].apply(dt);
		if (this.behaviours[i].complete) completeList.push(i);
	}
	//Remove complete behaviours
	while (completeList.length>0) {this.behaviours.splice(completeList.pop(),1);}
}

//Object to store standard behaviours.
function AntBehaviour(ant) {
	this.complete = false;
	this.ant = ant;
	this.apply = function(dt) {}	
}

//Behaviour functions
//Goes in a circle, turning at rate degrees/second
function spinAnt(speed, rate) {
	var rate = rate;
	var speed = speed;
	return function(dt) {
		this.ant.direction += Math.PI*dt*rate/180;
		this.ant.speed = speed;
		this.complete = false;
		if (this.ant.x > ANT_Game.x0+ANT_Game.w || this.ant.x < ANT_Game.x0 || this.ant.y < ANT_Game.y0 || this.ant.y > ANT_Game.y0+ANT_Game.h) {
			this.complete = true;
			this.ant.die();	
		}
	}
}

//Ant runs off in a straight line and dies when it hits the edge
function runAnt(speed, direction) {
	var speed = speed;
	var direction = direction;
	return function(dt) {
		this.ant.direction = direction;
		this.ant.speed = speed;
		if (this.ant.x > ANT_Game.x0+ANT_Game.w || this.ant.x < ANT_Game.x0 || this.ant.y < ANT_Game.y0 || this.ant.y > ANT_Game.y0+ANT_Game.h) {
			this.complete = true;
			this.ant.die(); 
		}
	}
}

//Ant bounces around the screen
function bounceAnt(speed, direction) {
	var speed = speed;
	var direction = direction;
	return function(dt) {
		this.ant.direction = direction;
		this.ant.speed = speed;
		if (this.ant.x > ANT_Game.x0+ANT_Game.w || this.ant.x < ANT_Game.x0 || this.ant.y < ANT_Game.y0 || this.ant.y > ANT_Game.y0+ANT_Game.h) {
			//Bounce
			if (this.ant.x < ANT_Game.x0) { //Left edge
				
			} else if (this.ant.y < ANT_Game.y0) { //Top edge
				
			} else if (this.ant.x > ANT_Game.x0+ANT_Game.h) {//Right edge
			
			} else { //Bottom
				
			}
		}
	}
}

function rotAnt() {
	var timeLeft = 2; //Rot away 2 seconds after the behaviour was added
	
	return function(dt) {
		if (timeLeft-dt > 0) {
			timeLeft -= dt;
			//The ant is drawn progressively lighter.
			this.ant.opacity = timeLeft/2.0;
		} else {
			//This ant has rotted away, time to remove me from the game...
			this.ant.opacity = 0;
			this.complete = true;
		}
	}
}

//Draw a dead ant
function drawDead(ctx) {
	ctx.beginPath();
	ctx.globalAlpha = this.opacity;
	ctx.strokeStyle = this.color;
	//ctx.moveTo(this.x, this.y);
	ctx.arc(this.x, this.y, 3, 0, 2*Math.PI);

	ctx.moveTo(this.x-3, this.y-3);
	ctx.lineTo(this.x+3, this.y+3);
	ctx.moveTo(this.x+3, this.y-3);
	ctx.lineTo(this.x-3, this.y+3);

	ctx.stroke();
	ctx.globalAlpha = 1;
}	

/*

DizzyAnt.prototype.update = function(dt) {
	this.direction += Math.PI*dt;
	this.x += Math.cos(this.direction) * this.speed * dt;
	this.y += Math.sin(this.direction) * this.speed * dt;
}


function zigzag() {
	Ant.apply(this, arguments);
	this.direction += Math.PI*45/180;
	this.color = 'blue';
	this.counter = 0;
}

ZiggyAnt.prototype.update = function(dt) {
	if (this.counter++ == 60) {
		this.direction -= Math.PI * 90 / 180;
	} else if (this.counter == 120) {
		this.counter = 0;
		this.direction += Math.PI * 90 / 180;
	}
	this.x += Math.cos(this.direction) * this.speed * dt;
	this.y += Math.sin(this.direction) * this.speed * dt;
}
*/