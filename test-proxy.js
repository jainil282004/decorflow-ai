const http = require('http');

const data = JSON.stringify({
  email: 'ruturaj@decorflow.com',
  password: 'Ruturaj@123',
});

const req = http.request(
  {
    hostname: 'localhost',
    port: 5173,
    path: '/api/v1/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': data.length },
  },
  (res) => {
    let responseData = '';
    res.on('data', (d) => {
      responseData += d;
    });
    res.on('end', () => {
      console.log(`[${res.statusCode}] Proxy Login:`, responseData);
    });
  }
);

req.on('error', (e) => console.error(e));
req.write(data);
req.end();
