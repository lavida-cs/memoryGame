import { config } from "./config.js"
import MemoryGame from "./memory.js"

export default class App {
   constructor() {
      this.memoryGame = new MemoryGame(config)
   }
   
   init() {
      this.cacheDom()
      this.bindEvents()
   }
   
   cacheDom() {
      const $ = (selector) => document.querySelector(selector)
      const $$ = (selector) => document.querySelectorAll(selector)
      this.settingsScreen = $(".settings-view");
      this.gameScreen = $(".game-view");
      this.spStats = $(".stats-sp");
      this.mpStats = $(".stats-mp");
      this.themeOpt = $$("input[name='theme']");
      this.playersOpt = $$("input[name='players']");
      this.gridOpt = $$("input[name='gridSize']");
      this.startGameBtn = $(".btn-start-game");
      this.cardsContainer = $(".cards-container");
   }
   
   bindEvents() {
      [...this.themeOpt, ...this.playersOpt, ...this.gridOpt].forEach(input => {
         input.addEventListener("change", () => this.applySettings(input.name, input.id))
      })
      this.startGameBtn.addEventListener("click", () => this.startGame())
   }
   
   applySettings(opt, choice) {
      config.settings[opt] = choice
   }
   
   renderGameScreen() {
      this.settingsScreen.classList.toggle("hide")
      this.gameScreen.classList.toggle("hide")
   }
   
   shuffle(arr) {
      for (let i = arr.length - 1; i > 0; i--) {
         const j = Math.floor(Math.random() * (i + 1));
         [arr[i], arr[j]] = [arr[j], arr[i]];
      }
   }
   
   buildTimer(){
      const minutes = document.querySelector(".minutes")
      const seconds = document.querySelector(".seconds")
      
      const countDown = setInterval(()=>{
         if(config.singlePlayer.completed){
            clearInterval(countDown)
            config.singlePlayer.timeTaken = config.singlePlayer.duration
            this.memoryGame.gameOver()
            return 
         }
         const min = Math.floor(config.singlePlayer.duration / 60)
         const sec = config.singlePlayer.duration % 60
         
         minutes.textContent = String(min).padStart(2,"0")
         seconds.textContent = String(sec).padStart(2,"0")
         
         if(config.singlePlayer.duration <= 0){
            clearInterval(countDown)
            config.singlePlayer.timesUp = true
            config.singlePlayer.timeTaken = config.singlePlayer.duration
            this.memoryGame.gameOver()
         }
         
         config.singlePlayer.duration --
      },1000)
   }
   
   
   buildCards() {
      const gridSize = config.settings.gridSize === "4x4" ? 4 : 6
      const totalCards = gridSize * gridSize
      const cardSize = gridSize === 4 ? "110px" : "70px"
      
      const themeData = {
         numbers: Array.from({ length: 18 }, (d, i) => i + 1),
         flags: [
            "🇺🇸",
            "🇬🇧",
            "🇨🇦",
            "🇦🇺",
            "🇩🇪",
            "🇫🇷",
            "🇯🇵",
            "🇮🇳",
            "🇧🇷",
            "🇲🇽",
            "🇨🇳",
            "🇮🇹",
            "🇿🇦",
            "🇪🇸",
            "🇰🇷",
            "🇳🇬",
            "🇹🇰",
            "🏴󠁧󠁢󠁳󠁣󠁴󠁿"
         ]
      } [config.settings.theme]
      this.shuffle(themeData)
      const themeCount = gridSize === 4 ? 4 * 2 : 6 * 3
      const selectedTheme = themeData.slice(0, themeCount)
      const themeX2 = [...selectedTheme, ...selectedTheme]
      this.shuffle(themeX2)
      
      this.cardsContainer.innerHTML = ""
      this.cardsContainer.style.gridTemplateColumns = `repeat(${gridSize}, ${cardSize})`
      for (let i = 1; i <= totalCards; i++) {
         const card = document.createElement("div")
         card.className = "card"
         card.dataset.icon = themeX2[i - 1]
         card.style.height = cardSize
         card.innerHTML = `
           <div class="flipper">
             <div class="front">${themeX2[i-1]}</div>
             <div class="back"></div>
           </div>
            `
         this.cardsContainer.appendChild(card)
      }
   }
   
   buildStats() {
      const player = parseInt(config.settings.players)
      if (player === 1) {
         this.buildTimer() // build timer and return
         return
      }
      
      // if player > 1 build each player stat
      for (let i = 1; i <= player; i++) {
         const stat = document.createElement("div")
         stat.className = "stat"
         stat.innerHTML = `
           <p class="text-players">P${i}</p>
           <p class="score">0</p>
         `
         this.mpStats.appendChild(stat)
      }
      const playerOne = this.mpStats.querySelectorAll(".stat")[0]
      playerOne.classList.add("player-turn")
      this.spStats.classList.toggle("hide")
      this.mpStats.classList.toggle("hide")
   }
   
   
   startGame() {
      this.buildCards()
      this.buildStats()
      this.renderGameScreen()
      this.memoryGame.init() 
   }
}