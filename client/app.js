(() => {
  function postInspectorCreated(id, socket) {
    console.log('Inspector created', id);
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
    console.log('Websocket status update', status);

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
    console.log('Message sent', message);

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
    console.log('Message received', message);

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

  function isFunction(obj) {
    return !!(obj && obj.constructor && obj.call && obj.apply);
  };

  function createWebSocketInspector(socket) {
    const socketId = 1; // Implement a real ID mechanism.

    const port = chrome.runtime.connect('WSInspect');
    port.postMessage({ type: 'PING' });

    const socketCallbacks = {
      onclose: socket.onclose,
      onerror: socket.onerror,
      onmessage: socket.onmessage,
      onopen: socket.onopen
    };

    const overriddenProperties = {
      send: function inspectorSend(data) {
        postMessageSent(socketId, data);

        this.send(data);
      }
    }

    socket.onopen = function inspectorOnOpen(evt) {
      postSocketStatusUpdate(socketId, socket.readyState);

      if (socketCallbacks.onopen) {
        socketCallbacks.onopen(evt);
      }
    };

    socket.onmessage = function inspectorOnMessage(evt) {
      postMessageReceived(socketId, evt.data);

      if (socketCallbacks.onmessage) {
        socketCallbacks.onmessage(evt);
      }
    };

    socket.onclose = function inspectorOnMessage(evt) {
      console.log('Websocket has closed');

      if (socketCallbacks.onclose) {
        socketCallbacks.onclose(evt);
      }
    };

    socket.onerror = function inspectorOnError(evt) {
      console.log('Websocket error');

      if (socketCallbacks.onerror) {
        socketCallbacks.onerror(evt);
      }
    }

    const socketProxy = new Proxy(socket, {
      get: function(target, property) {
        if (property in socketCallbacks) {
          return socketCallbacks[property];
        }

        const value = property in overriddenProperties 
          ? overriddenProperties[property] 
          : target[property];
        
        if (isFunction(value)) {
          return value.bind(target);
        }

        return value;
      },
      set: function(target, property, value) {
        if (property in socketCallbacks) {
          socketCallbacks[property] = value;
        } else {
          target[property] = value;
        }
      }
    });

    postInspectorCreated(socketId, socket);
    return socketProxy;
  }

  let interval = null;

  let socket = new WebSocket('ws://localhost:8001');
  socket = createWebSocketInspector(socket);

  console.log('URL', socket.url);

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