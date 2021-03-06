const Koa = require('koa');
const fs = require('fs');
const stripAnsi = require('strip-ansi');
const router = require('koa-router')();
const koaLogger = require('koa-logger');
const bodyParser = require('koa-bodyparser');
const cors = require('kcors');

const index = require('./server/routers/index');
const user = require('./server/routers/user');
const github = require('./server/routers/github');
const stock = require('./server/routers/stock');
const stockExchange = require('./server/routers/stockExchange');

const app = new Koa();
const logFile = fs.createWriteStream('log.txt', { flags: 'a' });
const logStdout = process.stdout;

app.use(koaLogger((str, args) => {
    logFile.write(stripAnsi(str) + '\n');
    logStdout.write(str + '\n');
}));

app.use(bodyParser());

app.use(cors());

// router.use('/test', index.routes(), index.allowedMethods());
router.use('/user', user.routes(), user.allowedMethods());
router.use('/auth', github.routes(), github.allowedMethods());
router.use('/stock', stock.routes(), stock.allowedMethods());
router.use('/stock', stockExchange.routes(), stockExchange.allowedMethods());
app.use(router.routes()).use(router.allowedMethods());

module.exports = app;

const PORT = process.env.PORT || 80;
app.listen(PORT);
