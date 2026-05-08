import https from 'https';

const url = 'https://mt-managwemnet.vercel.app/';

https.get(url, (res) => {
  console.log('Status Code:', res.statusCode);
  console.log('Headers:', JSON.stringify(res.headers, null, 2));
}).on('error', (e) => {
  console.error('Error:', e);
});
