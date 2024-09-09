// src/App.jsx
import { useEffect, useState } from "react";
import { UserService } from "./lib/Services/UserService";
import { CoordinatesService } from "./lib/Services/CoordinatesService";
import UserForm from "./components/UserForm/UserForm";
import Cave from "./components/CaveCanvas/Cave";

const App = () => {
  const [coordinates, setCoordinates] = useState([]); // State to store coordinates
  const [loading, setLoading] = useState(false);
  const [id, setId] = useState(null);
  const [chunks, setChunks] = useState("");

  const handleInit = async (data) => {
    try {
      // First request: Initialize user and get id
      const initResponse = await UserService.initUser({
        name: data.name,
        complexity: data.complexity,
      });
      const userId = initResponse.data.id;
      setId(userId);

      // Make 4 chunk requests using Promise.all
      const chunkRequests = [1, 2, 3, 4].map((chunkNo) =>
        UserService.getUserChunks(userId, chunkNo)
      );
      const chunkResponses = await Promise.all(chunkRequests);

      // Concatenate chunks into one string
      const concatenatedChunks = chunkResponses
        .map((res) => res.data.chunk)
        .join("");
      setChunks(concatenatedChunks);
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
        const [x, y] = data.split(",").map(Number); // Parse coordinates
        setCoordinates((prevCoords) => [...prevCoords, [x, y]]); // Store new coordinates in state
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
      <UserForm onSubmit={handleInit} />
      {coordinates.length !== 0 && !loading && (
        <Cave caveData={coordinates.slice(0, coordinates.length / 4)} />
      )}
    </div>
  );
};

export default App;
