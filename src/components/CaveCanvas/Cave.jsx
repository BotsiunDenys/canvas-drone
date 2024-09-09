import React, { useState, useEffect, useRef } from "react";

const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 500;
const DRONE_SIZE = 15;
const DRONE_START_X = CANVAS_WIDTH / 2 - DRONE_SIZE / 2;
const SEGMENT_HEIGHT = 5;
const SPEED_INCREMENT = 0.1;
const INITIAL_SCROLL_SPEED = 1;
const MAX_SCROLL_SPEED = 10; // You can adjust the maximum speed as needed

const drawCaveWalls = (ctx, caveData, offsetY) => {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); // Clear the canvas for new frame

  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  ctx.strokeStyle = "#808080";
  ctx.lineWidth = 10;

  ctx.fillStyle = "white"; // Tunnel (inside) color

  ctx.beginPath();

  const firstLeft = CANVAS_WIDTH / 2 + caveData[0][0];
  ctx.moveTo(firstLeft, -offsetY);

  caveData.forEach(([left, _right], index) => {
    const yPos = index * SEGMENT_HEIGHT - offsetY;
    if (yPos >= -SEGMENT_HEIGHT && yPos <= CANVAS_HEIGHT + SEGMENT_HEIGHT) {
      ctx.lineTo(CANVAS_WIDTH / 2 + left, yPos);
    }
  });

  for (let index = caveData.length - 1; index >= 0; index--) {
    const [_left, right] = caveData[index];
    const yPos = index * SEGMENT_HEIGHT - offsetY;
    if (yPos >= -SEGMENT_HEIGHT && yPos <= CANVAS_HEIGHT + SEGMENT_HEIGHT) {
      ctx.lineTo(CANVAS_WIDTH / 2 + right, yPos);
    }
  }

  ctx.closePath();

  ctx.fill();
  ctx.stroke();
};

function Cave({ caveData }) {
  const [droneX, setDroneX] = useState(DRONE_START_X);
  const [speedX, setSpeedX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [scrollSpeed, setScrollSpeed] = useState(0); // Start with zero speed
  const [gameOver, setGameOver] = useState(false);
  const [totalCaveHeight, setTotalCaveHeight] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (caveData.length > 0) {
      setTotalCaveHeight(caveData.length * SEGMENT_HEIGHT);
      setOffsetY(0); // Reset offset when a new game starts
      setGameStarted(false); // Reset game state
    }
  }, [caveData]);

  const checkCollision = () => {
    const currentSegmentIndex = Math.floor(offsetY / SEGMENT_HEIGHT);

    // Get the current cave segment to check the collision
    const currentSegment = caveData[currentSegmentIndex];

    if (currentSegment) {
      const [leftWall, rightWall] = currentSegment;
      const leftLimit = CANVAS_WIDTH / 2 + leftWall;
      const rightLimit = CANVAS_WIDTH / 2 + rightWall;

      // Define the invisible square collision box
      // const droneTop = 20; // Fixed Y position for the top of the square
      // const droneBottom = droneTop + DRONE_SIZE; // Bottom of the square
      const droneLeft = droneX; // Left side of the square
      const droneRight = droneX + DRONE_SIZE; // Right side of the square

      // Check if the square collides with the cave walls
      if (droneLeft < leftLimit || droneRight > rightLimit) {
        setGameOver(true);
        alert("You lost! The drone hit the wall.");
        return;
      }
    }
  };

  const checkWinCondition = () => {
    if (offsetY >= totalCaveHeight - 20 && gameStarted) {
      setGameOver(true);
      alert("You won!");
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const updateGame = () => {
      if (gameOver) return;

      const visibleCaveData = caveData.slice(
        Math.floor(offsetY / SEGMENT_HEIGHT),
        Math.floor(offsetY / SEGMENT_HEIGHT) +
          CANVAS_HEIGHT / SEGMENT_HEIGHT +
          2
      );

      drawCaveWalls(ctx, visibleCaveData, offsetY % SEGMENT_HEIGHT);
      setOffsetY((prevOffset) => prevOffset + scrollSpeed);

      if (!gameStarted && offsetY > SEGMENT_HEIGHT) {
        setGameStarted(true); // Start the game after the first scroll
      }

      setDroneX((prevDroneX) => {
        let newPos = prevDroneX + speedX;
        if (newPos < 0) newPos = 0;
        if (newPos > CANVAS_WIDTH - DRONE_SIZE)
          newPos = CANVAS_WIDTH - DRONE_SIZE;
        return newPos;
      });

      checkCollision();
      checkWinCondition();
    };

    const gameLoop = setInterval(updateGame, 1000 / 60);
    return () => clearInterval(gameLoop);
  }, [
    caveData,
    offsetY,
    speedX,
    scrollSpeed,
    gameOver,
    totalCaveHeight,
    gameStarted,
  ]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") setSpeedX(-4);
      if (e.key === "ArrowRight") setSpeedX(4);
      if (e.key === "ArrowDown") {
        // Increase scroll speed when "ArrowDown" is pressed
        setScrollSpeed((prevSpeed) =>
          Math.min(
            prevSpeed === 0
              ? INITIAL_SCROLL_SPEED
              : prevSpeed + SPEED_INCREMENT,
            MAX_SCROLL_SPEED
          )
        );
      }
      if (e.key === "ArrowUp") {
        // Decrease scroll speed when "ArrowUp" is pressed, but not below 1
        setScrollSpeed((prevSpeed) =>
          Math.max(prevSpeed - SPEED_INCREMENT, INITIAL_SCROLL_SPEED)
        );
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") setSpeedX(0);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return (
    <div
      className="game-container"
      style={{
        position: "relative",
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
      }}
    >
      <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />

      <svg
        style={{
          position: "absolute",
          top: 20,
          left: droneX,
          transform: "rotate(180deg)",
        }}
        width={DRONE_SIZE}
        height={DRONE_SIZE}
        viewBox="0 0 100 100"
      >
        <polygon
          points="50,0 0,100 100,100" // A triangle pointing down
          style={{ fill: "red" }}
        />
      </svg>
    </div>
  );
}

export default Cave;
