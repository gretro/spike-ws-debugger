(() => {
  function postInspectorCreated(id, socket) {
    // TODO: Retry until the content script is ready.
    window.postMessage({
      type: 'WSInspector.CREATE',
      payload: {
        socket: {
          id,
          status: socket.readyState,
          url: socket.url
        }
      }
    }, '*');
  }

  function postSocketStatusUpdate(id, status) {
    window.postMessage({
        type: 'WSInspector.STATUS_UPDATE',
        payload: {
          socket: {
            id,
            status
          }
        }
      }, '*');
  }

  function postMessageSent(id, message) {
    window.postMessage({
      type: 'WSInspector.MSG_SEND',
      payload: {
        socket: {
          id
        },
        data: message
      }
    }, '*');
  }

  function postMessageReceived(id, message) {
    window.postMessage({
      type: 'WSInspector.MSG_RECEIVED',
      payload: {
        socket: {
          id
        },
        data: message
      }
    }, '*');
  }

  function createWebSocketInspector(socket) {
    const socketId = 1; // Implement a real ID mechanism.

    const port = chrome.runtime.connect('WSInspect');
    port.postMessage({ type: 'PING' });

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
      get close() { return (code, reason) => {
        socket.close(code, reason);

        postSocketStatusUpdate(socketId, socket.CLOSING);
      };},
      get send() { return (data) => {
        socket.send(data);

        postMessageSent(socketId, data);
      };}
    };

    socket.onopen = function inspectorOnOpen(evt) {
      postSocketStatusUpdate(socketId, socket.readyState);

      if (wrapper.onopen) {
        wrapper.onopen(evt);
      }
    };

    socket.onmessage = function inspectorOnMessage(evt) {
      postMessageReceived(socketId, evt.data);

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

    postInspectorCreated(socketId, socket);
    return wrapper;
  }

  let interval = null;

  let socket = new WebSocket('ws://localhost:8001');
  socket = createWebSocketInspector(socket);

  socket.onopen = function specificOnOpen() {
    interval = setInterval(() => {
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
  
  socket.onerror = function specificOnClose() {
    if (interval) { 
      clearInterval(interval);
    }
  };
})();