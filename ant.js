//Changed in master
const DEAD = 0;
const ALIVE = 1;

var ANT_Game = {
	running: false,
	c: null,
	ctx: null,
	gridPath: null,
	cs: 20,
	x0: 150,
	y0: 100,
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
  
	//Initializes the simulation
	//	1)  Calculates some grid size parameters
	//	2)  Creates a canvas/context for drawing
	//  3)  Starts the animation cycle running
	init: function() {
		$("BODY").append($("<canvas id='myCanvas' width=800 height=600></canvas>"));
		this.c = $("#myCanvas")[0];
		$("#myCanvas").click(function(e) {
			
			//Location is set with e.offsetX and e.offsetY
			//Is this a click in the grid?
			if (e.offsetX > ANT_Game.x0 && e.offsetX < ANT_Game.x0+ANT_Game.w && e.offsetY > ANT_Game.y0 && e.offsetY < ANT_Game.y0+ANT_Game.h) {
				var a = new Ant(e.offsetX, e.offsetY, 0, 0);
				var type = $("#antType").val();
				var b = new AntBehavior(a);
				switch (type) {
					case '0':
						b.apply = runAnt(10, Math.PI/2);
						break;
					case '1':
						b.apply = spinAnt(30);
						break;
				}
				a.addBehaviour(b);
				ANT_Game.ants.push(a);
			}
		});
		this.ctx = this.c.getContext("2d");
		this.ctx.font = "12px Verdana";
		this.ctx.fillStyle = "#CCCCCC";
		this.ctx.fillRect(0,0,this.c.width, this.c.height);
		
		//this.cells.push(new Cell(10,10));
		this.ctx.fillRect(0,0,800,600);
		this.gridPath = this.setupGrid(this.x0,this.y0,this.w, this.h, this.cs);
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
		ANT_Game.ctx.fillStyle = '#CCCCCC';
		ANT_Game.ctx.fillRect(0,0,800,600);
		//ANT_Game.ctx.stroke(ANT_Game.gridPath);
		ANT_Game.ctx.textAlign = "center";
		ANT_Game.ctx.textBaseline = "middle";

		//Only change things if the simulation is "running"
		if (ANT_Game.running) {
			
			//Move the ants
			for (var i=0;i<ANT_Game.ants.length;i++) {
				ANT_Game.ants[i].applyBehaviours(1/60);
				ANT_Game.ants[i].update(1/60);
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

function Cell(x,y) {
	this.x = x;
	this.y=y;
	this.state = ALIVE;
	this.age = 1;
}

//And ant that goes in a straight line
function Ant(x,y,direction, speed) {
	this.x=x;
	this.y=y;
	this.direction = direction;
	this.speed = speed;
	this.color = "black";
	this.behaviors = [];
}

Ant.prototype.update = function(dt) {
	this.x += Math.cos(this.direction) * this.speed * dt;
	this.y += Math.sin(this.direction) * this.speed * dt;
}

Ant.prototype.draw = function(ctx) {
	ctx.beginPath();
	ctx.strokeStyle = this.color;
	//ctx.moveTo(this.x, this.y);
	ctx.arc(this.x, this.y, 3, 0, 2*Math.PI);
	ctx.moveTo(this.x,this.y);
	ctx.lineTo(this.x-Math.cos(this.direction)*10, this.y-Math.sin(this.direction)*10 );
	ctx.stroke();
}

Ant.prototype.addBehaviour = function(b) {
	this.behaviors.push(b);
}

Ant.prototype.applyBehaviours = function(dt) {
	for (var i=0;i<this.behaviors.length;i++) {
		this.behaviors[i].apply(dt);
	}
}

function AntBehavior(ant) {
	this.complete = false;
	this.ant = ant;
	this.apply = function(dt) {}	
}

//Behaviour functions
//Goes in a circle, turning at rate degrees/second
function spinAnt(rate) {
	var rate = rate;
	return function(dt) {
		this.ant.direction += Math.PI*dt*rate/180;
		this.complete = false;
	}
}

//Ant runs off in a straight line
function runAnt(speed, direction) {
	var speed = speed;
	var direction = direction;
	return function(dt) {
		this.ant.direction = direction;
		this.ant.speed = speed;
	}
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