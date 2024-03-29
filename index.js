const request = require("request")

const Koa = require('koa')
const route = require('koa-route');

const MemoryStream = require('memorystream');
var feedparser = require('feedparser-promised');
const {
    resolve
} = require('path');

const app = new Koa()

const acg_rss_url = 'https://acg.rip/.xml?term='
const dmhy_rss_url = 'https://share.dmhy.org/topics/rss/rss.xml?keyword='
const mikan_rss_url = 'https://mikanani.me/RSS/MyBangumi?token='

function getBody(url) {
    return new Promise((resolve, reject) => {
        let stream = new MemoryStream();
        request.gzip = true;
        request.get(url)
            .on('close', () => {
                console.log("close");
                resolve(stream);
            })
            .on("error", e => {
                console.error(e);
                reject(e);
            })
            .pipe(stream)
    })
}


const main = ctx => {
    ctx.response.body = 'Hello World '
};
// const test = async ctx => {
//     ctx.response.type = 'text/html';
//     ctx.response.body = await getBody('https://www.google.com');
// }

async function proxy(ctx, base_url, keyword) {
    let key = keyword ?? ctx.request.query.key;
    console.log('key= ' + key)
    try {
        ctx.response.type = 'application/xml; charset=utf-8';
        ctx.response.body = await getBody(base_url + encodeURI(key));
    } catch (error) {
        ctx.response.code = 503;
        ctx.response.type = 'text/html';
        ctx.response.body = error.message;
    }

}

app.use(route.get('/', main));
// app.use(route.get('/search', async ctx => {
//     let key = ctx.request.query.key;
//     let type = ctx.request.query.type;
//     let items = [];
//     let uri;
//     let url = "";
//     switch (type) {
//         case 'dmhy':
//             uri = dmhy_rss_url + key;
//             url = `/dmhy?key=${key}`;
//             break;
//         case 'acg':
//             uri = acg_rss_url + key;
//             url = `/acg?key=${key}`;
//             break;
//         default:
//             break;
//     }
//     if (key && type) {
//         key = key.replace(' ', '+')
//         const httpOptions = {
//             uri: uri,
//             timeout: 3000,
//             gzip: true,
//         };
//         items = await feedparser.parse(httpOptions);
//     }

//     await ctx.render('test', {
//         'key': key,
//         'url': url,
//         'items': items
//     }, true)
// }));
app.use(route.get('/acg', async ctx => proxy(ctx, acg_rss_url)));
app.use(route.get('/dmhy', async ctx => proxy(ctx, dmhy_rss_url)));
app.use(route.get('/mikan/:token', async (ctx, token) => proxy(ctx, mikan_rss_url, token)));


app.listen(3000);