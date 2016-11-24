$(function(){
	// Default object for each new game
	var currentGame = {};

	// Create global currentGame scope

	// Variable for storing finished games in for eventual leaderboard content
	var games = [];

	var catArray = []

	var thisRound = {}

	var newPlaythrough = function(){
		var Playthrough = {
			numPlayers: 0,
			turns: 1,
			round: 9,
			winners: [],
			categories: [],
			players: [],
		}

		currentGame = Object.create(Playthrough)
		
		getCategories()
	}

	// shows a screen
	var showScreen = function(elem){
		// shows the passed element
		$(elem).show()
	}

	// hides a screen
	var hideScreen = function(elem) {
		// hides the passed element
		$(elem).hide()
	}

	var buildCategoryArray = function(data){
		return data
	}

	var getData = function(url){
		$.ajax({
			url: url,
		})
		.done(function(result){
			catObj = result;
			catArray.push(result)
		})
	}

	var getCategory = function(data){

		// $.get('http://jservice.io/api/categories?count=6&offset=' + Math.floor(Math.random() * 10000)).success(buildCategories);
		$.each(data, function(i, v){
			var url = newUrl(v.id);
			getData(url);

		})
		currentGame.categories = catArray;
	}

	var newUrl = function(id) {
		if(id){
			return "http://jservice.io/api/category?id=" + id
		} else {
			return "http://jservice.io/api/categories?count=6&offset=" + Math.floor(Math.random() * 10000);
		}

	}

	var buildCategories = function(){
		var categoryList = currentGame.categories;
		$.each(categoryList, function(i, v){
			$('#a' + (i)).text(v.title)
		});
	}

	// Get's categories from the API
	var getCategories = function(){
		var url = '';
		url = newUrl();
		$.get(url).done(function(result){
			if(result.length < 6){
				$.each(result, function(index, value){
					if(value.clues_count < 5) {
						console.log('Not enough clues in category ' + index + ', rerunning.')
						getCategories();
					}
				})
				console.log('Not enough categories, rerunning.')
				getCategories();
			} else {
			// stores the API request in the categories property of the currentGame object
				getCategory(result)
			}
		});
	};

	var showPlayers = function() {
		// for each player in the game
		if(games.length == 0) {
			for(var i = 1; i <= currentGame.numPlayers; i++) {
				// Show the player field on player-names screen
				$('.p-info').append(
					'<fieldset class=" player' + i + '">' +
						'<label for="p' + i + '">Player ' + i + '</label>&nbsp;<input id="p' + i + '">' +
					'</fieldset>');
			}
		}
	}

	var buildError = function(errorMessage){
		// Clones the error element from the templates section
		var errorElem = $('.templates .error').clone();
		// modifies the text of the error element
		var question = errorElem.find('.error-text')
		question.text(errorMessage)
		// passes the error element back to be appended onto the player selection as a full error message
		return errorElem;
	}

	var clearErrors = function(screen) {
		$(screen +' .error').remove()
	}

	var validateInput = function(input){
		var currentInput = $(input).val()
		$(input).val('')
		var element = $(input).parent();
		// if not valid show error for correct type of problem
		if(currentInput == ''){
			// pass through the error message and build it, then append it to the player names
			$(element).append(buildError('Please enter a name'));
		} else if (currentInput.match(/[^A-Za-z0-9" "]/gi)) {
			$(element).append(buildError('Please enter only numbers, spaces and letters.'));
			// else if valid add data to the players array
		} else {
			// return a successful input back to the players array
			return currentInput;
		}
	}

	var buildScoreBoard = function(){
		// add a scoreboard for each player to the bottom of the scoreboard
		$.each(currentGame.players, function(i, v){
			$('.scoreboard-field').append(
				'<div class="scoreboard pl' + i + '">' +
					'<h3>' + v.name + '</h3>' + 
					'<h5>' + v.score + '</h5>' +
				'</div>')
		})
	}

	var buildQuestion = function(cell, cat) {
		console.log(currentGame)
		// get just the number from the cell clicked to be used as an index
		cellNum = cell.replace(/\D+/, '');
		thisRound.currentBet = ((parseInt(cellNum) + 1) + '00')
		// get just the number of the category clicked to be used as an index
		catNum = cat.replace(/\D+/, '');
		// get the question object that was clicked and store it for further use
		var clickedQuestion = currentGame.categories[catNum].clues[cellNum];
		thisRound.currentQuestion = currentGame.categories[catNum].clues[cellNum];
		showScreen('.question')
		$('.question p').text(clickedQuestion.question)
	}

	var selectPlayer = function(){
		hideScreen('.question button')
		showScreen('.player-buzzed')
		showScreen('.player-buttons')
		thisRound.buzzed = false;
		// Change this back to 1!
		if(currentGame.round == 9 && currentGame.turns == 1) {
			for(var i = 0; i < (currentGame.numPlayers); i++) {
				$('div.player-buttons').append('<button class="player-' + (i + 1) + '">' + currentGame.players[i].name + '</button>')
			}
		}
	}

	var roundEndMaintenance = function(gameOver){
		// reset thisRound object
		thisRound.clickedContent = false;
		thisRound.playerClicked = 0;
		thisRound.currentQuestion = {};
		thisRound.currentBet = 0;
		thisRound.buzzed = true;
		// reset turns counter
		currentGame.turns = 1;
		hideScreen('.answer-screen')
		hideScreen('.question')
		hideScreen('.buzzed')
		showScreen('.question button')

		if(gameOver) {
			// Reset rounds counter for new game
			currentGame.round = 1;
		} else {
			// increment rounds counter for next round
			currentGame.round++
		}
	}

	var finishRound = function(){
		// if rounds are at 10 end game and show final scores
		if(currentGame.round >= 10) {
			roundEndMaintenance(true)
			endGame()
		} else {
			roundEndMaintenance(false)
			//  else reset thisRound object.
		}
	}

	var determineWinner = function(players) {
		var currentPlayers = currentGame.players;
		var playerScores = [];
		var highestScore = 0;
		var numWinners = 0
		$.each(currentPlayers, function(i, v){
			playerScores.push(v.score);
		})
		highestScore = Math.max.apply(null, playerScores);

		$.each(currentPlayers,function(i, v){
			if(v.score == highestScore){
				currentGame.winners.push(v.name)
			}
		})
	}

	var endGame = function(){
		var currentPlayers = currentGame.players;
		$('.cell').css('visibility', 'visible');
		$('.cell').removeClass('clicked')

		games.push(currentGame);
		determineWinner(currentPlayers);
		hideScreen('.game-board');
		hideScreen('.scoreboard-field')
		$('.scoreboard').remove();
		$('div.player-buttons button').remove()
		showScreen('.winner-screen');
		
		var winners = currentGame.winners;
		var output = '';
		if(winners.length > 1) {
			$.each(currentGame.winners, function(i, v){
				output == '' ? output += v : output += (' and ' + v)
			})
		} else {
			output = winners.toString();
		}
		$('.winner-screen h3').text(output)
	}

	newPlaythrough()

	// on click "Let's Get Started" button.
	$('section.info-screen').on('click', 'button', function(event){
		// creates new variable for this element
		var element = $(this).parent();

		// calls hidescreen to hide the info-screen
		hideScreen(element);
		// shows the player-select screen
		thisRound = {
			clickedContent: false,
			playerClicked: 0,
			currentQuestion: {},
			currentBet: 0,
			buzzed: true
		}

		showScreen($(element).next());
	})

	$('section.player-select').on('click', 'button', function(){
		// creates new variable for this element
		var element = $(this).parent();
		// sets the selected number of players in the currentGame object
		currentGame.numPlayers = parseInt($(this).attr('id'));
		// hides the player-select screen
		hideScreen(element);
		// shows the player-names screen
		showScreen($(element).next());
		// Show the fields for the correct number of players
		showPlayers()
	})

	$('section.player-names').on('click', 'button', function(){
		// get data from player names fields - store in array
		var players = [];
		var allValid = true;
		clearErrors('section.player-names')
		for(var i = 1; i <= currentGame.numPlayers; i++) {
			// validate data from player names fields
			var thisInput = $('input#p' + i)
			players.push(validateInput(thisInput))
			if (players[i - 1] == undefined) {
				// if the added player does not come back validated, do not let the program move forward later
				allValid = false;
			}
		}
		
		// check if all player names in the array are valid
		if(allValid){
			// add each player into the current game object
			for(var i = 0; i < players.length; i++) {
				var thisName = players[i].toUpperCase()
				currentGame.players.push({name: thisName, score: 0});
			}
			// hide player-names screen
			hideScreen('.player-names');
			// show game-board screen for whichever screen size the player is using
			showScreen('.game-board')
			showScreen('.scoreboard-field')
			buildScoreBoard();
			buildCategories();
		}
	})

	$('.cell').click(function(){
		clearErrors('.game-board')
		console.log(thisRound.clickedContent)
		if(thisRound.clickedContent == false) {
			thisRound.clickedContent = true;
			var cellClicked = $(this).attr('id');
			if(!($('#' + cellClicked).hasClass('clicked'))){
				$('#' + cellClicked).addClass('clicked');
				var thisCellNum = cellClicked[1]
				if(cellClicked[0] === 'a') {
					if($('#clue-' + cellClicked[thisCellNum - 1]).css('display') == 'none') {
						clueSelection(cellClicked, mobile)
					}
				} else {
					var categoryClicked = $(this).parent().attr('id')				
					$('#' + cellClicked).css('visibility', 'hidden')
					buildQuestion(cellClicked, categoryClicked);
				}
			}
		}
	});

	$('.question button').click(function(){
		selectPlayer()
	})

	$(document).keypress(function(event){
		if(thisRound.buzzed){
			if($('.question').css('display') == 'block'){
				if(event.which == 32) {
					selectPlayer()
				}
			}
		}

	})

	$('.player-buzzed').on('click', 'button', function(){
		var playerClicked = $(this).attr('class')
		thisRound.playerClicked = playerClicked.replace(/\D+/, '');
		console.log(thisRound.currentQuestion.answer)
		hideScreen('.player-buzzed');
		showScreen('.answer-screen');
	})

	$('.answer-screen').on('click', 'button', function(){
		$('div.player-buttons').hide();
		clearErrors('.player-buzzed')
		var thisAnswer = thisRound.currentQuestion.answer.toLowerCase().replace("<i>", '').replace("</i>", '').replace('"', '').replace("(", '').replace(")", '').replace("\\", '').replace('"', '')
		var playerAnswer = $('.answer-screen input').val().toLowerCase()
		$('.answer-screen input').val('')
		if(playerAnswer == thisAnswer){
			var playerClicked = currentGame.players[thisRound.playerClicked - 1]
			playerClicked.score  += parseInt(thisRound.currentBet)
			$('.pl' + (thisRound.playerClicked - 1) + ' h5').text(playerClicked.score)
			currentGame.turns++ 
			finishRound()
		} else if (currentGame.turns >= 5) {
			$('.board').append(buildError('Sorry! You\'ve run out of turns! Try a different clue.'));
			finishRound();
		} else {
			thisRound.buzzed = true;
			hideScreen('.answer-screen');
			showScreen('.question button')
			$('.question').append(buildError('Wrong! Try again!'));
			currentGame.turns++;
		}
	})

	$('.winner-screen').on('click', 'button', function(){
		hideScreen('.winner-screen');
		showScreen('.info-screen');
		newPlaythrough()
	})
})