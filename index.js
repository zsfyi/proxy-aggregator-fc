const axios = require('axios');
axios.defaults.timeout = 3000;

const URLS = (process.env.URL || '')
    .split('|')
    .filter((item) => item.length > 0);
const TOKENS = Object.assign(
    {},
    ...(process.env.TOKEN || '')
        .split('|')
        .filter((item) => item.length > 0)
        .filter((item) => item.indexOf('=') !== -1)
        .map((item) => item.split('='))
        .map((item) => ({ [item[1]]: item[0] }))
);

const TESTSUBSCRIBE = 'dm1lc3M6Ly9ldzBLSUNBaWRpSTZJQ0l5SWl3TkNpQWdJbkJ6SWpvZ0l1YTFpK2l2bFNJc0RRb2dJQ0poWkdRaU9pQWlNVEkzTGpBdU1DNHhJaXdOQ2lBZ0luQnZjblFpT2lBaU1USXpORFVpTEEwS0lDQWlhV1FpT2lBaU16QXdaRGN6T1RZdE1tUXlPQzAwWmpKaUxUaG1PV1l0TXpjMU5UQTVZbVZpTVROaElpd05DaUFnSW1GcFpDSTZJQ0l3SWl3TkNpQWdJbk5qZVNJNklDSmhkWFJ2SWl3TkNpQWdJbTVsZENJNklDSjBZM0FpTEEwS0lDQWlkSGx3WlNJNklDSnViMjVsSWl3TkNpQWdJbWh2YzNRaU9pQWlJaXdOQ2lBZ0luQmhkR2dpT2lBaUlpd05DaUFnSW5Sc2N5STZJQ0lpTEEwS0lDQWljMjVwSWpvZ0lpSU5DbjA9DQo='

const fromBase64 = (s) => Buffer.from(s, 'base64').toString();
const toBase64 = (s) => Buffer.from(s).toString('base64');

const removePrefix = (s, p) => s.startsWith(p) ? s.slice(p.length) : s;

const get = (url, resolve, reject) =>
    axios
        .get(url)
        .then((resp) => resp.data)
        .then(resolve)
        .catch(reject);

async function getData() {
    try {
        return toBase64(
            (
                await Promise.all(
                    URLS.map(
                        (url) => new Promise((resolve, reject) => get(url, resolve, reject))
                    )
                )
            )
                .map((encoded) =>
                    fromBase64(encoded)
                        .split('\n')
                        .filter((line) => line.length > 0)
                )
                .reduce((pre, cur) => pre.concat(cur))
                .join('\n')
        );
    } catch (e) {
        return e.toString();
    }
}

exports.handler = async (req, resp, context) => {
    console.log(req.path);
    if (removePrefix(req.path, "/subscribe") === '/test') {
        console.log(req.clientIP);
        resp.send(TESTSUBSCRIBE);
        return;
    }

    const token = req.queries['token'];
    console.log(URLS, TOKENS);
    console.log(req.clientIP, token, TOKENS[token]);
    const res = !!TOKENS[token] ? await getData() : '';
    resp.send(res);
};
