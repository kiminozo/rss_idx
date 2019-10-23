const https = require("https")
const Koa = require('koa')
const route = require('koa-route');

const app = new Koa()

const acg_rss_url = 'https://acg.rip/.xml?term='
const dmhy_rss_url = 'https://share.dmhy.org/topics/rss/rss.xml?keyword='
// https.get(test_rss, res => {
//     console.log(`Got response: ${res.statusCode}`);
//     let html = ""

//     res.on("data", (data) => {
//         html += data
//     })

//     res.on("end", () => {
//         console.log(html)
//     })
// })

function getRss(url) {
    return new Promise((resolve, reject) => {
        https.get(url, res => {
            console.log(`Got response: ${res.statusCode}`);
            let html = ""

            res.on("data", (data) => {
                html += data
            })

            res.on("end", () => {
                resolve(html);
                //console.log(html)
            })
        }).on("error", e => {
            console.error(e);
            reject(e);
        })
    })

}


const main = ctx => {
    ctx.response.body = 'Hello World '
};
const test = ctx => {
    let key = ctx.request.query.key;
    ctx.response.body = 'key= ' + key;
};

async function proxy(ctx, base_url) {
    let key = ctx.request.query.key;
    console.log('key= ' + key)
    try {
        ctx.response.body = await getRss(dmhy_rss_url + key);
        ctx.response.type = 'application/xml; charset=utf-8';
    } catch (error) {
        ctx.response.code = 504;
        ctx.response.body = error.stack;
    }

}

app.use(route.get('/', main));
app.use(route.get('/test', test));
app.use(route.get('/acg', async ctx => proxy(ctx, acg_rss_url)));
app.use(route.get('/dmhy', async ctx => proxy(ctx, dmhy_rss_url)));


app.listen(3000);
console.log("service start http://localhost:3000/")