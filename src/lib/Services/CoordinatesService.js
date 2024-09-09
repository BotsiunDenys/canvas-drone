export class CoordinatesService {
  static ws = null;

  static connect(onMessage, onError, onOpen, onClose) {
    if (this.ws) {
      this.ws.close();
    }

    this.ws = new WebSocket(`${import.meta.env.VITE_WS_URL}cave`);

    this.ws.onopen = () => {
      console.log("WebSocket connected");
      if (onOpen) onOpen();
    };

    this.ws.onmessage = (event) => {
      if (event.data === "finished") {
        this.ws.close();
        console.log("WebSocket disconnected");
        if (onClose) onClose();
      } else if (onMessage) {
        onMessage(event.data);
      }
    };

    this.ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      if (onError) onError(error);
    };

    return this.ws;
  }

  static send(message) {
    if (this.ws) {
      this.ws.send(message);
    }
  }

  static disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
