import { Client } from 'ssh2';

const password = '8125578aAA';

function sshConnect() {
    return new Promise((resolve, reject) => {
        const conn = new Client();
        conn.on('ready', () => resolve(conn));
        conn.on('error', reject);
        conn.on('keyboard-interactive', (n, i, l, p, finish) => finish([password]));
        conn.connect({ host: '45.147.47.162', port: 22, username: 'root', tryKeyboard: true, password, readyTimeout: 15000, keepaliveInterval: 10000 });
    });
}

function exec(conn, cmd) {
    return new Promise((resolve, reject) => {
        conn.exec(cmd, (err, stream) => {
            if (err) return reject(err);
            let out = '';
            stream.on('close', (code) => resolve({ code, out }));
            stream.on('data', d => { out += d; process.stdout.write(d.toString()); });
            stream.stderr.on('data', d => { out += d; process.stderr.write(d.toString()); });
        });
    });
}

(async () => {
    const conn = await sshConnect();

    console.log('\n=== Testing DELETE via CURL ===');
    // First, simulate auth if possible or just see if it returns 401
    await exec(conn, 'curl -X DELETE -s -i http://localhost:5000/api/admin/sponsors/259c26d6-0874-4f19-ac4f-235af5044ad8');

    conn.end();
})();
