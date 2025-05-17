export default class MemoryGame {
   constructor(config) {
      this.config = config
      this.cardStat = this.getCardStat()
   }
   
   init() {
      this.cacheDom()
      this.bindEvents()
   }
   
   // ===== Initialization =====
   cacheDom() {
      const $ = (selector) => document.querySelector(selector)
      this.cardsContainer = $(".cards-container")
      this.resultPopup = $(".modal-result-popup")
      this.overlay = $(".overlay")
      this.resultMovesCount = $(".result-sp .moves-count")
      this.timeElapsed = $(".time-elapsed-count")
      this.movesCount = $(".moves-count")
      this.winTitle = $(".text-winner")
      this.winMsg = $(".text-message")
      this.multiPlayerResult = $(".result-mp")
      this.singlePlayerResult = $(".result-sp")
   }
   
   bindEvents() {
      this.cardsContainer.addEventListener("click", (e) => {
         const card = e.target.closest(".card")
         if (!card) return
         this.clickCard(card)
      })
   }
   
   // ===== Click & Core Logic =====
   clickCard(card) {
      if (this.ignoreCardClick(card)) return
      
      card.classList.toggle("flipped")
      this.updateMovesCount()
      
      if (!this.cardStat.card1) {
         this.cardStat.card1 = card
         return
      }
      
      this.cardStat.card2 = card
      this.cardStat.isProcessing = true
      
      const { card1, card2 } = this.cardStat
      const match = card1.dataset.icon === card2.dataset.icon
      
      if (match) {
         this.handleCardMatch(card1, card2)
         return
      }
      
      this.handleCardMismatch(card1, card2)
   }
   
   ignoreCardClick(card) {
      return (
         this.cardStat.isProcessing ||
         card.classList.contains("flipped")
      )
   }
   
   updateMovesCount() {
      if (this.config.settings.players > 1) return
      this.config.singlePlayer.movesCount++
      this.movesCount.textContent = this.config.singlePlayer.movesCount
   }
   
   // ===== Match & Mismatch Logic =====
   handleCardMatch(card1, card2) {
      this.matchEffect(card1, card2)
      this.resetCards()
      
      if (this.config.settings.players <= 1) {
         if (this.allCardsFlipped()) {
            this.config.singlePlayer.completed = true
         }
         return
      }
      
      this.updateMultiPlayerScore()
      if (this.allCardsFlipped()) {
         this.multiPlayerGameOver()
      }
   }
   
   handleCardMismatch(card1, card2) {
      setTimeout(() => {
         card1.classList.toggle("flipped")
         card2.classList.toggle("flipped")
         this.resetCards()
      }, 500)
      
      if (this.config.settings.players >= 2) {
         this.nextPlayerTurn()
      }
   }
   
   matchEffect(card1, card2) {
      const card1Front = card1.querySelector(".front")
      const card2Front = card2.querySelector(".front")
      
      setTimeout(() => {
         card1Front.classList.add("match")
         card2Front.classList.add("match")
         card1Front.style.color = "#314859"
         card2Front.style.color = "#314859"
         
         setTimeout(() => {
            card1Front.classList.remove("match")
            card2Front.classList.remove("match")
         }, 400)
      }, 300)
   }
   
   // ===== State & Turn Helpers =====
   getCardStat() {
      return {
         card1: null,
         card2: null,
         isProcessing: false
      }
   }
   
   resetCards() {
      this.cardStat = this.getCardStat()
   }
   
   allCardsFlipped() {
      const allCards = this.cardsContainer.querySelectorAll(".card")
      return Array.from(allCards).every(card =>
         card.classList.contains("flipped")
      )
   }
   
   nextPlayerTurn() {
      let currentPlayer = this.config.multiPlayer.currentPlayer
      if (currentPlayer < this.config.settings.players) {
         currentPlayer++
      } else {
         currentPlayer = 1
      }
      this.config.multiPlayer.currentPlayer = currentPlayer
      
      const stats = document.querySelectorAll(".stat")
      stats.forEach(stat => {
         stat.classList.remove("player-turn")
      })
      stats[currentPlayer - 1].classList.add("player-turn")
   }
   
   updateMultiPlayerScore() {
      this.config.multiPlayer[this.config.multiPlayer.currentPlayer]++
      
      const scores = document.querySelectorAll(".stat .score")
      scores.forEach((score, i) => {
         score.textContent = this.config.multiPlayer[i + 1]
      })
   }
   
   // ===== Game Over =====
   gameOver() {
      const min = Math.floor(this.config.singlePlayer.timeTaken / 60)
      const sec = this.config.singlePlayer.timeTaken % 60
      
      this.timeElapsed.textContent = `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
      this.winTitle.textContent = this.config.singlePlayer.completed ? "You did it!" : "Time's up!"
      this.resultMovesCount.textContent = this.config.singlePlayer.movesCount
      
      setTimeout(() => {
         this.resultPopup.classList.toggle("hide")
         this.overlay.classList.toggle("hide")
      }, 300)
   }
 
   multiPlayerGameOver() {
   // Display each player's score
   for (let i = 1; i <= this.config.settings.players; i++) {
      const div = document.createElement("div")
      div.classList.add("flex")
      div.innerHTML = `
        <p class="players">Player${i}</p>
        <p class="pairs-count">${this.config.multiPlayer[i]} Pairs</p>
      `
      this.multiPlayerResult.appendChild(div)
   }

   // Determine the highest score and corresponding player(s)
   let highestScore = -Infinity
   let winners = []

   for (let i = 1; i <= this.config.settings.players; i++) {
      const score = this.config.multiPlayer[i]
      if (score > highestScore) {
         highestScore = score
         winners = [i]
      } else if (score === highestScore) {
         winners.push(i)
      }
   }

   console.log("Winners:", winners)

   // Update the DOM to reflect the winner(s)
   const stat = document.querySelectorAll(".result-mp .flex .players")
   winners.forEach(winnerIndex => {
      stat[winnerIndex - 1].textContent += " ( Winner! )"
   })

   // Show the result popup
   setTimeout(() => {
      this.multiPlayerResult.classList.toggle("hide")
      this.singlePlayerResult.classList.toggle("hide")
      this.resultPopup.classList.toggle("hide")
      this.overlay.classList.toggle("hide")
   }, 300)
}
}