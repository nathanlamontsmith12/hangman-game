
const validKeys = "qwertyuiopasdfghjklzxcvbnm".split("");

// only use words of length >= 6 from word library 
const wordbank = library.filter(word => word.length >= 6);


console.log("HANGMAN");

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
// game logic
// +++++++++++++++++++

const game = {
	word: null,
	firstGame: true,
	guesses: 5,
	round: 1,
	checkWin(){
		if (this.guesses <= 0){
			this.gameOver("lost");
		} else if(this.word.isSolved()){
			this.gameOver("won");
		}
	},
	handleInput(input){
		if(validKeys.includes(input)){

			const isGuessCorrect = this.word.handleGuess(input);

			if (!isGuessCorrect){
				this.guesses--;
			}

			this.render();
			this.checkWin();
		}
	},
	gameOver(condition){

		gameArea.style.display = "none";
		messageDisplay.style.display = "flex";

		const newMessage = `The word was ${this.word.solution.toUpperCase()}!`;

		if (condition === "won") {
			message.textContent = "You won! " + newMessage;
			this.round++;
		} else {
			message.textContent = "You lost! " + newMessage + " Starting back at round 1...";
			this.round = 1;
		}

		this.guesses = 5;
	},
	// render methods: 
	displayWord(){

		// remove previous wordDiv if it exists 
		if (document.getElementById("word")){
			display.removeChild(document.getElementById("word"));
		}

		// make new wordDiv: 
		const wordDiv = document.createElement("div");
		wordDiv.id = "word";

		this.word.letters.forEach(ltr => {
			
			let text = "_";

			if (ltr.display){
				text = ltr.character.toUpperCase();
			}

			const letterDiv = document.createElement("div");
			letterDiv.classList.add("letter");
			letterDiv.textContent = text; 
			wordDiv.appendChild(letterDiv);
		})

		display.appendChild(wordDiv);
	}, 
	displayGuesses(){
		guesses.textContent = `Guesses Remaining: ${this.guesses}`;
	},
	displayRound(){
		round.textContent = `Round: ${this.round}`;
	},
	updateKeyboard(){
		const allKeys = document.querySelectorAll(".key");

		allKeys.forEach(key => {
			if (this.word.guessedLetters.includes(key.id)) {
				key.style.opacity = "0.3";
			} else {
				key.style.opacity = "1";
			}
		})
	},
	render(){
		this.displayWord();
		this.displayRound();
		this.displayGuesses();
		this.updateKeyboard(); 
	},
	// init methods: 
	getWord(){
		const randInd = Math.floor(Math.random() * wordbank.length);
		const randWord = wordbank.splice(randInd, 1)[0];
		this.word = new Word(randWord);
	},
	makeKeyboard(){

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
	},
	activateKeyboard(){
		const allKeys = document.querySelectorAll(".key");

		for (let i = 0; i < allKeys.length; i++){
			allKeys[i].addEventListener("click", (evt)=>{
				const input = evt.currentTarget.id; 
				this.handleInput(input);
			})
		}
	},
	init(){

		messageDisplay.style.display = "none";
		gameArea.style.display = "flex";

		if (this.firstGame) {
			document.body.addEventListener("keypress", (evt) => {
				const input = evt.key.toLowerCase();
				this.handleInput(input);
			});			

			this.makeKeyboard();
			this.activateKeyboard();

			this.firstGame = false;
		}

		this.getWord();
		this.render();
	}
}

// +++++++++++++++++++
// cached elements 
// +++++++++++++++++++

const display = document.getElementById("display");
const guesses = document.getElementById("guesses");
const message = document.getElementById("message");
const messageDisplay = document.getElementById("message-display");
const start = document.getElementById("start");
const gameArea = document.getElementById("game-area")
const round = document.getElementById("round");

// +++++++++++++++++++
// event listeners 
// +++++++++++++++++++

start.addEventListener("click", ()=>{
	game.init();
});
