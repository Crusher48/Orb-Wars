var mainmenu = document.getElementById("menu");
var tutorial = document.getElementById("tutorial");
//open and close tutorial screen
var openTutorial = function() 
{
    mainmenu.style.visibility = "hidden";
    tutorial.style.visibility = "visible";
}
var closeTutorial = function() 
{
    tutorial.style.visibility = "hidden";
    mainmenu.style.visibility = "visible";
}
{//CONSTANTS
    var mapWidth = 800
    var mapHeight = 600;
}
var canvas = document.getElementById("viewport");
var draw = canvas.getContext("2d");
var colors = ["blue","red"];
var entities = [];
//begin game/test environment
var beginGame = function() 
{
    mainmenu.style.visibility = "hidden";
    //test case 1 (expected result: balls bounce in straight lines)
    /*
    entities.push(new Orb(100,100,1));
    entities.push(new Orb(500,100,2));
    entities[0].setVelocity(0,5);
    */
    //test case 2 (expected result: balls bounce on an angle)
    /*
    entities.push(new Orb(100,100,1));
    entities.push(new Orb(250,250,2));
    entities[0].setVelocity(Math.PI/4,5);
    */
    //test case 3 (expected result: ball 1 bounces upward, ball 2 bounces downward)
    entities.push(new Orb(100,100,1));
    entities.push(new Orb(250,120,2));
    //entities[0].setVelocity(0,5);
    //begin game loop
    canvas.onmousedown = function(e) {mouseEventHandler(e);};
    setInterval(gameTick,10);
}
//runs calculation ticks
var gameTick = function() 
{
    //move entities
    for (let n in entities) 
    {
        let orb = entities[n];
        orb.move();
        //friction
        orb.motion.vel = Math.max(orb.motion.vel-0.01,0);
    }
    //handle collisions
    for (let n = 0; n < entities.length; n++) 
    {
        let orb = entities[n];
        //bounce off walls
        if (orb.pos.x-orb.size < 0 || orb.pos.x+orb.size > mapWidth) 
        {
            orb.motion.dir = Math.PI-orb.motion.dir;
        }
        if (orb.pos.y-orb.size < 0 || orb.pos.y+orb.size > mapHeight)
        {
            orb.motion.dir = 2*Math.PI-orb.motion.dir;
        }
        //check for collisions with another orb
        for (let m = n+1; m < entities.length; m++) 
        {
            let orb2 = entities[m];
            let distance = Math.sqrt(Math.pow(orb.pos.x-orb2.pos.x,2) + Math.pow(orb.pos.y-orb2.pos.y,2));
            if (distance < orb.size + orb2.size)
            {
                let collisionAngle = Math.atan2(orb2.pos.y-orb.pos.y,orb2.pos.x-orb.pos.x);
                //console.log("collision angle: " + (collisionAngle*180/Math.PI));
                let orb1par = orb.motion.vel*Math.cos(orb.motion.dir-collisionAngle);
                let orb1perp = orb.motion.vel*Math.sin(orb.motion.dir-collisionAngle);
                let orb2par = orb2.motion.vel*Math.cos(orb2.motion.dir-collisionAngle);
                let orb2perp = orb2.motion.vel*Math.sin(orb2.motion.dir-collisionAngle);
                //console.log("orb1par: " + orb1par + "\norb1perp: " + orb1perp + "\norb2par: " + orb2par + "\norb2perp: " + orb2perp);
                let newVel1par = orb2par;
                let newVel1perp =  orb1perp;
                let newVel2par = orb1par;
                let newVel2perp = orb2perp;
                //console.log("newVel1per: " + newVel1par + "\nnewVel1par: " + newVel1perp + "\nnewVel2per: " + newVel2par + "\nnewVel2par: " + newVel2perp);
                orb.setVelocity(collisionAngle+Math.atan2(newVel1perp,newVel1par),Math.sqrt(newVel1par*newVel1par+newVel1perp*newVel1perp));
                orb2.setVelocity(collisionAngle+Math.atan2(newVel2perp,newVel2par),Math.sqrt(newVel2par*newVel2par+newVel2perp*newVel2perp));
                //console.log("orb1velocity: " + (orb.motion.dir*180/Math.PI) + " " + orb.motion.vel + "\norb2velocity: " + (orb2.motion.dir*180/Math.PI) + " " + orb2.motion.vel);
                orb.move();
                orb2.move();
            }
        }
    }
    //draw objects
    draw.clearRect(0,0,canvas.width,canvas.height);
    for (let n in entities) 
    {
        let orb = entities[n];
        draw.fillStyle = colors[orb.team-1];
        draw.beginPath();
        draw.arc(orb.pos.x,orb.pos.y,orb.size,0,2*Math.PI);
        draw.fill();
        if (orb.selected) 
        {
            console.log("orb is selected");
            draw.strokeStyle = "black";
            draw.beginPath();
            draw.arc(orb.pos.x,orb.pos.y,orb.size*1.5,0,2*Math.PI);
            draw.stroke();
        }
    }
}
function Orb(x,y,team) 
{
    this.pos = {x:x,y:y};
    this.motion = {dir:0,vel:0};
    this.team = team;
    //constants & starting values
    this.size = 24;
    this.mass = 10;
    this.damaged = false;
    this.selected = false;
}
//move an orb based on its velocity
Orb.prototype.move = function() 
{
    this.pos.x += this.getDeltaX();
    this.pos.y += this.getDeltaY();
}
//set an orb's velocity
Orb.prototype.setVelocity = function(direction,velocity) 
{
    this.motion.dir = direction;
    this.motion.vel = velocity;
}
//get x or y aspects of velocity
Orb.prototype.getDeltaX = function() 
{return this.motion.vel*Math.cos(this.motion.dir);}
Orb.prototype.getDeltaY = function()
{return this.motion.vel*Math.sin(this.motion.dir);}

//handles user input
var mouseEventHandler = function(e) 
{
    e.preventDefault();
    let mouseX = e.clientX-canvas.offsetLeft+canvas.width/2;
    let mouseY = e.clientY-canvas.offsetTop+canvas.height/2;
    //check for a user selection of an orb
    for (let n = 0; n < entities.length; n++) 
    {
        let orb = entities[n];
        let distance = Math.sqrt(Math.pow(orb.pos.x-mouseX,2) + Math.pow(orb.pos.y-mouseY,2));
        if (distance < orb.size) 
        {
            orb.selected = true;
        }
        else 
        {
            orb.selected = false;
        }
    }
}