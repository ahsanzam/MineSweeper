var DIR = './assets/';
var height = 25, 
	width = 25, 
	num_cols=Math.floor(($(window).width()*.8)/width), 
	num_rows=Math.floor(($(window).height()*.7)/height),
	totalBmbs=Math.floor(.2 * num_rows * num_cols);
var sq_arr, 
	gameOver, 
	gameWon, 
	timeOutTime,
	nonBmbsFound,
	totalBmbs;
var backgroundColor = "lightblue", minesweeperColor = "#FDE74C";
var prize_audio=new Audio(DIR + 'prize.mp3'), 
	lose_audio=new Audio(DIR + 'lose.mp3'), 
	win_audio=new Audio(DIR + 'win.mp3');
class sq{
	constructor(i, j){ 
		this.el = $(`.minesweeper-row:nth-child(${i}) .minesweeper-col:nth-child(${j})`);
		this.borderingBmbs=0;	
		this.el.click(()=>{
			if(gameOver) return;
			this.reveal();
		});
	}
	setLeftSq(s) { 	this.leftSq = s;	}
	setRightSq(s){ 	this.rightSq = s;	}
	setUpSq(s)   { 	this.upSq = s; 		}
	setDownSq(s) {	this.downSq = s; 	}
	makeBmb(){ 
		this.type="bmb"; 
		if(this.leftSq)		this.leftSq.borderingBmbs++;
		if(this.rightSq)	this.rightSq.borderingBmbs++;
		if(this.upSq)		this.upSq.borderingBmbs++;
		if(this.downSq)		this.downSq.borderingBmbs++;
	}
	borderingSqClicked(){
		if(this.state!=="revealed" && this.type!=="bmb"){
			this.reveal();
			if(this.borderingBmbs===0){
				if(this.leftSq)		this.leftSq.borderingSqClicked();
				if(this.rightSq)	this.rightSq.borderingSqClicked();
				if(this.upSq)		this.upSq.borderingSqClicked();
				if(this.downSq)		this.downSq.borderingSqClicked();
			}
		}
	}
	reveal(){
		if(this.state==="revealed") return;
		if(this.el.children().length>0) return;
		this.state = "revealed";
		if(this.type==="bmb"){
			this.el.append($("<span class='fas fa-bomb' style='color:#FC9F5B'></span>"));
			if(!gameOver) runGameEnd(); 
		}
		else{
			if(this.borderingBmbs===0){
				if(this.leftSq)		this.leftSq.borderingSqClicked();
				if(this.rightSq)	this.rightSq.borderingSqClicked();
				if(this.upSq)		this.upSq.borderingSqClicked();
				if(this.downSq)		this.downSq.borderingSqClicked();
			}
			else
				this.el.append($(`<span>${this.borderingBmbs}</span>`));
		}
		this.el.css("background-color","#95AFBA");
		nonBmbsFound++;
		if(!gameOver && nonBmbsFound===(num_rows*num_cols-totalBmbs)){
			gameWon=true;
			runGameEnd();
		}
	}
}
function waitThen(f){
	setTimeout(f,timeOutTime);
}
function init(){
	//generate square HTML elements
	for(var i=0; i<num_rows; i++){
		var prototype_row = $("<div class='minesweeper-row'></div");
		for(var j=0; j<num_cols; j++){
			var prototype_col = $("<div class='minesweeper-col'></div");
			prototype_row.append(prototype_col);
		}
		$("#minesweeper_container").append(prototype_row);
	}
	$(".minesweeper-col").css({"height":height,"width":width});
	$(".minesweeper-row").css({"height":height,"width":width*num_cols});
	$("#minesweeper_container").css({"width":width*num_cols+2});
	$("#buttonsContainer").css({"width":width*num_cols+2});
	$("#infoButton").css({"right":Math.floor(($(window).width()-(width*num_cols+2))*.5)});
	//init sq class
	for(var i=0; i<num_rows; i++){
		sq_arr.push([]);
		for(var j=0; j<num_cols; j++)
			sq_arr[i].push(new sq(i+1,j+1));
	}
	// inform neighbors
	for(var i=0; i<num_rows; i++){
		for(var j=0; j<num_cols; j++){
			if(i > 0) 			sq_arr[i][j].setUpSq(sq_arr[i-1][j]);
			if(i < num_rows-1) 	sq_arr[i][j].setDownSq(sq_arr[i+1][j]);
			if(j > 0) 			sq_arr[i][j].setLeftSq(sq_arr[i][j-1]);
			if(j < num_cols-1) 	sq_arr[i][j].setRightSq(sq_arr[i][j+1]);
		}
	}
	for(var k=0; k<totalBmbs; k++){
		var i=Math.floor(Math.random()*num_rows), j=Math.floor(Math.random()*num_cols);
		while(sq_arr[i][j].type==='bmb'){
			i=Math.floor(Math.random()*num_rows); j=Math.floor(Math.random()*num_cols);
		}
		sq_arr[i][j].makeBmb();
	}
}
function restart(){
	$("#GameStartButton").attr("disabled",true);
	var highestTimeoutId = setTimeout(";");
	for (var i = 0 ; i < highestTimeoutId ; i++)
	    clearTimeout(i); 
	gameOver=false;
	gameWon=false;
	nonBmbsFound=0;
	$("#minesweeper_container").empty();
	sq_arr=[];
	init();
	$(".loading-cover").fadeOut();
	$("#GameStartButton").removeAttr("disabled");
	$("#giveUpButton").removeAttr("disabled");
}
document.onkeydown = function (e) {
	console.log("keydown",e)
}
function giveUp(fromGameEnd){
	gameOver=true;
	for(var k=0; k<num_rows; k++)
		for(var j=0; j<num_cols; j++)
			sq_arr[k][j].reveal();
	if(!fromGameEnd) runGameEnd();
};
function runGameEnd(){
	giveUp(true);
	var msg = "Looks like you failed...";
	if(gameWon){ 
		msg="Great job! You won!";
		$("#gameOver .imageHolder").css({"background-image":`url(${DIR + 'win.gif'})`});
		win_audio.play();
	}
	else{
		$("#gameOver .imageHolder").css({"background-image":`url(${DIR + 'lose.gif'})`});
		lose_audio.play();
	}
	$("#gameOver h3").text(msg);
	$("#gameOver").fadeIn();
	$("#giveUpButton").attr("disabled",true);
}
function closeGameOver(){ $("#gameOver").fadeOut(); }
function showInfo(){ $("#infoContainer").fadeIn(); }
function closeInfoContainer(){ $("#infoContainer").fadeOut(); }
restart();
$('[data-toggle="tooltip"]').tooltip({animation: true});
//these gifs are awesome! https://qotoqot.com/sad-animations/
