console.log('WSInspector loading...');

const msgTypeRegex = /^WSInspector\..*$/gi;

const port = chrome.runtime.connect({ name: 'WSInspector' });

window.addEventListener('message', (event) => {
  if (event.source != window) {
    return;
  }

  
  if (msgTypeRegex.test(event.data.type)) {
    console.log('Received WSInspector data', event.data);
    // port.postMessage(event.data);
  }
});

console.log('WSInspector loaded');
