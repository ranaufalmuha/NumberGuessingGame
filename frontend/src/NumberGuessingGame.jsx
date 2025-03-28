import React, { useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const NumberGuessingGame = () => {
  const [guess, setGuess] = useState("");
  const [message, setMessage] = useState("");
  const [gameStatus, setGameStatus] = useState("not_started");
  const [scoreboard, setScoreboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const { principal,authActor } = useAuth();

  useEffect(() => {
    fetchScoreboard();
  }, []);

  const fetchScoreboard = async () => {
    try {
      const topScores = await authActor.getTopScores(10);
      setScoreboard(topScores);
      
      const userRankData = await authActor.getUserRank();
      setUserRank(userRankData);
    } catch (error) {
      console.error("Failed to fetch scoreboard:", error);
    }
  };

  const startGame = async () => {
    try {
      await authActor.initGame();
      setGameStatus("started");
      setMessage("Game started! Guess a number between 1 and 100.");
    } catch (error) {
      setMessage("Failed to start game");
    }
  };

  const makeGuess = async () => {
    if (!guess) return;
    try {
      const result = await authActor.checkGuess(parseInt(guess));
      switch (result) {
        case "TooLow":
          setMessage("Too low! Try a higher number.");
          break;
        case "TooHigh":
          setMessage("Too high! Try a lower number.");
          break;
        case "Correct Broh!":
          setMessage("Congratulations! You guessed the correct number!");
          setGameStatus("won");
          fetchScoreboard(); // Refresh scoreboard when user wins
          break;
      }
    } catch (error) {
      setMessage("Error processing guess");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96 mb-8">
        <h1 className="text-2xl font-bold mb-4 text-center">Number Guessing Game</h1>

        {gameStatus === "not_started" && (
          <button 
            onClick={startGame} 
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
          >
            Start Game
          </button>
        )}

        {gameStatus === "started" && (
          <>
            <input 
              type="number" 
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              className="w-full p-2 border rounded mb-4"
              placeholder="Enter your guess"
            />
            <button 
              onClick={makeGuess}
              className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 transition"
            >
              Guess
            </button>
          </>
        )}

        {gameStatus === "won" && (
          <button 
            onClick={startGame}
            className="w-full bg-purple-500 text-white py-2 rounded hover:bg-purple-600 transition"
          >
            Play Again
          </button>
        )}

        {message && (
          <div className="mt-4 text-center font-semibold">
            {message}
          </div>
        )}
      </div>

      {/* Scoreboard Section */}
      <div className="bg-white p-6 rounded-lg shadow-md w-96">
        <h2 className="text-xl font-semibold mb-4 text-center">🏆 Scoreboard</h2>
        <ul className="list-none">
          {scoreboard.map((player, index) => (
            <li 
              key={index} 
              className={`p-2 rounded-md text-center ${principal.toText() === player[0].toText() ? "bg-yellow-300" : "bg-gray-200"} mb-2`}
            >
              #{index + 1} - {player[0].toText().slice(0, 6)}... - {player[1].toString()} attempts
            </li>
          ))}

          {/* Jika user tidak ada di top 10, tampilkan dia di posisi ke-11 */}
          {userRank && userRank.rank >= 10 && (
            <li className="p-2 rounded-md text-center bg-green-400 text-white mt-2">
              #{userRank.rank + 1} - You - {userRank.score} attempts
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default NumberGuessingGame;
