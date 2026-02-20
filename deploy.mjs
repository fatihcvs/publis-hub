import { Client } from 'ssh2';
import fs from 'fs';
import path from 'path';

const password = '8125578aAA';
const LOCAL_DIST = './dist';
const REMOTE_BASE = '/var/www/publis-hub';

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

function getSftp(conn) {
  return new Promise((resolve, reject) => conn.sftp((e, sftp) => e ? reject(e) : resolve(sftp)));
}

async function uploadFile(sftp, localFile, remoteFile) {
  return new Promise((resolve, reject) => {
    const ws = sftp.createWriteStream(remoteFile);
    const rs = fs.createReadStream(localFile);
    ws.on('close', resolve);
    ws.on('error', reject);
    rs.on('error', reject);
    rs.pipe(ws);
  });
}

async function uploadDir(sftp, conn, localDir, remoteDir) {
  await exec(conn, `mkdir -p "${remoteDir}"`);
  const entries = fs.readdirSync(localDir, { withFileTypes: true });
  for (const entry of entries) {
    const localPath = path.join(localDir, entry.name);
    const remotePath = `${remoteDir}/${entry.name}`;
    if (entry.isDirectory()) {
      await uploadDir(sftp, conn, localPath, remotePath);
    } else {
      process.stdout.write(`  → ${entry.name}\n`);
      await uploadFile(sftp, localPath, remotePath);
    }
  }
}

(async () => {
  try {
    console.log('🔗 Sunucuya bağlanılıyor...');
    const conn = await sshConnect();
    console.log('✅ Bağlantı kuruldu.\n');

    const sftp = await getSftp(conn);

    // Create dist directory
    await exec(conn, `mkdir -p ${REMOTE_BASE}/dist/public`);

    // Upload client
    console.log('📤 Client build (Layout fix) yükleniyor...');
    await uploadDir(sftp, conn, path.join(LOCAL_DIST, 'public'), `${REMOTE_BASE}/dist/public`);
    console.log('✅ Client tamamlandı.\n');

    // Restart PM2
    console.log('🔄 PM2 yeniden başlatılıyor...');
    await exec(conn, 'source /root/.nvm/nvm.sh 2>/dev/null; pm2 restart publis-hub');

    conn.end();
    console.log('\n✅ DEPLOY TAMAMLANDI!');
  } catch (err) {
    console.error('❌ Hata:', err.message);
  }
})();
