console.log("all linked up")

const validKeys = "qwertyuiopasdfghjklzxcvbnm".split("");

class Word {
	constructor(word){
		this.word = word;
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
	// methods: 
	// 1. check if an input character is in the word -- if yes, update revealed and display properties accordingly. Return t/f
	handleGuess(guess){

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
	// 2. check if all letters have been correctly guessed revealed (just return t/f)
	isSolved(){
		return this.revealed === this.length; 
	}
	// 3. check if an input character has been guessed already (just return t/f)
	wasGuessed(character){
		if (this.guessedLetters.includes(character)) {
			return true;
		} else {
			return false;
		}
	}
}

const game = {
	word: null,
	lives: 5,
	round: 1,
	active: false,
	getWord(){
		const randInd = Math.floor(Math.random() * wordbank.length);
		const randWord = wordbank.splice(randInd, 1)[0];
		this.word = new Word(randWord);
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
		guesses.textContent = this.lives;
	},
	updateKeyboard(){

	},
	render(){
		this.displayWord();
		this.displayGuesses();
		this.updateKeyboard(); 
	},
	makeKeyboard(){

		const firstRow = "qwertyuiop".split("");
		const secondRow = "asdfghjkl".split("");
		const thirdRow = "zxcvbnm".split("");

		const rows = [firstRow, secondRow, thirdRow];

		for (let i = 0; i <= 2; i++){
			const rowDiv = document.getElementById(`${i + 1}`);

			rows[i].forEach(key => {

				const keyDiv = document.createElement("div");
				keyDiv.classList.add("key");
				keyDiv.id = key;
				keyDiv.textContent = key.toUpperCase();
				rowDiv.appendChild(keyDiv);

			})

		}

		const allKeys = document.querySelectorAll(".key");

		for (let i = 0; i < allKeys.length; i++){
			allKeys[i].addEventListener("click", (evt)=>{
				const isGuessCorrect = this.word.handleGuess(evt.currentTarget.id);
				if (!isGuessCorrect){
					this.lives--;
				}
				this.render();
			})
		}

	},
	init(){
		this.makeKeyboard();
		this.getWord();
		this.render();
	}
}

// cached elements 
const display = document.getElementById("display");
const guesses = document.getElementById("guesses");

// global functions 
function activate () {
	document.body.addEventListener("keypress", (evt) => {

		const input = evt.key.toLowerCase();

		if(validKeys.includes(input)){
			const isGuessCorrect = game.word.handleGuess(input);
			if (!isGuessCorrect){
				game.lives--;
			}
			game.render();
		}
	});

	game.init();
}

activate();
