import { Client } from 'ssh2';
import fs from 'fs';

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

function getSftp(conn) {
    return new Promise((resolve, reject) => conn.sftp((e, sftp) => e ? reject(e) : resolve(sftp)));
}

async function uploadFile(sftp, localFile, remoteFile) {
    return new Promise((resolve, reject) => {
        const ws = sftp.createWriteStream(remoteFile);
        const rs = fs.createReadStream(localFile);
        ws.on('close', resolve);
        ws.on('error', reject);
        rs.pipe(ws);
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
        const sftp = await getSftp(conn);

        console.log('=== Uploading db_dump.sql ===');
        await uploadFile(sftp, 'C:/Users/PC/Desktop/talatim-hub/db_dump.sql', '/root/db_dump.sql');

        console.log('\\n=== Importing to publis_hub ===');
        await exec(conn, 'sudo -u postgres psql -d publis_hub -f /root/db_dump.sql');

        console.log('\\n=== Restarting PM2 to clear hubCache ===');
        await exec(conn, 'pm2 restart publis-hub');

        conn.end();
    } catch (err) {
        console.error(err);
    }
})();
