console.log('WSInspector loading...');

const msgTypeRegex = /^WSInspector\..*$/gi;

let port = null;
 
window.addEventListener('message', (event) => {
  if (event.source !== window) {
    return;
  }
  
  if (msgTypeRegex.test(event.data.type)) {
    console.log('Received WSInspector data', event.data, event);

    if (port === null) {
      port = chrome.runtime.connect({ name: 'WSInspector' });
    }

    port.postMessage(event.data);
  }
});

console.log('WSInspector loaded', chrome.runtime.id);
