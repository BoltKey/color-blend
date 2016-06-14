var base;
var sum;
var added;
var picker;
var picked;
var mistake = 0;
var round = 0;
var maxround = 10;
var divMove = 100;
var minDiff = 200;
var locked = true;
var end = false;
var ranks = ["A+", "A", "B+", "B", "C+", "C", "D+", "D", "F"];
var rankStart = 400;
var rankDiff = 270;
var kongregate;
function main() {
	// kong
	if (kongregateAPI) {
		kongregateAPI.loadAPI(onComplete);
		function onComplete(){
			kongregate = kongregateAPI.getAPI();
		}
	}
	
	// layout
	picker = $("<input class='pick jscolor {onFineChange:\"update(this)\"} color' style='text-align:center; font-size:20px'>");
	$("body").append($(  	"<div id='allWrap'>" + 
								"<div id='base' class='wrap'>" + 
									"<div class='color'>" + 
										"<div style='display: table-cell; vertical-align: middle;'>&nbsp</div>" + 
									"</div>" + 
									"<div id='correct'>Correct solution</div>" + 
									"<div id='your'>Your solution</div>" + 
								"</div>" +
								"<div id='plus'>+</div>" +
								"<div id='add' class='wrap'>" +
									// picker will be appended here
									"<div class='newColor'><div style='display: table-cell; vertical-align: middle;'>&nbsp</div></div>" +
								"</div>" +
								"<div id='equals'>=</div>" +
								"<div id='sum' class='wrap'>" +
									"<div class='color'><div style='display: table-cell; vertical-align: middle;'>&nbsp</div></div>" + 
									"<div class='newColor'><div style='display: table-cell; vertical-align: middle;'>&nbsp</div></div>" +
								"</div>" +
								
							"</div>" +
							"<div id='score'>Total mistake: <span id='mistake'>0</span></div>" +
							"<div id='progress'>Round: <span id='round'>1</span>/" + maxround + "</div>" +
							"<div id='winScreen' onclick='newGame()'>You finished with total mistake of <span id='finalMistake'>0</span><br><br>Your rank is <span id='rank'></span> <br><br> Click to try again</div>" +
							"<div id='tutorial'>Click on the middle square to select color that produces as similar result as possible</div>"
						))
	$("#add .newColor").css("transform", "translate3d(0px, -" + divMove + "px, 0px)").before(picker);
	$("#add").append($("<button onclick='lockIn()'>Confirm</button><br><button id='restart' onclick='newRound()'>Next round</button><div id='currScore'>You were off by <span id='currMistake'>0</span></div>"));
	$("#sum .newColor").css("transform", "translate3d(0px, " + divMove + "px, 0px)");
	newRound();
}

function resetLayout() {
	$(".newColor").css("opacity", "0");
	$(".color").css("transform", "translate3d(0px, 0px, 0px)");
	$(".color > ").html("&nbsp");
	$(".newColor > ").html("&nbsp");
	$("#your, #correct, #currScore").css("opacity", "0");
}

function update(p) {
	picked = p.rgb;
	for (var i = 0; i < 3; ++i) {
		picked[i] = Math.round(picked[i]);
	}
	$(".pick").html(p.rgb.join("<br>"));
	$("#tutorial").css("opacity", "0");
}

function newGame() {
	round = 0;
	end = false;
	locked = true;
	mistake = 0;
	resetLayout();
	newRound();
	$("#winScreen").css("opacity", "0").css("visibility", "hidden");
	$("#allWrap").css("opacity", "1");
	$("#mistake").html(mistake);
}

function newRound() {
	if (locked) {
		resetLayout();
		++round;
		$("#round").html(round);
		do {
			base = [rand(255), rand(255), rand(255)];
			added = [rand(255), rand(255), rand(255)];
		} while (Math.abs(base.reduce(function(a, b){return a+b}) - added.reduce(function(a, b){return a+b})) < minDiff);
		sum = [];
		for (var i = 0; i < 3; ++i) {
			sum[i] = Math.floor((base[i] + added[i]) / 2);
		}
		
		$("#base .color").css("backgroundColor", "rgb(" + base.join(", ") + ")");
		//$("#add .color").css("backgroundColor", "rgb(" + added.join(", ") + ")");
		$("#sum .color").css("backgroundColor", "rgb(" + sum.join(", ") + ")");
		$("#restart").css("opacity", "0").css("visibility", "hidden");;
		locked = false;
	}
}

function arToHex(a) {
	var h = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, "A", "B", "C", "D", "E", "F"]
	var r = "";
	for (var i = 0; i < 3; ++i) {
		r += h[Math.floor(a[i] / 16)] + "" + h[a[i] % 16]; 
	}
	return r;
}

function rand(a) {
	return Math.floor(Math.random() * (a + 1));
}

function lockIn() {
	if (!locked) {
		var m = 0;
		for (var i = 0; i < 3; ++i) {
			m += Math.round(Math.abs(picked[i] - added[i]));
		}
		mistake += m;
		if (kongregate)
			kongregate.stats.submit("singleMistake", m);
		$("#mistake").html(mistake);
		$("#sum .color").css("transform", "translate3d(0px, -" + divMove + "px, 0px)");
		$("#add .color").css("transform", "translate3d(0px, " + divMove + "px, 0px)");
		var newSum = [];
		for (var i = 0; i < 3; ++i) {
			newSum[i] = Math.min(255, Math.floor((base[i] + picked[i]) / 2));
		}
		$("#sum .newColor").css("background-color", "rgb(" + newSum.join(", ") + ")").css("opacity", "1");
		$("#sum .newColor > ").html(arToHex(newSum));
		$("#sum .color > ").html(arToHex(sum));
		$("#base .color > ").html(arToHex(base));
		$("#add .newColor > ").html(arToHex(added));
		$("#currMistake").html(m);
		$("#add .newColor").css("background-color", "rgb(" + added.join(", ") + ")").css("opacity", "1");
		$("#your, #correct, #currScore").css("opacity", "1");
		locked = true;
		if (round === maxround) {
			end = true;
			$("#finalMistake").html(mistake);
			$("#rank").html(ranks[Math.max(0, Math.min(ranks.length - 1, Math.floor((mistake - rankStart) / rankDiff)))]);
			$("#winScreen").css("opacity", "1").css("visibility", "visible");
			$("#allWrap").css("opacity", "0.2");
			if (kongregate)
				kongregate.stats.submit("totalMistake", mistake);
		}
		else {
			$("#restart").css("opacity", "1").css("visibility", "visible");
		}
	}
}

$(document).ready(main);