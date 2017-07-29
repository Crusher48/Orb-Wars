var mainmenu = document.getElementById("menu");
var tutorial = document.getElementById("tutorial");
//open and close tutorial screen
var openTutorial = function ()
{
    mainmenu.style.visibility = "hidden";
    tutorial.style.visibility = "visible";
}
var closeTutorial = function ()
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
var teams = ["gray", "blue", "red"];
var entities = [];
var GM;// = new GameManager():
var UIInput;// = new UserInputManager();
//begin game/test environment
var beginGame = function ()
{
    mainmenu.style.visibility = "hidden";
    entities.push(new Orb(100, 100, 1));
    entities.push(new Orb(100, 200, 1));
    entities.push(new Orb(100, 300, 1));
    entities.push(new Orb(100, 400, 1));
    entities.push(new Orb(100, 500, 1));
    entities.push(new Orb(700, 100, 2));
    entities.push(new Orb(700, 200, 2));    
    entities.push(new Orb(700, 300, 2));
    entities.push(new Orb(700, 400, 2));
    entities.push(new Orb(700, 500, 2));
    //begin game loop
    UIInput = new UserInputManager();
    GM = new GameManager();
    //setInterval(gameTick,10);
}

//game logic handler
function GameManager()
{
    this.activeTeam = 1;
    this.duringTurn = false;
    setInterval(function(_this){_this.gameTick();_this.drawTick();},10,this);
}
//runs calculation ticks
GameManager.prototype.gameTick = function ()
{
    if (!this.duringTurn) return;
    //move entities, check to determine if turn is over
    let isTurnOver = true;
    for (let n in entities)
    {
        let orb = entities[n];
        orb.move();
        //friction
        orb.motion.vel = Math.max(orb.motion.vel - 0.01, 0);
        if (orb.motion.vel != 0) isTurnOver = false;
    }
    if (isTurnOver)
        this.endTurn();
    //handle collisions
    for (let n = 0; n < entities.length; n++)
    {
        let orb = entities[n];
        //bounce off walls
        if (orb.pos.x - orb.size < 0 || orb.pos.x + orb.size > mapWidth)
        {
            orb.motion.dir = Math.PI - orb.motion.dir;
        }
        if (orb.pos.y - orb.size < 0 || orb.pos.y + orb.size > mapHeight)
        {
            orb.motion.dir = 2 * Math.PI - orb.motion.dir;
        }
        //check for collisions with another orb
        for (let m = n + 1; m < entities.length; m++)
        {
            let orb2 = entities[m];
            let distance = Math.sqrt(Math.pow(orb.pos.x - orb2.pos.x, 2) + Math.pow(orb.pos.y - orb2.pos.y, 2));
            if (distance < orb.size + orb2.size) //if true, collision is detected
            {
                let collisionAngle = Math.atan2(orb2.pos.y - orb.pos.y, orb2.pos.x - orb.pos.x);
                //console.log("collision angle: " + (collisionAngle*180/Math.PI));
                let orb1par = orb.motion.vel * Math.cos(orb.motion.dir - collisionAngle);
                let orb1perp = orb.motion.vel * Math.sin(orb.motion.dir - collisionAngle);
                let orb2par = orb2.motion.vel * Math.cos(orb2.motion.dir - collisionAngle);
                let orb2perp = orb2.motion.vel * Math.sin(orb2.motion.dir - collisionAngle);
                //console.log("orb1par: " + orb1par + "\norb1perp: " + orb1perp + "\norb2par: " + orb2par + "\norb2perp: " + orb2perp);
                let newVel1par = orb2par;
                let newVel1perp = orb1perp;
                let newVel2par = orb1par;
                let newVel2perp = orb2perp;
                //console.log("newVel1per: " + newVel1par + "\nnewVel1par: " + newVel1perp + "\nnewVel2per: " + newVel2par + "\nnewVel2par: " + newVel2perp);
                orb.setVelocity(collisionAngle + Math.atan2(newVel1perp, newVel1par), Math.sqrt(newVel1par * newVel1par + newVel1perp * newVel1perp));
                orb2.setVelocity(collisionAngle + Math.atan2(newVel2perp, newVel2par), Math.sqrt(newVel2par * newVel2par + newVel2perp * newVel2perp));
                //console.log("orb1velocity: " + (orb.motion.dir*180/Math.PI) + " " + orb.motion.vel + "\norb2velocity: " + (orb2.motion.dir*180/Math.PI) + " " + orb2.motion.vel);
                orb.move();
                orb2.move();
                //handle damage/recovery mechanics
                if (orb.team == this.activeTeam && !orb.damaged)
                {
                    if (orb2.team == orb.team)
                        orb2.damaged = false;
                    else 
                    {
                        if (orb2.damaged)
                            orb2.team = 0;//entities.splice(m,1);
                        else
                            orb2.damaged = true;
                    }
                }
                if (orb2.team == this.activeTeam && !orb2.damaged)
                {
                    if (orb.team == orb2.team)
                        orb.damaged = false;
                    else 
                    {
                        if (orb.damaged)
                            orb.team = 0;//entities.splice(n,1);
                        else
                            orb.damaged = true;
                    }
                }
            }
        }
    }
}
//draw objects
GameManager.prototype.drawTick = function()
{
    draw.clearRect(0, 0, canvas.width, canvas.height);
    for (let n in entities)
    {
        entities[n].drawObject();
    }
}
GameManager.prototype.endTurn = function() 
{
    //check for win conditions
    
    //change teams
    this.activeTeam++;
    if (this.activeTeam >= teams.length)
        this.activeTeam = 1;
    console.log("new active team: " + teams[this.activeTeam]);
    this.duringTurn = false;
}
//used by user input to initiate a move for the turn
GameManager.prototype.sendOrder = function(orb,direction,velocity) 
{
    if (orb.team != this.activeTeam || this.duringTurn) return;
    orb.setVelocity(direction,velocity);
    this.duringTurn = true;
}

//main entity code
function Orb(x, y, team)
{
    this.pos = { x: x, y: y };
    this.motion = { dir: 0, vel: 0 };
    this.team = team;
    //constants & starting values
    this.size = 24;
    this.mass = 10;
    this.damaged = false;
    this.selected = false;
}
Orb.prototype.drawObject = function ()
{
    if (!this.damaged)
    {
        draw.fillStyle = teams[this.team];
        draw.beginPath();
        draw.arc(this.pos.x, this.pos.y, this.size, 0, 2 * Math.PI);
        draw.fill();
    }
    else 
    {
        draw.fillStyle = teams[0];
        draw.strokeStyle = teams[this.team];
        draw.beginPath();
        draw.arc(this.pos.x, this.pos.y, this.size, 0, 2 * Math.PI);
        draw.fill();
        draw.stroke();
    }
    if (this.selected)
    {
        draw.strokeStyle = "black";
        draw.beginPath();
        draw.arc(this.pos.x, this.pos.y, this.size * 1.5, 0, 2 * Math.PI);
        draw.stroke();
    }
}
//move an orb based on its velocity
Orb.prototype.move = function ()
{
    this.pos.x += this.getDeltaX();
    this.pos.y += this.getDeltaY();
}
//set an orb's velocity
Orb.prototype.setVelocity = function (direction, velocity)
{
    this.motion.dir = direction;
    this.motion.vel = velocity;
}
//get x or y aspects of velocity
Orb.prototype.getDeltaX = function ()
{ return this.motion.vel * Math.cos(this.motion.dir); }
Orb.prototype.getDeltaY = function ()
{ return this.motion.vel * Math.sin(this.motion.dir); }

//handles user input
function UserInputManager()
{
    this.selectedOrb = null;
    let self = this;
    canvas.onmousedown = function (e) { self.getMouseDown(e); };
}
UserInputManager.prototype.getMouseDown = function (e)
{
    e.preventDefault();
    let mouseX = e.clientX - canvas.offsetLeft + canvas.width / 2;
    let mouseY = e.clientY - canvas.offsetTop + canvas.height / 2;
    //if orb is selected, launch it towards the cursor
    if (this.selectedOrb != null)
    {
        let orb = entities[this.selectedOrb];
        let distance = Math.sqrt(Math.pow(orb.pos.x - mouseX, 2) + Math.pow(orb.pos.y - mouseY, 2));
        if (distance > orb.size)
            GM.sendOrder(orb,Math.atan2(mouseY - orb.pos.y, mouseX - orb.pos.x), 5);
        orb.selected = false;
        this.selectedOrb = null;
    }
    else
    {
        //check for a user selection of an orb
        for (let n = 0; n < entities.length; n++)
        {
            let orb = entities[n];
            let distance = Math.sqrt(Math.pow(orb.pos.x - mouseX, 2) + Math.pow(orb.pos.y - mouseY, 2));
            if (distance < orb.size && orb.team == GM.activeTeam && !orb.damaged)
            {
                orb.selected = true;
                this.selectedOrb = n;
                return;
            }
        }
    }
}