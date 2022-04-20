//And ant that goes in a straight line (Develop)
//Hotfix applied to master
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

//Draw the ant on the screen (defaults to the drawAlive function)
Ant.prototype.draw = drawAlive;


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
