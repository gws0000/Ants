//Changed in VM
const DEAD = 0;
const ALIVE = 1;

//Initialize the game when ready
$(document).ready(function() {ANT_Game.init();});

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


