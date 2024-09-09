import { useEffect, useRef, useState } from "react";

const CaveCanvas = ({ coordinates, difficultyLevel, playerName }) => {
  const canvasRef = useRef(null);
  const [visibleIndex, setVisibleIndex] = useState(0);
  const [horizontalSpeed, setHorizontalSpeed] = useState(0);
  const [verticalSpeed, setVerticalSpeed] = useState(0); // Start with 0 vertical speed
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameStatus, setGameStatus] = useState(""); // "win" or "lose"
  const [isGameStarted, setIsGameStarted] = useState(false); // Tracks if the game has started
  const maxVisibleCoords = 50;
  const droneSize = 20;
  const scoreMultiplier = 10; // Adjust the score multiplier for gameplay balance
  const collisionTolerance = 10; // Increase tolerance to prevent early collisions

  // Reset game state when the game starts
  const startGame = () => {
    setIsGameStarted(true);
    setIsGameOver(false);
    setGameStatus("");
    setVisibleIndex(0);
    setScore(0);
    setHorizontalSpeed(0);
    setVerticalSpeed(0);
  };

  // Handle key down events for controlling the drone
  const handleKeyDown = (e) => {
    if (!isGameStarted || isGameOver) return; // Prevent controls before the game starts or after game ends
    switch (e.key) {
      case "ArrowUp":
        setVerticalSpeed((speed) => Math.max(speed - 1, 0)); // Decrease more slowly, minimum speed 0
        break;
      case "ArrowDown":
        setVerticalSpeed((speed) => Math.min(speed + 1, 5)); // Increase more slowly, cap at 5
        break;
      case "ArrowLeft":
        setHorizontalSpeed((speed) => Math.max(speed - 1, -5)); // Limit horizontal speed
        break;
      case "ArrowRight":
        setHorizontalSpeed((speed) => Math.min(speed + 1, 5)); // Limit horizontal speed
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isGameStarted, isGameOver]);

  // Function to check collision between the drone and cave walls
  //   const checkCollision = (droneX, caveLeft, caveRight) => {
  //     return (
  //       droneX < caveLeft + collisionTolerance ||
  //       droneX > caveRight - collisionTolerance
  //     );
  //   };

  useEffect(() => {
    if (!isGameStarted || isGameOver) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    const drawCave = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "#808080";
      ctx.fillRect(0, 0, width, height);

      const visibleCoords = coordinates.slice(
        visibleIndex,
        visibleIndex + maxVisibleCoords
      );

      if (visibleCoords.length > 0) {
        ctx.beginPath();

        const [firstLeft, firstRight] = visibleCoords[0];
        ctx.moveTo(width / 2 + firstLeft, 0);
        ctx.lineTo(width / 2 + firstRight, 0);

        visibleCoords.forEach(([left, right], index) => {
          const y = index * (height / maxVisibleCoords);
          ctx.lineTo(width / 2 + right, y);
        });

        for (let i = visibleCoords.length - 1; i >= 0; i--) {
          const [left, right] = visibleCoords[i];
          const y = i * (height / maxVisibleCoords);
          ctx.lineTo(width / 2 + left, y);
        }

        ctx.closePath();
        ctx.fillStyle = "#FFFFFF";
        ctx.fill();
      }
    };

    // const drawDrone = () => {
    //   const droneX = canvas.width / 2 + horizontalSpeed * 5; // Horizontal movement
    //   const caveLeft = width / 2 + coordinates[visibleIndex][0];
    //   const caveRight = width / 2 + coordinates[visibleIndex][1];

    //   // Draw the drone (triangle)
    //   ctx.beginPath();
    //   ctx.moveTo(droneX, 10); // Top point of the triangle
    //   ctx.lineTo(droneX - droneSize / 2, droneSize + 10); // Bottom left
    //   ctx.lineTo(droneX + droneSize / 2, droneSize + 10); // Bottom right
    //   ctx.closePath();
    //   ctx.fillStyle = "red";
    //   ctx.fill();

    //   // Skip collision check for the first few frames after speed change
    //   if (framesSinceSpeedChange > 5) {
    //     if (checkCollision(droneX, caveLeft, caveRight)) {
    //       setIsGameOver(true);
    //       setGameStatus("lose");
    //     }
    //   }
    // };

    const update = () => {
      if (isGameOver) return;

      // Update cave and drone position
      setVisibleIndex((prev) =>
        Math.min(prev + verticalSpeed, coordinates.length - maxVisibleCoords)
      );

      drawCave();

      // Calculate score
      setScore(
        (prev) => prev + scoreMultiplier + verticalSpeed + difficultyLevel
      );

      // Check if the game is won (reached the end of the cave)
      if (visibleIndex + maxVisibleCoords >= coordinates.length) {
        setIsGameOver(true);
        setGameStatus("win");
      }

      requestAnimationFrame(update);
    };

    update();
  }, [
    isGameStarted,
    isGameOver,
    // visibleIndex,
    horizontalSpeed,
    verticalSpeed,
    coordinates,
  ]);

  // Handle the end of the game
  //   useEffect(() => {
  //     if (isGameOver) {
  //       const finalScore = score;
  //       if (gameStatus === "win") {
  //         alert("Congratulations! You won!");
  //         const gameData = JSON.parse(localStorage.getItem("gameData")) || [];
  //         gameData.push({ playerName, difficultyLevel, finalScore });
  //         localStorage.setItem("gameData", JSON.stringify(gameData));
  //       } else if (gameStatus === "lose") {
  //         alert("The drone has been destroyed.");
  //       }
  //     }
  //   }, [isGameOver, gameStatus, score, playerName, difficultyLevel]);

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={500}
        height={500}
        style={{ border: "1px solid black" }}
      />
      <div>
        <p>Score: {score}</p>
        <p>Horizontal Speed: {horizontalSpeed}</p>
        <p>Vertical Speed: {verticalSpeed}</p>
      </div>
      {!isGameStarted && <button onClick={startGame}>Start Game</button>}
    </div>
  );
};

export default CaveCanvas;
