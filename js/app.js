// only use words of length >= 6 from word library 

const WORD_BANK = library.filter(word => word.length >= 6);

// +++++++++++++++++++
// classes 
// +++++++++++++++++++

class Word {
	constructor(word){
		this.solution = word;
		this.letters = word.split("").map(ltr => {
			return ({
				character: ltr,
				display: false
			});
		});
		this.length = this.letters.length;
		this.revealed = 0;
		this.guessedLetters = [];
	}
	handleGuess(guess){

		// Note: return false(y) to subtract a life/guess 

		if (this.wasGuessed(guess)) {
			console.log("You already guessed that letter!");
			return true;
		} else {
			this.guessedLetters.push(guess);

			let goodGuess = false; 

			for (let i = 0; i < this.length; i++) {

				if (this.letters[i].character == guess) {
					this.letters[i].display = true;
					this.revealed++;
					goodGuess = true;
				}
			}

			return goodGuess;			
		}
	}
	isSolved(){
		return this.revealed === this.length; 
	}
	wasGuessed(character){
		return this.guessedLetters.includes(character);
	}
}


// +++++++++++++++++++
// classes -- singletons
// +++++++++++++++++++


class Display {
	constructor(){

		// +++++++++++++++++++
		// cached elements
		// +++++++++++++++++++

		this.display = document.getElementById("display");
		this.guesses = document.getElementById("guesses");
		this.message = document.getElementById("message");
		this.messageDisplay = document.getElementById("message-display");
		this.gameArea = document.getElementById("game-area")
		this.round = document.getElementById("round");
		this.guessedLetters = document.getElementById("guessed-letters");
		this.allKeys = document.querySelectorAll(".key");
	}
	gameOver(){
		this.gameArea.style.display = "none";
		this.messageDisplay.style.display = "flex";
	}
	newGame(){
		this.messageDisplay.style.display = "none";
		this.gameArea.style.display = "flex";
	}
	updateMessage(message){
		this.message.textContent = message;
	}
	updateWord(word){

		// remove previous wordDiv if it exists 
		if (document.getElementById("word")){
			this.display.removeChild(document.getElementById("word"));
		}

		// make new wordDiv: 
		const wordDiv = document.createElement("div");
		wordDiv.id = "word";

		word.letters.forEach(ltr => {
			
			let text = "_";

			if (ltr.display){
				text = ltr.character.toUpperCase();
			}

			const letterDiv = document.createElement("div");
			letterDiv.classList.add("letter");
			letterDiv.textContent = text; 
			wordDiv.appendChild(letterDiv);
		})

		this.display.appendChild(wordDiv);
	}
	updateGuesses(guesses){
		this.guesses.textContent = `Guesses Remaining: ${guesses}`;
	}
	updateRound(round){
		this.round.textContent = `Round: ${round}`;
	}
	updateKeyboard(guessedLetters){
		this.allKeys.forEach(key => {
			if (guessedLetters.includes(key.id)) {
				key.style.opacity = "0.3";
			} else {
				key.style.opacity = "1";
			}
		})
	}
	render(gameState) {
		const { word, guesses, round } = gameState;
		const guessedLetters = word.guessedLetters;

		this.updateWord(word);
		this.updateGuesses(guesses);
		this.updateRound(round);
		this.updateKeyboard(guessedLetters); 
	}
}


// +++++++++++++++++++
// game 
// +++++++++++++++++++

const game = {
	display: null,
	state: {
		word: null,
		guesses: 5,
		round: 1,
	}, 

	// getters / setters for game state: 
	get guesses(){
		return this.state.guesses;
	},
	set guesses(num){
		this.state.guesses = num;
	},
	get word(){
		return this.state.word;
	},
	set word(newWord){
		this.state.word = newWord;
	},
	get round(){
		return this.state.round;
	}, 
	set round(num){
		this.state.round = num;
	},

	// game logic: 
	checkWin(){
		if (this.guesses <= 0){
			this.gameOver("lost");
		} else if(this.word.isSolved()){
			this.gameOver("won");
		}
	},
	handleInput(input){
		const validKeys = "qwertyuiopasdfghjklzxcvbnm".split("");

		if(validKeys.includes(input)){

			const isGuessCorrect = this.word.handleGuess(input);

			if (!isGuessCorrect){
				this.guesses--;
			}

			this.display.render(this.state);
			this.checkWin();
		}
	},
	gameOver(condition){
		let message = `The word was ${this.word.solution.toUpperCase()}!`;

		if (condition === "won") {
			message = "You won! " + message;
			this.round++;
		} else {
			message = "You lost! " + message + " Starting back at round 1...";
			this.round = 1;
		}

		this.display.gameOver();
		this.display.updateMessage(message);
		this.guesses = 5;
	},
	newWord(){
		const randInd = Math.floor(Math.random() * WORD_BANK.length);
		const randWord = WORD_BANK.splice(randInd, 1)[0];
		this.word = new Word(randWord);
	},
	init(){
		this.newWord();
		this.display.newGame();
		this.display.render(this.state);
	}
}


// +++++++++++++++++++
// IIFE 
// +++++++++++++++++++

void (function() {

	// +++++++++++++++++++
	// keyboard set up 
	// +++++++++++++++++++

	function makeKeyboard(){

		const firstRow = "qwertyuiop".split("");
		const secondRow = "asdfghjkl".split("");
		const thirdRow = "zxcvbnm".split("");
		const rows = [firstRow, secondRow, thirdRow];

		for (let i = 0; i <= 2; i++){
			const rowDiv = document.getElementById(`r-${i + 1}`);
			
			rows[i].forEach(key => {

				const keyDiv = document.createElement("div");
				keyDiv.classList.add("key");
				keyDiv.id = key;
				keyDiv.textContent = key.toUpperCase();
				rowDiv.appendChild(keyDiv);

			})

		}
	} 
	
	function activateKeyboard(){
		const allKeys = document.querySelectorAll(".key");

		for (let i = 0; i < allKeys.length; i++){
			allKeys[i].addEventListener("click", (evt)=>{
				const input = evt.currentTarget.id; 
				game.handleInput(input);
			})
		}
	}

	makeKeyboard();
	activateKeyboard();


	// +++++++++++++++++++
	// initialize display singleton
	// +++++++++++++++++++

	game.display = game.display || new Display();


	// +++++++++++++++++++
	// attach event listeners 
	// +++++++++++++++++++

	const startBtn = document.getElementById("start");

	startBtn.addEventListener("click", ()=>{
		game.init();
	});

	document.body.addEventListener("keypress", (evt) => {
		const input = evt.key.toLowerCase();
		game.handleInput(input);
	});

})();
