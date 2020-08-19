// +++++++++++++++++++
// IIFE wrapper
// +++++++++++++++++++

console.log(" *** HANGMAN *** ");

void (function() {

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


		// "public" / outward methods -- called by functions in game obj:: 
		// (key method is render, which must be passed a ref to the game state when invoked)
		updateMessage(message){
			this.messageEl.textContent = message;
		}
		render(gameState) {
			const { word, guesses, round, active } = gameState;
			const guessedLetters = word.guessedLetters;

			if (active === true) {
				this.messageDisplayEl.style.display = "none";
				this.gameAreaEl.style.display = "flex";
			} else {
				this.gameAreaEl.style.display = "none";
				this.messageDisplayEl.style.display = "flex";
			}

			this.updateWord(word);
			this.updateGuesses(guesses);
			this.updateRound(round);
			this.updateKeyboard(guessedLetters);
			this.updateGuessedLetters(guessedLetters); 
		}


		// "private" / internal methods bundled together and called by render:: 

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

				if (ltr.display){
					text = ltr.character.toUpperCase();
				}

				const letterDiv = document.createElement("div");
				letterDiv.classList.add("letter");
				letterDiv.textContent = text; 
				wordDiv.appendChild(letterDiv);
			})

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
		get active(){
			return this.state.active;
		},
		set active(bool){
			this.state.active = bool;
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
			if (input === "enter" && !this.active) {
				this.start();
			} else {
				const validKeys = "qwertyuiopasdfghjklzxcvbnm".split("");

				if(validKeys.includes(input)){

					const isGuessCorrect = this.word.handleGuess(input);

					if (!isGuessCorrect){
						this.guesses--;
					}

					this.display.render(this.state);
					this.checkWin();
				}
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

			this.guesses = 5;
			this.active = false;
			this.display.updateMessage(message);
			this.display.render(this.state);
		},
		newWord(){
			const randInd = Math.floor(Math.random() * WORD_BANK.length);
			const randWord = WORD_BANK.splice(randInd, 1)[0];
			this.word = new Word(randWord);
		},
		start(){
			this.active = true;
			this.newWord();
			this.display.render(this.state);
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

			})

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


	// ++++++++++++++++++++++++++++++++
	// initialize display singleton
	// ++++++++++++++++++++++++++++++++

	game.display = game.display || new Display();


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

})();
