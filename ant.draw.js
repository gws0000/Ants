//Draw a living ant
function drawAlive(ctx) {
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
