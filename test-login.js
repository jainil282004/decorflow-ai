const http = require('http');

const data = JSON.stringify({
  email: 'ruturaj@decorflow.com',
  password: 'Ruturaj@123',
});

const req = http.request(
  {
    hostname: 'localhost',
    port: 5000,
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
      const json = JSON.parse(responseData);
      if (json.data && json.data.accessToken) {
        const endpoints = [
          '/api/v1/logistics/vehicles',
          '/api/v1/logistics/vehicle-types',
          '/api/v1/logistics/drivers',
          '/api/v1/logistics/trips',
        ];
        endpoints.forEach((path) => {
          http.get(
            {
              hostname: 'localhost',
              port: 5000,
              path,
              headers: { Authorization: `Bearer ${json.data.accessToken}` },
            },
            (r) => {
              let pData = '';
              r.on('data', (d) => {
                pData += d;
              });
              r.on('end', () =>
                console.log(`[${r.statusCode}] ${path} ${r.statusCode === 500 ? pData : ''}`)
              );
            }
          );
        });
      }
    });
  }
);

req.write(data);
req.end();
