(() => {
  function createWebSocketInspector(socket) {
    const boundSocketClose = socket.close.bind(socket);
    const boundSocketSend = socket.send.bind(socket);

    const wrapper = {
      // Wrapped properties
      get binaryType() { return socket.binaryType; },
      set binaryType(value) { socket.binaryType = value; },
      get bufferedAmount() { return socket.bufferedAmount; },
      get extensions() { return socket.extensions },
      set extensions(value) { socket.extensions = value },
      onclose: null,
      onerror: null,
      onmessage: null,
      onopen: null,
      get protocol() { return socket.protocol },
      get readyState() { return socket.readyState },

      // Constants
      CONNECTING: socket.CONNECTING,
      OPEN: socket.OPEN,
      CLOSING: socket.CLOSING,
      CLOSED: socket.CLOSED,

      // Functions
      get close() { return () => {

      }; },
      get send() { return boundSocketSend; }
    };

    socket.onopen = function inspectorOnOpen(evt) {
      console.log('Connection established');

      if (wrapper.onopen) {
        wrapper.onopen(evt);
      }
    };

    socket.onmessage = function inspectorOnMessage(evt) {
      console.log('Message received through socket', evt.data);

      if (wrapper.onmessage) {
        wrapper.onmessage(evt);
      }
    };

    socket.onclose = function inspectorOnMessage(evt) {
      console.log('Websocket has closed');

      if (wrapper.onclose) {
        wrapper.onclose(evt);
      }
    };

    return wrapper;
  }

  let interval = null;

  let socket = new WebSocket('ws://localhost:8001');
  socket = createWebSocketInspector(socket);

  socket.onopen = function specificOnOpen() {
    setInterval(() => {
      const msg = 'Echo echo echo!';
      socket.send(msg);
    }, 1000);
  }

  socket.onmessage = function specificOnMessage(evt) {
    const receivedMsg = evt.data;
    console.log('Received data', receivedMsg);
  };

  socket.onclose = function specificOnClose() {
    if (interval) { 
      clearInterval(interval);
    }
  };
})();