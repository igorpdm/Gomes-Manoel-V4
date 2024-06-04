const {parentPort, workerData} = require('worker_threads');
const ytdl = require("@distube/ytdl-core");
const fs = require('fs');
const path = require('path');

const {videoUrl, audioFile} = workerData;
const agent = ytdl.createAgent([

    {
        "domain": ".youtube.com",
        "expirationDate": 1752020161.009172,
        "hostOnly": false,
        "httpOnly": false,
        "name": "__Secure-1PAPISID",
        "path": "/",
        "sameSite": "unspecified",
        "secure": true,
        "session": false,
        "storeId": "0",
        "value": "FeFeJ6wbCyKyFPKp/AclHAVVoAgtgLZHZg",
        "id": 1
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1752020161.009221,
        "hostOnly": false,
        "httpOnly": true,
        "name": "__Secure-1PSID",
        "path": "/",
        "sameSite": "unspecified",
        "secure": true,
        "session": false,
        "storeId": "0",
        "value": "g.a000kQjM6fdvs7AeVAqA0T3qYZuDiikObIyg34VpqJUIroqwV0l6TkpgtS1huG2ZdjF3E11mnQACgYKAeMSAQASFQHGX2Mis3wzhqSmUfclF6jzWfiQRxoVAUF8yKrmTwrXzK03A5fGvc4uUuXJ0076",
        "id": 2
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1748996176.347107,
        "hostOnly": false,
        "httpOnly": true,
        "name": "__Secure-1PSIDCC",
        "path": "/",
        "sameSite": "unspecified",
        "secure": true,
        "session": false,
        "storeId": "0",
        "value": "AKEyXzV2lBvw5sMjl_yJGCShuyHpNe1QRNK2iOYHz4xvUkM9e_sNku1ERuQFMMSy0ErgeozfzQ",
        "id": 3
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1748996161.009014,
        "hostOnly": false,
        "httpOnly": true,
        "name": "__Secure-1PSIDTS",
        "path": "/",
        "sameSite": "unspecified",
        "secure": true,
        "session": false,
        "storeId": "0",
        "value": "sidts-CjIB3EgAEr-JKiK9r5ldpTCCJGjBG1NnXAQWjtatz5AOogEjpon2yG-Jo6QKhf5mATt30hAA",
        "id": 4
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1752020161.009188,
        "hostOnly": false,
        "httpOnly": false,
        "name": "__Secure-3PAPISID",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": true,
        "session": false,
        "storeId": "0",
        "value": "FeFeJ6wbCyKyFPKp/AclHAVVoAgtgLZHZg",
        "id": 5
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1752020161.009238,
        "hostOnly": false,
        "httpOnly": true,
        "name": "__Secure-3PSID",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": true,
        "session": false,
        "storeId": "0",
        "value": "g.a000kQjM6fdvs7AeVAqA0T3qYZuDiikObIyg34VpqJUIroqwV0l6bL5IQZXBBCib-0vXDXr_uwACgYKAbISAQASFQHGX2Mirc5gEiM1mTlTKSvj0cna5BoVAUF8yKo7WY3rJORYD4I3Q3RU-5Fk0076",
        "id": 6
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1748996176.347153,
        "hostOnly": false,
        "httpOnly": true,
        "name": "__Secure-3PSIDCC",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": true,
        "session": false,
        "storeId": "0",
        "value": "AKEyXzXNveOPFZH261SfEn8rD0S_VAqOz5wJNzBzXUjkhCTFXD9bqApL1rVabYI0mCvT45P-xOo",
        "id": 7
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1748996161.009079,
        "hostOnly": false,
        "httpOnly": true,
        "name": "__Secure-3PSIDTS",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": true,
        "session": false,
        "storeId": "0",
        "value": "sidts-CjIB3EgAEr-JKiK9r5ldpTCCJGjBG1NnXAQWjtatz5AOogEjpon2yG-Jo6QKhf5mATt30hAA",
        "id": 8
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1752020161.009138,
        "hostOnly": false,
        "httpOnly": false,
        "name": "APISID",
        "path": "/",
        "sameSite": "unspecified",
        "secure": false,
        "session": false,
        "storeId": "0",
        "value": "gVXPwgv76-hX2LiK/AoTURCDC6RK_j65Q0",
        "id": 9
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1752020161.009103,
        "hostOnly": false,
        "httpOnly": true,
        "name": "HSID",
        "path": "/",
        "sameSite": "unspecified",
        "secure": false,
        "session": false,
        "storeId": "0",
        "value": "AwnTkrzWIKbzM2b0j",
        "id": 10
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1752020161.444733,
        "hostOnly": false,
        "httpOnly": true,
        "name": "LOGIN_INFO",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": true,
        "session": false,
        "storeId": "0",
        "value": "AFmmF2swRAIgTkGGPwSb8hMqeA9PULAvmqMMBGzr3A5Pt6nxwfJplmMCIHMHhn_J1A6xvPGyNkCQ4oDy8ECF_-HjGCqUAc4rNTk5:QUQ3MjNmemZFbFpoUDEwR0F2a0k4MzNITkZBM0kyYmdXeTk1c29yRDZQTmNXeTdCOGdBMUF2Z2dyOTV5WnBrQVFQcXZJaUVHaWhYaVZQb25kZEd0OGlqS1J3cE1LbDNWTnFHZmgxMUpjcVRTSGM5VTBlN2NlT04zNHN2cU1EY3FRUHprYmh6LWhra05qV2NJLVBERzJvaW5lTUotV2thX2V5YVlYTjZPbzZGcjZ5OHRoWEV3cTdfa2VVOHN5ZlRTQWN4NC04UDN1bmVEOTlIdnNMN2tUejloT1F4N2RRQlRQdw==",
        "id": 11
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1752020173.319352,
        "hostOnly": false,
        "httpOnly": false,
        "name": "PREF",
        "path": "/",
        "sameSite": "unspecified",
        "secure": true,
        "session": false,
        "storeId": "0",
        "value": "f6=40000400&f7=100&tz=America.Sao_Paulo&f5=30000",
        "id": 12
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1752020161.009155,
        "hostOnly": false,
        "httpOnly": false,
        "name": "SAPISID",
        "path": "/",
        "sameSite": "unspecified",
        "secure": true,
        "session": false,
        "storeId": "0",
        "value": "FeFeJ6wbCyKyFPKp/AclHAVVoAgtgLZHZg",
        "id": 13
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1752020161.009204,
        "hostOnly": false,
        "httpOnly": false,
        "name": "SID",
        "path": "/",
        "sameSite": "unspecified",
        "secure": false,
        "session": false,
        "storeId": "0",
        "value": "g.a000kQjM6fdvs7AeVAqA0T3qYZuDiikObIyg34VpqJUIroqwV0l6bgRBdadyq_FSIvlkQR-wywACgYKAf0SAQASFQHGX2MiJC3NBiyUgNdzj9czau1JCBoVAUF8yKrIKGChMEUeFm7Wap3OJJw20076",
        "id": 14
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1748996176.346998,
        "hostOnly": false,
        "httpOnly": false,
        "name": "SIDCC",
        "path": "/",
        "sameSite": "unspecified",
        "secure": false,
        "session": false,
        "storeId": "0",
        "value": "AKEyXzU-GNSjBYSsDErbOrHlt50m8EYpFFPdoENPD0mw7ysfx_jiHzAk5wxfGbiKGbF1lqYl",
        "id": 15
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1752020161.009122,
        "hostOnly": false,
        "httpOnly": true,
        "name": "SSID",
        "path": "/",
        "sameSite": "unspecified",
        "secure": true,
        "session": false,
        "storeId": "0",
        "value": "A5OiY2SJ6GlwbJ5a5",
        "id": 16
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1717460181,
        "hostOnly": false,
        "httpOnly": false,
        "name": "ST-xuwub9",
        "path": "/",
        "sameSite": "unspecified",
        "secure": false,
        "session": false,
        "storeId": "0",
        "value": "session_logininfo=AFmmF2swRAIgTkGGPwSb8hMqeA9PULAvmqMMBGzr3A5Pt6nxwfJplmMCIHMHhn_J1A6xvPGyNkCQ4oDy8ECF_-HjGCqUAc4rNTk5%3AQUQ3MjNmemZFbFpoUDEwR0F2a0k4MzNITkZBM0kyYmdXeTk1c29yRDZQTmNXeTdCOGdBMUF2Z2dyOTV5WnBrQVFQcXZJaUVHaWhYaVZQb25kZEd0OGlqS1J3cE1LbDNWTnFHZmgxMUpjcVRTSGM5VTBlN2NlT04zNHN2cU1EY3FRUHprYmh6LWhra05qV2NJLVBERzJvaW5lTUotV2thX2V5YVlYTjZPbzZGcjZ5OHRoWEV3cTdfa2VVOHN5ZlRTQWN4NC04UDN1bmVEOTlIdnNMN2tUejloT1F4N2RRQlRQdw%3D%3D",
        "id": 17
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1733012131.163907,
        "hostOnly": false,
        "httpOnly": true,
        "name": "VISITOR_INFO1_LIVE",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": true,
        "session": false,
        "storeId": "0",
        "value": "xbLBiv-HcwY",
        "id": 18
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1733012131.163941,
        "hostOnly": false,
        "httpOnly": true,
        "name": "VISITOR_PRIVACY_METADATA",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": true,
        "session": false,
        "storeId": "0",
        "value": "CgJCUhIEGgAgNQ%3D%3D",
        "id": 19
    },
    {
        "domain": ".youtube.com",
        "hostOnly": false,
        "httpOnly": true,
        "name": "YSC",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": true,
        "session": true,
        "storeId": "0",
        "value": "o2RE8MB3ldM",
        "id": 20
    }
]);

const filePath = path.join(__dirname, "../musicas", audioFile);
const stream = ytdl(videoUrl, {filter: 'audioonly', agent});

stream.on('error', (error) => {
    parentPort.postMessage({error});
});

stream.pipe(fs.createWriteStream(filePath))
    .on('finish', () => {
        parentPort.postMessage({success: true});
    })
    .on('error', (error) => {
        parentPort.postMessage({error});
    });
