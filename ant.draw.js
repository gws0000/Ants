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