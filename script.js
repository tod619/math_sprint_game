// Pages
const gamePage = document.getElementById('game-page');
const scorePage = document.getElementById('score-page');
const splashPage = document.getElementById('splash-page');
const countdownPage = document.getElementById('countdown-page');
// Splash Page
const startForm = document.getElementById('start-form');
const radioContainers = document.querySelectorAll('.radio-container');
const radioInputs = document.querySelectorAll('input');
const bestScores = document.querySelectorAll('.best-score-value');
// Countdown Page
const countdown = document.querySelector('.countdown');
// Game Page
const itemContainer = document.querySelector('.item-container');
// Score Page
const finalTimeEl = document.querySelector('.final-time');
const baseTimeEl = document.querySelector('.base-time');
const penaltyTimeEl = document.querySelector('.penalty-time');
const playAgainBtn = document.querySelector('.play-again');

// Equations
let questionAmount = 0
let equationsArray = []
let playersGuessArray = []
let bestScoreArray = []

// Game Page
let firstNumber = 0;
let secondNumber = 0;
let equationObject = {};
const wrongFormat = [];

// Time
let timer
let timePlayed = 0
let baseTime = 0
let penaltyTime = 0
let finalTime = 0
let finalTimeDisplay = '0.0'


// Scroll
let valueY = 0

// Refresh splash page best scores
function bestScoresToDOM() {
  bestScores.forEach((bestScore, idx) => {
    const bestScoreEl = bestScore
    bestScoreEl.textContent = `${bestScoreArray[idx].bestScore}s`
  })
}

// check local storage and set best score values
function getSavedBestScores() {
  if(localStorage.getItem('bestScores')) {
    bestScoreArray = JSON.parse(localStorage.bestScores)
  } else {
    bestScoreArray = [
      { questions: 10, bestScore: finalTimeDisplay },
      { questions: 25, bestScore: finalTimeDisplay },
      { questions: 50, bestScore: finalTimeDisplay },
      { questions: 99, bestScore: finalTimeDisplay },
    ]

    localStorage.setItem('bestScores', JSON.stringify(bestScoreArray))
  }

  bestScoresToDOM()
}

// Update best Score Array
function updateBestScore() {
  bestScoreArray.forEach((score, idx) => {
    //Select score to update
    if(questionAmount == score.questions) {
      // Return best score as a number with one decimal
      const savedBestScore = Number(bestScoreArray[idx].bestScore)
      // Update if the new final score is replacing zero or is less
      if(savedBestScore === 0 || savedBestScore < finalTime) {
        bestScoreArray[idx].bestScore = finalTimeDisplay
      }
    }

  })

  // Update splash page
  bestScoresToDOM()

  // save to local storage
  localStorage.setItem('bestScores', JSON.stringify(bestScoreArray))
}

// Reset game
function playAgain() {
  gamePage.addEventListener('click', startTimer)
  scorePage.hidden = true	
  splashPage.hidden = false

  equationsArray = []
  playersGuessArray = []
  valueY = 0
  playAgainBtn.hidden = true

}

// show score page
function showScorePage() {

  // Show Play Again btn
  setTimeout(() =>{
    playAgainBtn.hidden = false
  }, 1000)
  gamePage.hidden = true
  scorePage.hidden = false
}

// Format and display score in DOM
function scoresToDOM() {
  finalTimeDisplay = finalTime.toFixed(1)
  baseTime = timePlayed.toFixed(1)
  penaltyTime = penaltyTime.toFixed(1)

  baseTimeEl.textContent = `Base Time: ${baseTime}s`
  penaltyTimeEl.textContent = `Penalty: +${penaltyTime}s`
  finalTimeEl.textContent = `${finalTimeDisplay}s`
  updateBestScore()

  // Scroll to top, go to score page
  itemContainer.scrollTo({top: 0, behavior: 'instant' })
  showScorePage()
}

// Stop timer + process results, go to score page
function checkTime() {
  if(playersGuessArray.length == questionAmount) {
    //console.log('player guess array: ', playersGuessArray)
    clearInterval(timer)

    //Check for wrong guesses + add penality time
    equationsArray.forEach((equation, idx) => {
      if(equation.evaluated === playersGuessArray[idx]) {
        // Correct guess no penality
      } else {
        //Incorrect guess 0.5s penality
        penaltyTime += 0.5
      }

    })

    finalTime = timePlayed + penaltyTime
    scoresToDOM()
    // console.log('time:',timePlayed)
    // console.log('penalty:',penaltyTime)
    // console.log('final time: ',finalTime)
  }
}

// add a 10th of a second to timeplayed
function addTime() {
  timePlayed += 0.1
  checkTime()
}

// Start timer when game page is clicked
function startTimer() {
  // Reset Times
  timePlayed = 0
  penaltyTime = 0
  finalTime = 0
  timer = setInterval(addTime, 100)
  gamePage.removeEventListener('click', startTimer)

}

// Scroll,  and store the user selction in the player guess array
function select(guessedTrue) {
  // Scroll 80px at a time
  valueY += 80
  itemContainer.scroll(0, valueY)
  //addplayer guess to array
  return guessedTrue ? playersGuessArray.push('true') : playersGuessArray.push('false')
} 


// Display game page
function showGamePage() {
  gamePage.hidden = false
  countdownPage.hidden = true
}

// Get a random number up to a max number
function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max))
}

// Create Correct/Incorrect Random Equations
function createEquations() {
  // Randomly choose how many correct equations there should be
  const correctEquations = getRandomInt(questionAmount)
  // Set amount of wrong equations
  const wrongEquations = questionAmount - correctEquations
  // Loop through, multiply random numbers up to 9, push to array
  for (let i = 0; i < correctEquations; i++) {
    firstNumber = getRandomInt(9)
    secondNumber = getRandomInt(9)
    const equationValue = firstNumber * secondNumber;
    const equation = `${firstNumber} x ${secondNumber} = ${equationValue}`;
    equationObject = { value: equation, evaluated: 'true' };
    equationsArray.push(equationObject);
  }
  // Loop through, mess with the equation results, push to array
  for (let i = 0; i < wrongEquations; i++) {
    firstNumber = getRandomInt(9)
    secondNumber = getRandomInt(9)
    const equationValue = firstNumber * secondNumber;
    wrongFormat[0] = `${firstNumber} x ${secondNumber + 1} = ${equationValue}`;
    wrongFormat[1] = `${firstNumber} x ${secondNumber} = ${equationValue - 1}`;
    wrongFormat[2] = `${firstNumber + 1} x ${secondNumber} = ${equationValue}`;
    const formatChoice = getRandomInt(3)
    const equation = wrongFormat[formatChoice];
    equationObject = { value: equation, evaluated: 'false' };
    equationsArray.push(equationObject);
  }
  shuffle(equationsArray)
}

function equationsToDOM() {
  equationsArray.forEach((equation) => {
    // Item
    const item = document.createElement('div')
    item.classList.add('item')
    //Equation TExt
    const equationText = document.createElement('h1')
    equationText.textContent = equation.value
    //Append items
    item.appendChild(equationText)
    itemContainer.appendChild(item)
  })
}

// Dynamically adding correct/incorrect equations
function populateGamePage() {
  // Reset DOM, Set Blank Space Above
  itemContainer.textContent = '';
  // Spacer
  const topSpacer = document.createElement('div');
  topSpacer.classList.add('height-240');
  // Selected Item
  const selectedItem = document.createElement('div');
  selectedItem.classList.add('selected-item');
  // Append
  itemContainer.append(topSpacer, selectedItem);

  // Create Equations, Build Elements in DOM
  createEquations()
  equationsToDOM()

  // Set Blank Space Below
  const bottomSpacer = document.createElement('div');
  bottomSpacer.classList.add('height-500');
  itemContainer.appendChild(bottomSpacer);
}

// Run countdown counter
function countdownStart() {
  countdown.textContent = '3'

  setTimeout(() => {
    countdown.textContent = '2'
  }, 1000)

  setTimeout(() => {
    countdown.textContent = '1'
  }, 2000)

  setTimeout(() => {
    countdown.textContent = 'GO!'
  }, 3000)
}

// Navigate from splash page to countdown page
function showCountdown() {
  countdownPage.hidden = false
  splashPage.hidden = true 
  countdownStart()
  populateGamePage()
  setTimeout(showGamePage, 4000)
}

// Get the value from the selected radio button
function getRadioValue() {
  let radioValue

  radioInputs.forEach((radioInput) => {
    if(radioInput.checked) {
      radioValue = radioInput.value
    }
  })

  return radioValue
}

// Form that decides amount of questions to be asked
function selectQuestionAmount(e) {
  e.preventDefault()
  questionAmount = getRadioValue()
  console.log(questionAmount)
  if(questionAmount) {
    showCountdown()
  }
}

// Event Listners
startForm.addEventListener('click', () => {
  radioContainers.forEach((radioEl) => {
    // Remove Selected Label Styling From Each Container
    radioEl.classList.remove('selected-label')

    // Add Back Selected Label if the radio input is checked
    if(radioEl.children[1].checked) {
      radioEl.classList.add('selected-label')
    }
  })
}) 

startForm.addEventListener('submit', selectQuestionAmount)
gamePage.addEventListener('click',startTimer)

// on load
getSavedBestScores()
