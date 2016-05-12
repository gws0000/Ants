//Changed in VM
const DEAD = 0;
const ALIVE = 1;

var ANT_Game = {
	running: false,
	c: null,
	ctx: null,
	x0: 50,
	y0: 50,
	w: 600,
	h: 400,
	ants: [],
	lastID: 0,
	lastTime: 0,
	nextID: function() {
		return this.lastID++;
	},
  
	//Initializes the simulation
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
					case '2':
						b.apply = bounceAnt(20, Math.random()*2*Math.PI);
						break;
				}
				a.addBehaviour(b);
				ANT_Game.ants.push(a);
				
				var k = new AntBehaviour(a);
				k.apply = edgeKillAnt();
				a.addBehaviour(k);
				
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
				var dt = (m1-ANT_Game.lastTime)/1000;
				dt = 1/60; //Temporary, debugging makes cycles take a long time and breaks the game
				ANT_Game.ants[i].applyBehaviours(dt);
				ANT_Game.ants[i].update(dt);
			}
		}
		
		//Draw the ants
		for (var i=0;i<ANT_Game.ants.length;i++) {
			ANT_Game.ants[i].draw(ANT_Game.ctx);
		}
		
		//Update the cycle time
		d = new Date();
		var m2 = d.getTime();
		
		ANT_Game.ctx.textAlign = "left";
		ANT_Game.ctx.textBaseline = "top";

		ANT_Game.ctx.strokeStyle = "black";
		ANT_Game.ctx.strokeText(ANT_Game.ants.length + " " + (m2-m1), 10, 10);
		window.requestAnimationFrame(ANT_Game.getFrame);
		
		ANT_Game.lastTime = m1; //Store for the next cycle
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
	this.id = ANT_Game.nextID(); //This will be supplied by the server, eventually
	this.state = ALIVE;
	this.x=x;
	this.y=y;
	this.direction = 0;
	this.dx = 0;
	this.dy = 0;
	this.speed = 0;
	this.color = "black";
	this.opacity = 1.0;
	this.behaviours = [];
}

//Set direction, calculate unit vector coordinates
Ant.prototype.setDirection = function(d) {
	while (d<0) {d += 2*Math.PI}
	while (d>2*Math.PI) {d -= 2*Math.PI}
	
	this.direction = d;
	this.dx = Math.cos(d);
	this.dy = Math.sin(d);
}

//Set direction from vector coordinates
Ant.prototype.setDirectionXY = function(dx, dy) {
	this.dx = dx;
	this.dy = dy;
	
	if (dx != 0) {
		this.direction = Math.atan(dy/dx);
	} else {
		if (dy > 0) this.direction = Math.PI/2;
		if (dy < 0) this.direction = Math.PI/-2;
	}
}

//Kill the ant
Ant.prototype.die = function() {
	this.state = DEAD;
	this.draw = drawDead;
	this.speed = 0; //Dead ants don't move
	var b = new AntBehaviour(this);
	b.apply = rotAnt();
	this.addBehaviour(b);
}

//Update the ant
Ant.prototype.update = function(dt) {
	
	this.x += this.dx * this.speed * dt;
	this.y += this.dy * this.speed * dt;
	
	//Keep the direction between 0 and 2 PI, for simplicity.
	if (this.direction > Math.PI*2) this.direction -= Math.PI*2;
	if (this.direction < 0) this.direction += Math.PI*2;
}

//Draw the ant on the screen
Ant.prototype.draw = function(ctx) {
	ctx.beginPath();
	ctx.strokeStyle = this.color;
	ctx.globalAlpha = this.opacity;

	//Head
	ctx.arc(this.x, this.y, 3, 0, 2*Math.PI);
	
	//Trailing line, showing direction
	ctx.moveTo(this.x,this.y);
	ctx.lineTo(this.x-this.dx*10, this.y - this.dy*10 );
	
	/*
	Body segments, showing direction
	*/
	ctx.arc(this.x-6*this.dx, this.y-6*this.dy, 3, 0, 2*Math.PI);
	ctx.arc(this.x-12*this.dx, this.y-12*this.dy, 3, 0, 2*Math.PI);
	
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

