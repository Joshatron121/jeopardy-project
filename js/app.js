$(function(){
	// Default object for each new game
	var Game = {
		numPlayers: 0,
		players: {
			// Will store data for each player including name and score
		},
		turns: 0,
		round: 0,
		winner: ''
	}

	// Create global currentGame scope
	var currentGame = {};
	// Variable for storing finished games in for eventual leaderboard content
	var games = [];

	// shows a screen
	var showScreen = function(elem){
		$(elem).show()
	}

	// hides a screen
	var hideScreen = function(elem) {
		$(elem).hide()
	}

	var showPlayers = function() {
		// for each player in the game
		for(var i = 1; i <= currentGame.numPlayers; i++) {
			// Show the player field on player-names screen
			$('fieldset.player' + i).show();
		}
	}

	var buildError = function(errorMessage){
		var errorElem = $('.templates .error').clone();
		console.log(errorElem)
		
		var question = errorElem.find('.error-text')
		question.text(errorMessage)
		console.log(errorElem)
		

		return errorElem;
	}

	var clearErrors = function(screen) {
		$(screen +' .error').remove()
	}

	var validateInput = function(input){
		var currentInput = $(input).val()
		var element = $(input).parent();
		// if not valid show error for correct type of problem
		if(currentInput == ''){
			$(element).append(buildError('Please enter a name'));
		} else if (currentInput.match(/[^A-Za-z0-9" "]/gi)) {
			$(element).append(buildError('Please enter only numbers, spaces and letters.'));
			// else if valid add data to the players array
		} else {
			return currentInput;
		}
	}

	// on click "Let's Get Started" button.
	$('section.info-screen').on('click', 'button', function(){
		// creates new variable for this element
		var element = $(this).parent();
		// creates a new object for the currentGame
		var currentGame = Object.create(Game);
		// calls hidescreen to hide the info-screen
		hideScreen(element);
		// shows the player-select screen
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
		clearErrors('section.player-names')
		for(var i = 1; i <= currentGame.numPlayers; i++) {
			// validate data from player names fields
			var thisInput = $('input#p' + i)
			players.push(validateInput(thisInput))
		}
		

		// if not valid show error for correct type of problem

		// else if valid add data to the players array

		// hide player-names screen

		// show game-board screen for whichever screen size the player is using
	})
})