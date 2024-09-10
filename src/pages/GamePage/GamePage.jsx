import { useState, useEffect } from "react";
import { CoordinatesService } from "../../lib/Services/CoordinatesService";
import { UserService } from "../../lib/Services/UserService";
import UserForm from "../../components/UserForm/UserForm";
import Cave from "../../components/CaveCanvas/Cave";
import Button from "../../components/Button/Button";

const GamePage = () => {
  const [coordinates, setCoordinates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [id, setId] = useState(null);
  const [isOpenGame, setIsOpenGame] = useState(false);
  const [complexity, setComplexity] = useState(1);

  const handleInit = async (data) => {
    setComplexity(1);
    try {
      // Getting userId
      const initResponse = await UserService.initUser({
        name: data.name,
        complexity: data.complexity,
      });
      const userId = initResponse.data.id;
      setComplexity(data.complexity);
      setId(userId);

      // Getting chunks
      const chunkRequests = [1, 2, 3, 4].map((chunkNo) =>
        UserService.getUserChunks(userId, chunkNo)
      );
      const chunkResponses = await Promise.all(chunkRequests);

      // Concatenating chunks into one string
      const concatenatedChunks = chunkResponses
        .map((res) => res.data.chunk)
        .join("");
      handleConnect(userId, concatenatedChunks);
    } catch (error) {
      console.error("Error initializing user or fetching chunks:", error);
    }
  };

  const handleConnect = (id, chunks) => {
    // Initialize WebSocket connection
    setLoading(true);
    CoordinatesService.connect(
      (data) => {
        const [x, y] = data.split(",").map(Number); // Parsing coordinates
        setCoordinates((prevCoords) => [...prevCoords, [x, y]]); // Storing new coordinates in state
      },
      (error) => {
        console.error("WebSocket error:", error);
      },
      () => {
        CoordinatesService.send(`player:${id}-${chunks}`);
        setCoordinates([]);
      },
      () => {
        setLoading(false);
        console.log("WebSocket disconnected");
      }
    );
  };

  useEffect(() => {
    return () => {
      CoordinatesService.disconnect();
    };
  }, []);

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: "50px",
        margin: "50px 0",
      }}
    >
      <UserForm disabled={coordinates.length > 0} onSubmit={handleInit} />
      {loading ? (
        <h2>Building the map...</h2>
      ) : (
        <Button
          disabled={loading || coordinates.length === 0}
          onClick={() => setIsOpenGame(true)}
        >
          Start
        </Button>
      )}
      <Cave
        playerID={id}
        complexity={complexity}
        isOpenGame={isOpenGame}
        setIsOpenGame={setIsOpenGame}
        setCoordinates={setCoordinates}
        caveData={coordinates.slice(0, coordinates.length / 4)}
      />
    </div>
  );
};

export default GamePage;
