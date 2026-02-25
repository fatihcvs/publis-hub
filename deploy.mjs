import { Client } from 'ssh2';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const password = '8125578aAA';
const PROJECT_ROOT = 'C:\\Users\\PC\\Desktop\\talatim-hub';
const LOCAL_DIST = path.join(PROJECT_ROOT, 'dist');
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
    console.log(`  Uploading: ${localFile} -> ${remoteFile}`);
    if (!fs.existsSync(localFile)) {
      return reject(new Error(`Local file not found: ${localFile}`));
    }
    const ws = sftp.createWriteStream(remoteFile);
    const rs = fs.createReadStream(localFile);
    ws.on('close', resolve);
    ws.on('error', (e) => reject(new Error(`SFTP write error: ${e.message}`)));
    rs.on('error', (e) => reject(new Error(`Local read error: ${e.message}`)));
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
      console.log(`  → ${entry.name}`);
      await uploadFile(sftp, localPath, remotePath);
    }
  }
}

(async () => {
  try {
    console.log('LOCAL_DIST:', LOCAL_DIST);
    console.log('Local index.cjs exists:', fs.existsSync(path.join(LOCAL_DIST, 'index.cjs')));
    console.log('Local public dir exists:', fs.existsSync(path.join(LOCAL_DIST, 'public')));

    console.log('\n🔗 Bağlanılıyor...');
    const conn = await sshConnect();
    console.log('✅ Bağlandı\n');
    const sftp = await getSftp(conn);

    // 1. Create remote dirs first
    console.log('📁 Remote klasörler oluşturuluyor...');
    await exec(conn, `mkdir -p ${REMOTE_BASE}/dist/public/assets`);
    console.log('✅ Remote klasörler hazır\n');

    // 2. Clean old assets  
    console.log('🧹 Eski dosyalar temizleniyor...');
    await exec(conn, `rm -rf ${REMOTE_BASE}/dist/public/assets/*`);
    console.log('✅ Eski dosyalar silindi\n');

    // 3. Upload server bundle
    console.log('📤 Server bundle yükleniyor...');
    await uploadFile(sftp, path.join(LOCAL_DIST, 'index.cjs'), `${REMOTE_BASE}/dist/index.cjs`);
    console.log('✅ Server OK\n');

    // 4. Upload full client (index.html + assets)
    console.log('📤 Client yükleniyor...');
    await uploadDir(sftp, conn, path.join(LOCAL_DIST, 'public'), `${REMOTE_BASE}/dist/public`);
    console.log('✅ Client OK\n');

    // 5. Restart PM2
    console.log('🔄 PM2 restart...');
    await exec(conn, 'source /root/.nvm/nvm.sh 2>/dev/null; pm2 restart publis-hub');

    // 6. Verify
    console.log('\n=== Doğrulama ===');
    await exec(conn, `ls -la ${REMOTE_BASE}/dist/public/assets/index-*.js`);

    conn.end();
    console.log('\n✅ DEPLOY TAMAMLANDI!');
  } catch (err) {
    console.error('❌ Hata:', err.message);
    console.error(err.stack);
  }
})();
