const ws = require('nodejs-websocket');
const uuid = require('uuid/v1');

const server = ws.createServer(conn => {
    const connectionId = uuid().substr(0, 8);
    console.log('New connection', connectionId);
    conn.on('text', txt => {
        console.log(`[${connectionId}] Received text: ${txt}`);
        conn.sendText(txt.toUpperCase());
    });

    conn.on('close', (code, reason) => {
        console.log(`[${connectionId}] Connection closed`);
    });
}).listen(8001);

console.log('Listening on port 8001');
