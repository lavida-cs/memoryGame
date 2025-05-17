const config = {
   settings: {
      theme: "numbers",
      players: 1,
      gridSize: "4x4"
   },
   singlePlayer: {
      duration: 30,
      completed: false,
      timeTaken: null,
      movesCount: 0,
      timesUp: false
   },
   multiPlayer: {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      currentPlayer: 1
   }
}

export { config }