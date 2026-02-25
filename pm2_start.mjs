import { Client } from 'ssh2';

const password = '8125578aAA';

function sshConnect() {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    conn.on('ready', () => resolve(conn));
    conn.on('error', reject);
    conn.on('keyboard-interactive', (n, i, l, p, finish) => finish([password]));
    conn.connect({ host: '45.147.47.162', port: 22, username: 'root', tryKeyboard: true, password, readyTimeout: 15000 });
  });
}

function exec(conn, cmd) {
  cmd = cmd.replace(/\r/g, '');
  return new Promise((resolve, reject) => {
    conn.exec(cmd, (err, stream) => {
      let out = '';
      if (!stream) { return resolve(out); }
      stream.on('close', () => resolve(out));
      stream.on('data', d => { process.stdout.write(d.toString()); });
      stream.stderr.on('data', d => { process.stderr.write(d.toString()); });
    });
  });
}

(async () => {
  try {
    const conn = await sshConnect();

    console.log('=== Checking /root/ contents ===');
    await exec(conn, 'ls -la /root');

    console.log('\\n=== Checking where Nginx 5001 came from ===');
    await exec(conn, 'ls -l --time-style=full-iso /etc/nginx/sites-available/publis-hub');

    conn.end();
  } catch (err) {
    console.error(err);
  }
})();
