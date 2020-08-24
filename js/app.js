console.log(" *** HANGMAN *** ");


// +++++++++++++++++++
// IIFE wrapper
// +++++++++++++++++++

void (function() {


	// +++++++++++++++++++
	// constants 
	// +++++++++++++++++++

	const VALID_KEYS = "abcdefghijklmnopqrstuvwxyz".split("");

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
					guessed: false
				});
			});
			this.guessedLetters = [];
		}
		handleGuess(guess){

			// Note: return false(y) to subtract a guess 

			if (this.wasGuessed(guess)) {
				return true;
			} else {
				this.guessedLetters.push(guess);

				let goodGuess = false; 

				for (let i = 0; i < this.letters.length; i++) {

					if (this.letters[i].character == guess) {
						this.letters[i].guessed = true;
						goodGuess = true;
					}
				}

				return goodGuess;
			}
		}
		isSolved(){
			return this.letters.every(ltr => ltr.guessed == true); 
		}
		wasGuessed(character){
			return this.guessedLetters.includes(character);
		}
	}


	// +++++++++++++++++++++++
	// classes -- singletons
	// +++++++++++++++++++++++

	// All display updating logic encapsulated here:  

	class Display {
		constructor(){

			// +++++++++++++++++++
			// cached elements
			// +++++++++++++++++++

			this.displayEl = document.getElementById("display");
			this.guessesEl = document.getElementById("guesses");
			this.messageEl = document.getElementById("message");
			this.messageDisplayEl = document.getElementById("message-display");
			this.gameAreaEl = document.getElementById("game-area")
			this.roundEl = document.getElementById("round");
			this.guessedLettersEl = document.getElementById("guessed-letters");
			this.allKeysEl = document.querySelectorAll(".key");
		}


		// "public" / outward method RENDER -- called from within game obj,
		// and must be passed a ref to the game state when called 
		render(gameState) {
			const { word, guesses, round, active, message } = gameState;
			const guessedLetters = word ? word.guessedLetters : undefined;

			if (active === true) {
				this.messageDisplayEl.style.display = "none";
				this.gameAreaEl.style.display = "flex";
			} else {
				this.gameAreaEl.style.display = "none";
				this.messageDisplayEl.style.display = "flex";
			}

			message ? this.updateMessage(message) : null;
			word ? this.updateWord(word) : null;
			guesses ? this.updateGuesses(guesses) : null;
			round ? this.updateRound(round) : null;
			guessedLetters ? this.updateKeyboard(guessedLetters) && this.updateGuessedLetters(guessedLetters) : null; 
		}


		// "private" / internal methods bundled together and called by render:: 
		updateMessage(message){
			this.messageEl.textContent = message;
		}
		updateWord(word){

			// remove previous wordDiv if it exists 
			if (document.getElementById("word")){
				this.displayEl.removeChild(document.getElementById("word"));
			}

			// make new wordDiv: 
			const wordDiv = document.createElement("div");
			wordDiv.id = "word";

			word.letters.forEach(ltr => {
				
				let text = "_";

				if (ltr.guessed){
					text = ltr.character.toUpperCase();
				}

				const letterDiv = document.createElement("div");
				letterDiv.classList.add("letter");
				letterDiv.textContent = text; 
				wordDiv.appendChild(letterDiv);
			});

			this.displayEl.appendChild(wordDiv);
		}
		updateGuesses(guesses){
			this.guessesEl.textContent = `Guesses: ${guesses}`;
		}
		updateRound(round){
			this.roundEl.textContent = `Round: ${round}`;
		}
		updateKeyboard(guessedLetters){
			this.allKeysEl.forEach(key => {
				if (guessedLetters.includes(key.id)) {
					key.style.opacity = "0.3";
				} else {
					key.style.opacity = "1";
				}
			});
		}
		updateGuessedLetters(guessedLetters){
			this.guessedLettersEl.innerHTML = "";
			guessedLetters.forEach(ltr => {
				const newLtr = document.createElement("span");
				newLtr.textContent = ltr.toUpperCase();
				this.guessedLettersEl.appendChild(newLtr);
			});
		}
	}


	// ++++++++++++++++++++++
	// game object container
	// ++++++++++++++++++++++

	const game = {
		// place to store DISPLAY singleton:: 

		display: null,


		// game state -- 
		// to be passed in to this.display.render method

		state: {
			active: false,
			message: "",
			word: null,
			guesses: 5,
			round: 1,
		}, 


		// getters / setters for game state: 
		get active(){
			return this.state.active;
		},
		set active(bool){
			this.state.active = bool;
		},
		get message(){
			return this.state.message;
		},
		set message(str){
			this.state.message = str;
		},
		get word(){
			return this.state.word;
		},
		set word(newWord){
			this.state.word = newWord;
		},
		get guesses(){
			return this.state.guesses;
		},
		set guesses(num){
			this.state.guesses = num;
		},
		get round(){
			return this.state.round;
		}, 
		set round(num){
			this.state.round = num;
		},

		// game logic: 

		checkWin(){
			const gameIsOver = this.word.isSolved() || this.guesses <= 0; 
			if (gameIsOver){
				const playerHasWon = this.word.isSolved() && this.guesses > 0;
				this.gameOver(playerHasWon);
			} 
		},
		handleInput(input){
			if (input === "enter" && !this.active) {
				this.start();
			} else if (this.active && VALID_KEYS.includes(input)){
				const isGuessCorrect = this.word.handleGuess(input);

				if (!isGuessCorrect){
					this.guesses--;
				}

				this.render();
				this.checkWin();
			}
		},
		gameOver(playerHasWon){
			let message = `The word was ${this.word.solution.toUpperCase()}!`;

			if (playerHasWon) {
				message = "You won! " + message;
				this.round++;
			} else {
				message = "You lost! " + message + " Starting back at round 1...";
				this.round = 1;
			}

			this.guesses = 5;
			this.active = false;
			this.message = message;
			this.display.render(this.state);
		},
		newWord(){
			const randInd = Math.floor(Math.random() * WORD_BANK.length);
			const randWord = WORD_BANK.splice(randInd, 1)[0];
			this.word = new Word(randWord);
		},
		init(startBtn){
			this.display = this.display || new Display();
			this.message = "Welcome to Hangman!";

			// turn on display for start btn: 
			startBtn.style.display = "";

			this.render();
		},
		start(){
			this.active = true;
			this.newWord();
			this.render();
		},
		render(){
			// delegate render to the display singleton:: 
			if (this.display) {
				this.display.render(this.state);
			}
		}
	}


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

			});

		}
	} 
	
	function activateKeyboard(){
		const allKeys = document.querySelectorAll(".key");

		for (let i = 0; i < allKeys.length; i++){
			allKeys[i].addEventListener("click", (evt)=>{
				const input = evt.currentTarget.id; 
				game.handleInput(input);
			});
		}
	}

	makeKeyboard();
	activateKeyboard();


	// +++++++++++++++++++++++++
	// attach event listeners 
	// +++++++++++++++++++++++++

	const startBtn = document.getElementById("start");

	startBtn.addEventListener("click", ()=>{
		game.start();
	});

	document.body.addEventListener("keypress", (evt) => {
		const input = evt.key.toLowerCase();
		game.handleInput(input);
	});


	// +++++++++++++++++
	// initialize game
	// +++++++++++++++++

	game.init(startBtn);

})();
