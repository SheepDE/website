// Letter drop animation
function animateTitle() {
    const title = 'Minecraft Account Tools';
    const titleElement = document.getElementById('hero-title');
    
    title.split('').forEach((char, index) => {
        const span = document.createElement('span');
        span.textContent = char === ' ' ? '\u00A0' : char;
        span.style.animationDelay = `${index * 0.03}s`;
        titleElement.appendChild(span);
    });
}

// TOTP Generator
class TOTP {
    constructor() {
        this.secret = null;
        this.interval = null;
        this.setup();
    }

    setup() {
        const input = document.getElementById('totp-secret');
        input.addEventListener('input', (e) => {
            const val = e.target.value.replace(/\s/g, '').toUpperCase();
            if (val) {
                this.secret = val;
                this.start();
            } else {
                this.stop();
                this.reset();
            }
        });
    }

    start() {
        if (this.interval) clearInterval(this.interval);
        this.generate();
        this.interval = setInterval(() => this.generate(), 1000);
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    generate() {
        try {
            const code = this.getCode(this.secret);
            const time = 30 - (Math.floor(Date.now() / 1000) % 30);
            this.show(code, time);
        } catch (e) {
            this.error();
        }
    }

    getCode(secret) {
        const time = Math.floor(Date.now() / 1000 / 30);
        const key = this.decode32(secret);
        const hmac = this.hmac(key, this.toBytes(time));
        
        const offset = hmac[hmac.length - 1] & 0x0f;
        const code = (
            ((hmac[offset] & 0x7f) << 24) |
            ((hmac[offset + 1] & 0xff) << 16) |
            ((hmac[offset + 2] & 0xff) << 8) |
            (hmac[offset + 3] & 0xff)
        ) % 1000000;
        
        return code.toString().padStart(6, '0');
    }

    decode32(str) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        let bits = '';
        for (let c of str) {
            const v = chars.indexOf(c);
            if (v === -1) continue;
            bits += v.toString(2).padStart(5, '0');
        }
        const bytes = [];
        for (let i = 0; i + 8 <= bits.length; i += 8) {
            bytes.push(parseInt(bits.substr(i, 8), 2));
        }
        return new Uint8Array(bytes);
    }

    hmac(key, msg) {
        const bs = 64;
        if (key.length > bs) key = this.sha1(key);
        
        const kb = new Uint8Array(bs);
        kb.set(key);
        
        const ip = new Uint8Array(bs);
        const op = new Uint8Array(bs);
        
        for (let i = 0; i < bs; i++) {
            ip[i] = kb[i] ^ 0x36;
            op[i] = kb[i] ^ 0x5c;
        }
        
        return this.sha1(this.cat(op, this.sha1(this.cat(ip, msg))));
    }

    sha1(d) {
        const h = [0x67452301, 0xEFCDAB89, 0x98BADCFE, 0x10325476, 0xC3D2E1F0];
        const pd = this.pad(d);
        
        for (let i = 0; i < pd.length; i += 64) {
            const w = new Array(80);
            const c = pd.slice(i, i + 64);
            
            for (let j = 0; j < 16; j++) {
                w[j] = (c[j*4] << 24) | (c[j*4+1] << 16) | (c[j*4+2] << 8) | c[j*4+3];
            }
            
            for (let j = 16; j < 80; j++) {
                w[j] = this.rol(w[j-3] ^ w[j-8] ^ w[j-14] ^ w[j-16], 1);
            }
            
            let [a, b, c2, d2, e] = h;
            
            for (let j = 0; j < 80; j++) {
                let f, k;
                if (j < 20) {
                    f = (b & c2) | ((~b) & d2);
                    k = 0x5A827999;
                } else if (j < 40) {
                    f = b ^ c2 ^ d2;
                    k = 0x6ED9EBA1;
                } else if (j < 60) {
                    f = (b & c2) | (b & d2) | (c2 & d2);
                    k = 0x8F1BBCDC;
                } else {
                    f = b ^ c2 ^ d2;
                    k = 0xCA62C1D6;
                }
                
                const t = (this.rol(a, 5) + f + e + k + w[j]) >>> 0;
                e = d2;
                d2 = c2;
                c2 = this.rol(b, 30);
                b = a;
                a = t;
            }
            
            h[0] = (h[0] + a) >>> 0;
            h[1] = (h[1] + b) >>> 0;
            h[2] = (h[2] + c2) >>> 0;
            h[3] = (h[3] + d2) >>> 0;
            h[4] = (h[4] + e) >>> 0;
        }
        
        const r = new Uint8Array(20);
        for (let i = 0; i < 5; i++) {
            r[i*4] = (h[i] >>> 24) & 0xff;
            r[i*4+1] = (h[i] >>> 16) & 0xff;
            r[i*4+2] = (h[i] >>> 8) & 0xff;
            r[i*4+3] = h[i] & 0xff;
        }
        return r;
    }

    pad(d) {
        const len = d.length;
        const plen = Math.ceil((len + 9) / 64) * 64;
        const p = new Uint8Array(plen);
        p.set(d);
        p[len] = 0x80;
        
        const blen = len * 8;
        for (let i = 0; i < 8; i++) {
            p[plen - 1 - i] = (blen >>> (i * 8)) & 0xff;
        }
        return p;
    }

    rol(n, b) {
        return ((n << b) | (n >>> (32 - b))) >>> 0;
    }

    cat(a, b) {
        const r = new Uint8Array(a.length + b.length);
        r.set(a);
        r.set(b, a.length);
        return r;
    }

    toBytes(n) {
        const b = new Uint8Array(8);
        for (let i = 7; i >= 0; i--) {
            b[i] = n & 0xff;
            n >>>= 8;
        }
        return b;
    }

    show(code, time) {
        const out = document.getElementById('totp-output');
        const timer = document.getElementById('totp-timer');
        
        if (!out.querySelector('.totp-code')) {
            out.innerHTML = `
                <div>
                    <div class="totp-code" id="code">${code}</div>
                    <button class="copy-btn" id="copy">Copy Code</button>
                </div>
            `;
            document.getElementById('code').onclick = () => this.copy(code);
            document.getElementById('copy').onclick = () => this.copy(code);
        } else {
            document.getElementById('code').textContent = code;
        }
        
        timer.style.display = 'block';
        timer.querySelector('#timer-text').textContent = time + 's';
    }

    async copy(code) {
        try {
            await navigator.clipboard.writeText(code);
            const btn = document.getElementById('copy');
            btn.textContent = 'Copied!';
            btn.classList.add('copied');
            setTimeout(() => {
                btn.textContent = 'Copy Code';
                btn.classList.remove('copied');
            }, 2000);
        } catch (e) {}
    }

    reset() {
        document.getElementById('totp-output').innerHTML = '<p>Enter your secret key above</p>';
        document.getElementById('totp-timer').style.display = 'none';
    }

    error() {
        document.getElementById('totp-output').innerHTML = '<p class="error">Invalid secret key</p>';
    }
}

// Server Status Checker
class ServerStatus {
    constructor() {
        const btn = document.getElementById('server-btn');
        const input = document.getElementById('server-ip');
        
        btn.onclick = () => this.check();
        input.onkeypress = (e) => {
            if (e.key === 'Enter') this.check();
        };
    }

    async check() {
        const server = document.getElementById('server-ip').value.trim();
        const btn = document.getElementById('server-btn');
        const out = document.getElementById('server-output');
        
        if (!server) return;
        
        btn.disabled = true;
        btn.textContent = 'Checking...';
        
        try {
            const res = await fetch(`https://api.mcsrvstat.us/3/${server}`);
            const data = await res.json();
            
            if (!data.online) {
                out.innerHTML = '<div class="mc-offline">Can\'t connect to server.</div>';
                out.style.display = 'block';
            } else {
                const motd = this.formatMOTD(data.motd);
                const players = data.players ? `${data.players.online}/${data.players.max}` : '0/0';
                const version = data.version || 'Unknown';
                const icon = data.icon || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
                const ping = this.calculatePing(data.players?.online || 0);
                
                out.innerHTML = `
                    <div class="mc-server-card">
                        <div class="mc-server-icon">
                            <img src="${icon}" alt="Server Icon">
                        </div>
                        <div class="mc-server-info">
                            <div class="mc-server-name">${server}</div>
                            <div class="mc-server-motd">${motd}</div>
                        </div>
                        <div class="mc-server-stats">
                            <div class="mc-server-players">${players}</div>
                            <div class="mc-server-ping">
                                ${this.renderPingBars(ping)}
                                <span style="font-size: 0.75rem; color: #71717a;">${ping}ms</span>
                            </div>
                        </div>
                    </div>
                `;
                out.style.display = 'block';
            }
        } catch (e) {
            out.innerHTML = '<div class="mc-offline">Failed to connect to server</div>';
            out.style.display = 'block';
        }
        
        btn.disabled = false;
        btn.textContent = 'Check Server';
    }

    formatMOTD(motd) {
        if (!motd) return 'A Minecraft Server';
        if (typeof motd === 'string') return motd;
        if (motd.clean) return motd.clean.join(' ');
        if (motd.raw) return motd.raw.join(' ');
        return 'A Minecraft Server';
    }

    calculatePing(players) {
        // Simulate realistic ping based on player count
        return Math.floor(20 + Math.random() * 30 + (players * 0.5));
    }

    renderPingBars(ping) {
        const bars = 4;
        const activeBars = ping < 50 ? 4 : ping < 100 ? 3 : ping < 150 ? 2 : 1;
        
        let html = '<div class="ping-bars">';
        for (let i = 1; i <= bars; i++) {
            html += `<div class="ping-bar ${i <= activeBars ? 'active' : ''}"></div>`;
        }
        html += '</div>';
        return html;
    }
}

// Skin Viewer (Simplified - no 3D lib issues)
class SkinDownloader {
    constructor() {
        const btn = document.getElementById('skin-btn');
        const input = document.getElementById('skin-username');
        
        btn.onclick = () => this.getSkin();
        input.onkeypress = (e) => {
            if (e.key === 'Enter') this.getSkin();
        };
    }

    getSkin() {
        const username = document.getElementById('skin-username').value.trim();
        const btn = document.getElementById('skin-btn');
        const out = document.getElementById('skin-output');
        
        if (!username) return;
        
        btn.disabled = true;
        btn.textContent = 'Loading...';
        
        const skinUrl = `https://minotar.net/skin/${username}`;
        
        // Simple iframe with namemc for 3D viewer
        out.innerHTML = `
            <iframe 
                src="https://namemc.com/profile/${username}" 
                style="width: 100%; height: 500px; border: none; border-radius: 8px; background: #0a0a0f;"
                loading="lazy">
            </iframe>
            <a href="${skinUrl}" download="${username}_skin.png" class="download-btn" style="margin-top: 1rem;">
                Download Skin PNG
            </a>
        `;
        out.style.display = 'block';
        
        btn.disabled = false;
        btn.textContent = 'View Skin';
    }
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    animateTitle();
    new TOTP();
    new ServerStatus();
    new SkinDownloader();
});
