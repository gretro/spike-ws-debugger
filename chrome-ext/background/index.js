console.log('Event page loaded')

chrome.runtime.onConnect.addListener((port) => {
  console.log('Connection made', port)
  if (port.name === 'WSInspector') {
    port.onMessage.addListener(msg => {
      console.log('Event page received message', msg)
    })

    port.onDisconnect.addListener((...properties) => {
      console.log('Port disconnected', properties)
    })
  }
})

chrome.runtime.onSuspend.addListener(() => {
  console.log('Event page will suspend')
})