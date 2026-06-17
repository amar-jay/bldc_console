const { SerialPort } = require('serialport');
const cbor = require('cbor');

const PORT = '/dev/ttyACM0';   // change if needed
const BAUD = 115200;

const port = new SerialPort({
    path: PORT,
    baudRate: BAUD
});

let buffer = Buffer.alloc(0);

// IMPORTANT: USB CDC is a stream → we must re-frame CBOR messages
//
port.on('data', (chunk) => {
    buffer = Buffer.concat([buffer, chunk]);

    try {
        const value = cbor.decodeFirstSync(buffer);
        console.log(value);

        buffer = Buffer.alloc(0); // reset after success
    } catch (e) {
        // wait for more data
    }
});

port.on('open', () => {
    console.log("✅ USB serial open on", PORT);
});

port.on('error', (err) => {
    console.error("❌ Serial error:", err.message);
});
