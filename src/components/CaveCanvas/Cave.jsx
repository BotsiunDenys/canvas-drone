import { useState, useEffect, useRef } from "react";
import s from "./Cave.module.css";
import EndGameModal from "./EndGameModal/EndGameModal";

const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 500;
const DRONE_SIZE = 10;
const DRONE_START_X = CANVAS_WIDTH / 2 - DRONE_SIZE / 2;
const SEGMENT_HEIGHT = 10;
const INITIAL_SCROLL_SPEED = 1;
const MAX_SCROLL_SPEED = 10;
const SCORE_MULTIPLAYER = 1;

const drawCaveWalls = (ctx, caveData, offsetY) => {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); // Clearing the canvas for new frame

  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  ctx.strokeStyle = "#5e5e5e"; // borders of the tunnel
  ctx.lineWidth = 10;

  ctx.fillStyle = "white"; // Cave tunnel

  ctx.beginPath();

  const firstLeft = CANVAS_WIDTH / 2 + caveData[0][0];
  ctx.moveTo(firstLeft, -offsetY);

  // building left wall
  caveData.forEach(([left, _right], index) => {
    const yPos = index * SEGMENT_HEIGHT - offsetY;
    if (yPos >= -SEGMENT_HEIGHT && yPos <= CANVAS_HEIGHT + SEGMENT_HEIGHT) {
      ctx.lineTo(CANVAS_WIDTH / 2 + left, yPos);
    }
  });

  //buiding right wall
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

function Cave({
  caveData,
  complexity,
  isOpenGame,
  setIsOpenGame,
  playerID,
  setCoordinates,
}) {
  const [droneX, setDroneX] = useState(DRONE_START_X);
  const [speedX, setSpeedX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [scrollSpeed, setScrollSpeed] = useState(0); // Initial speed is 0
  const [totalCaveHeight, setTotalCaveHeight] = useState(0);
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [endGameInfo, setEndGameInfo] = useState({
    type: "",
    isVisibleEndModal: false,
  });
  const SPEED_INCREMENT = complexity / 10;

  // useEffect clears values before new game
  useEffect(() => {
    if (caveData.length > 0) {
      setTotalCaveHeight(caveData.length * SEGMENT_HEIGHT);
      setOffsetY(0);
      setGameStarted(false);
    }
  }, [caveData]);

  // hides page overflow to avoid keyboards page scrolling
  useEffect(() => {
    endGameInfo.isVisibleEndModal
      ? (document.body.style.overflow = "hidden")
      : (document.body.style.overflow = "auto");
  }, [endGameInfo.isVisibleEndModal]);

  const checkCollision = () => {
    const currentSegmentIndex = Math.floor(offsetY / SEGMENT_HEIGHT);

    // Getting the current visible cave segment
    const currentSegment = caveData[currentSegmentIndex];

    if (currentSegment) {
      const [leftWall, rightWall] = currentSegment;
      const leftLimit = CANVAS_WIDTH / 2 + leftWall + DRONE_SIZE;
      const rightLimit = CANVAS_WIDTH / 2 + rightWall + DRONE_SIZE;

      const droneLeft = droneX; // Left side of the drone
      const droneRight = droneX + DRONE_SIZE; // Right side of the drone

      // Indentifying if drone touched walls
      if (droneLeft < leftLimit || droneRight > rightLimit) {
        setGameOver(true);
        setEndGameInfo({ type: "fail", isVisibleEndModal: true });
        setCoordinates([]);
        return;
      }
    }
  };

  const checkWinCondition = () => {
    if (offsetY >= totalCaveHeight - 20 && gameStarted) {
      setGameOver(true);
      setEndGameInfo({ type: "success", isVisibleEndModal: true });
      setCoordinates([]);
      updateLocalStorage();
    }
  };

  const updateLocalStorage = () => {
    const storedData = localStorage.getItem("gameScoreboard");
    let scoreboard = storedData ? JSON.parse(storedData) : [];

    const existingPlayerIndex = scoreboard.findIndex(
      (entry) => entry.playerID === playerID
    );

    if (existingPlayerIndex !== -1) {
      if (score > scoreboard[existingPlayerIndex].score) {
        scoreboard[existingPlayerIndex].score = score;
        scoreboard[existingPlayerIndex].complexity = complexity;
      }
    } else {
      scoreboard.push({ playerID, complexity, score });
    }

    localStorage.setItem("gameScoreboard", JSON.stringify(scoreboard));
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const updateGame = () => {
      if (gameOver) return;
      if (!isOpenGame) return;

      const visibleCaveData = caveData.slice(
        Math.floor(offsetY / SEGMENT_HEIGHT),
        Math.floor(offsetY / SEGMENT_HEIGHT) +
          CANVAS_HEIGHT / SEGMENT_HEIGHT +
          2
      );

      drawCaveWalls(ctx, visibleCaveData, offsetY % SEGMENT_HEIGHT);
      if (scrollSpeed)
        setScore(
          (prev) => prev + SCORE_MULTIPLAYER * (complexity + scrollSpeed)
        );
      setOffsetY((prevOffset) => prevOffset + scrollSpeed);

      if (!gameStarted && offsetY > SEGMENT_HEIGHT) {
        setGameStarted(true);
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
        // Increasing scroll speed when "ArrowDown" is pressed
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
        // Decreasing scroll speed when "ArrowUp" is pressed, but drone cannot stop
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
    <>
      <div
        className={`${s.modalWrapper} ${isOpenGame && s.visibleModalWrapper}`}
      >
        <div className={s.canvasWrapper}>
          <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />
          <div
            style={{
              position: "absolute",
              top: 40,
              left: droneX,
              width: DRONE_SIZE,
              height: DRONE_SIZE,
              backgroundColor: "red",
            }}
          />
          <div className={s.infoWrapper}>
            <p>Vertical speed: {scrollSpeed.toFixed(1)}</p>
            <p>Horizontal speed: {speedX.toFixed(1)}</p>
            <p>Score: {Math.round(score)}</p>
          </div>
        </div>
      </div>
      <EndGameModal
        score={score}
        endGameInfo={endGameInfo}
        setIsVisibleEndModal={setEndGameInfo}
        setIsOpenGame={setIsOpenGame}
      />
    </>
  );
}

export default Cave;
