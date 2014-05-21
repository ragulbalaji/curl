var WIDTH = window.innerWidth,HEIGHT = window.innerHeight, delta;
var lastFrame,delta,time,fps = 0,tempfps,lastFPS = getTime();
var btnPressSnd = new Audio("http://ragulbalaji.github.io/curl/audio/BtnPress.mp3");
var ballHitWallSnd = new Audio("http://ragulbalaji.github.io/curl/audio/BallHitWall.mp3");
var ballHitBatSnd = new Audio("http://ragulbalaji.github.io/curl/audio/BallHitBat.mp3");
var PointScoredSnd = new Audio("http://ragulbalaji.github.io/curl/audio/PointScored.mp3");
var leftBatElement = document.getElementById("leftBat"),rightBatElement = document.getElementById("rightBat"),BallElement = document.getElementById("Ball");
var mainMenu = document.getElementById("mainMenu"), gameState = document.getElementById("gameState");
var leftScoreEle = document.getElementById("leftScore"), rightScoreEle = document.getElementById("rightScore");
var gameLoopVar, gameRunning;
var Ball , leftBat, rightBat;
var leftScore, rightScore;
var ballBounceEfficiency = 0.999, batMoveVelocity = 0.4, batBallFrictionCoeff = 0.5;
var CurrentState = 0, State = {MainMenu:1, Game:2};
var XMin = 0, XMax = WIDTH, YMin = 0.17*HEIGHT, YMax = 0.95*HEIGHT;
var keys = new Array(255),oldKeys = new Array(255);

function gotoState(id){
   if(id == State.MainMenu){
      mainMenu.style.display="block";
      gameState.style.display="none";
   }else if(id == State.Game){
      mainMenu.style.display="none";
      gameState.style.display="block";
   }
}

function setObjToEle(obj, ele){
   ele.style.left = obj.x;
   ele.style.top = obj.y;
}

function startGame(){
   gotoState(State.Game);
   WIDTH = window.innerWidth;
   HEIGHT = window.innerHeight;
   gameRunning = true;
   leftScore = 0;
   rightScore = 0;
   getDelta();
   Ball = new gameObj(WIDTH/2-HEIGHT/100,11*HEIGHT/20,0,0);
   leftBat = new gameObj((HEIGHT*5)/100,HEIGHT*23/50,0,0);
   rightBat = new gameObj(WIDTH - 2*((HEIGHT*5)/100),HEIGHT*23/50,0,0);
   //init
   if(randInt(1,2)==1){
      resetBall(1);
   }else{
      resetBall(-1);
   }
   setObjToEle(Ball, BallElement);
   setObjToEle(leftBat, leftBatElement);
   setObjToEle(rightBat, rightBatElement);
   //
   gameLoopVar = setInterval(gameLoop,0);
}
function input(){
   leftBat.vy = 0;
   if(keys[87] || keys[38]){
      leftBat.vy = -batMoveVelocity;
   }else if(keys[83] || keys[40]){
      leftBat.vy = batMoveVelocity;
   }else if(keys[27]){ //Esc
      gameLoopVar = clearInterval(gameLoopVar);
   }else if(keys[80] && !oldKeys[80]){ //Pause-P
      if(gameRunning){
         gameRunning = false;
         gameLoopVar = clearInterval(gameLoopVar);
      }else{
         gameRunning = true;
         getDelta();
         gameLoopVar = setInterval(gameLoop,0);
      }
   }
}
function touch(x, y, action) {
   leftBat.vy = 0;
   if(x <= WIDTH/2 && action){
      if(y < leftBat.y+(HEIGHT*9/100)){
         leftBat.vy = -batMoveVelocity;
      }else if(y > leftBat.y+(HEIGHT*9/100)){
         leftBat.vy = batMoveVelocity;
      }
   }
}
function gameLoop(){
   getDelta();
   //updates
   if(Ball.x <= XMin){ // LEFTHIT
      PointScoredSnd.play();
      resetBall(1);
      rightScore++;
   }else if(Ball.x >= XMax){ //RIGHTHIT
      PointScoredSnd.play();
      resetBall(-1);
      leftScore++;
   }
   if(Ball.y >= YMax ||  Ball.y <= YMin){
      ballHitWallSnd.play();
      Ball.vy = -ballBounceEfficiency *Ball.vy;
      Ball.vx = ballBounceEfficiency *Ball.vx;
      if(Ball.y >= YMax){
         Ball.y = YMax;
      }else{
         Ball.y = YMin;
      }
   }
   if(Ball.y > rightBat.y+(HEIGHT*9/100)){
      rightBat.vy = batMoveVelocity;
   }else if(Ball.y < rightBat.y+(HEIGHT*9/100)){
      rightBat.vy = -batMoveVelocity;
   }else{
      rightBat.vy = 0;
   }
   if(Ball.x+(HEIGHT*2/100) >= rightBat.x && Ball.x+(HEIGHT*2/100) <= rightBat.x+(HEIGHT*5/100) && Ball.y+(HEIGHT*1/100) >= rightBat.y && Ball.y+(HEIGHT*1/100) <= rightBat.y+(HEIGHT*20/100)){
      ballHitBatSnd.play();
      Ball.x=rightBat.x-2*HEIGHT/100;
      Ball.vx=-ballBounceEfficiency *Ball.vx;
      Ball.vx += batBallFrictionCoeff*0.1*rightBat.vy;
      Ball.vy += batBallFrictionCoeff*rightBat.vy;
   }else if(Ball.x <= leftBat.x+(HEIGHT*5/100) && Ball.x >= leftBat.x && Ball.y+(HEIGHT*1/100) >= leftBat.y && Ball.y+(HEIGHT*1/100) <= leftBat.y+(HEIGHT*20/100)){
      ballHitBatSnd.play();
      Ball.x=leftBat.x+7*HEIGHT/100;
      Ball.vx=-ballBounceEfficiency *Ball.vx;
      Ball.vx += batBallFrictionCoeff*0.1*leftBat.vy;
      Ball.vy += batBallFrictionCoeff*leftBat.vy;
   }
   if(rightBat.y >= YMax-(HEIGHT*19/100)){
      rightBat.y = YMax-(HEIGHT*19/100);
   }else if(rightBat.y <= YMin+(HEIGHT/100)){
      rightBat.y = YMin+(HEIGHT/100);
   }
   if(leftBat.y >= YMax-(HEIGHT*19/100)){
      leftBat.y = YMax-(HEIGHT*19/100);
   }else if(leftBat.y <= YMin+(HEIGHT/100)){
      leftBat.y = YMin+(HEIGHT/100);
   }
   leftBat.x += leftBat.vx*delta;
   leftBat.y += leftBat.vy*delta;
   rightBat.x += rightBat.vx*delta;
   rightBat.y += rightBat.vy*delta;
   Ball.x += Ball.vx*delta;
   Ball.y += Ball.vy*delta;
   //
   gameRender();
   updateFPS();
}
function gameRender(){
   setObjToEle(Ball, BallElement);
   setObjToEle(leftBat, leftBatElement);
   setObjToEle(rightBat, rightBatElement);
   leftScoreEle.innerHTML = leftScore;
   rightScoreEle.innerHTML = rightScore;
}
function gameObj(px,py, pvx, pvy){
   this.x = px;
   this.y = py;
   this.vx = pvx;
   this.vy = pvy;
}
function resetBall(direction){
   Ball.x = WIDTH/2-HEIGHT/100;
   Ball.y = 11*HEIGHT/20;
   Ball.vx = (randInt(3,8)/(10*direction));
   Ball.vy = Math.random()-0.5;
}
function getTime() {return Date.now();}
function updateFPS() {
   if (getTime() - lastFPS > 1000) {
      console.log(fps);// FPS OUTPUT
      fps = tempfps;
      tempfps = 0;
      lastFPS += 1000;
   }
   tempfps++;
}
function getDelta() {
   time = getTime();
   delta = (time - lastFrame);
   lastFrame = time;
}
function randInt(min, max) {
   return Math.floor(Math.random() * (max - min + 1)) + min;
}

window.onkeydown = function (e) {
   keys[e.keyCode] = true;
   oldKeys[e.keyCode] = false;
   input();
};
window.onkeyup = function (e) {
   keys[e.keyCode] = false;
   oldKeys[e.keyCode] = true;
   input();
};
window.addEventListener('touchstart', function(e) {
 touch(e.changedTouches[0].pageX, e.changedTouches[0].pageY, true);
}, false);
window.addEventListener('touchmove', function(e) {
   e.preventDefault();
   touch(e.targetTouches[0].pageX, e.targetTouches[0].pageY, true);
}, false);
//Math.seedrandom(2000);
gotoState(State.MainMenu);
//startGame();
