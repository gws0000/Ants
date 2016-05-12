//Object to store standard behaviours.
function AntBehaviour(ant) {
	this.complete = false;
	this.ant = ant;
	this.apply = function(dt) {}	
	this.next = [];
}

//Behaviour functions
//Goes in a circle, turning at rate degrees/second
function spinAnt(speed, rate) {
	var rate = rate;
	var speed = speed;
	return function(dt) {
		this.ant.setDirection(this.ant.direction + Math.PI*dt*rate/180);
		this.ant.speed = speed;
		this.complete = false;
	}
}

//Kill any ants that wander off the board edge.
function edgeKillAnt() {
	return function(dt) {
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
		this.ant.setDirection(direction);
		this.ant.speed = speed;
	}
}

//Ant bounces around the screen
function bounceAnt(speed, direction) {
	var speed = speed;
	var direction = direction;
	var setupComplete = false;
	return function(dt) {
		if (!setupComplete) {
			this.ant.setDirection(direction);
			this.ant.speed = speed;
			setupComplete = true;
		}
		if (this.ant.x > ANT_Game.x0+ANT_Game.w || this.ant.x < ANT_Game.x0 || this.ant.y < ANT_Game.y0 || this.ant.y > ANT_Game.y0+ANT_Game.h) {
			//Bounce
			if (this.ant.x < ANT_Game.x0 && this.ant.dx < 0) { //Left edge
				this.ant.dx = -1 * this.ant.dx;
			} else if (this.ant.y < ANT_Game.y0 && this.ant.dy < 0) { //Top edge
				this.ant.dy = -1 * this.ant.dy;
			} else if (this.ant.x > ANT_Game.x0+ANT_Game.h && this.ant.dx > 0) {//Right edge
				this.ant.dx = -1 * this.ant.dx;
			} else { //Bottom
				if (this.ant.dy > 0) this.ant.dy = -1 * this.ant.dy;
			}
		}
	}
}

function gotoAnt(speed, end_x, end_y) {
	var speed = speed;
	var x = end_x;
	var y = end_y;
	
	return function(dt) {
		//Are we there yet...
		var d = (x - this.ant.x)^2 + (y - this.ant.y)^2;
		var rd = sqrt(d);
		if (d < 1) {
			this.complete = true;
		} else {
			//Make sure we are on target
			this.ant.setDirectionXY((x-this.ant.x)/rd, (y-this.ant.y)/rd);
			
		}
	
	}
}

//How fast to move, and what general direction to go in
function forageAnt(speed, direction) {
	var speed = speed;
	var direction = direction;
	var setupComplete = false;
	var trail = []; //The "ant" will store where it has been and gradually move away from its starting position
	return function(dt) {
		if (!setupComplete) {
			this.ant.speed = speed;
			this.and.setDirection(direction);
			setupComplete = true;
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