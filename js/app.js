console.log("all linked up")

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
			console.log("You already guessed that!");
			return;
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


}


