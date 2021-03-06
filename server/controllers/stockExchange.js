const bull = require('bull');
// const request = require('request');
const axios = require('axios');
const redisConfig = require('../../config/redis.config');

const User = require('../models/User');
const Batch = require('../models/Batch');
const UserBatch = require('../models/UserBatch');
const UserStock = require('../models/UserStock');

const buyQueue = new bull('buy queue', process.env.REDIS_URL);
const sellQueue = new bull('sell queue', process.env.REDIS_URL);

/**
 * @api {post} /stock/buy/one Buy stock at one time.
 * @apiName BuyOne
 * @apiGroup Stock Exchange
 *
 * @apiParam {String} username  Username.
 * @apiParam {String} symbol    Stock symbol.
 * @apiParam {String} quantity  Quantity of purchase.

 * @apiParamExample {json} Request-Example:
 *   {
 *       "username": "abc",
 *       "symbol": "APPL",
 *       "quantity": 50,
 *   }
 *
 * @apiSuccess {Boolean} success        Success or not.
 * @apiSuccess {String} message         Message.
 * @apiSuccess {Object} data            
 * @apiSuccess {String} data.jobID      Queue Job id.
 * @apiSuccessExample {json} Success-Response:
 *   HTTP/1.1 200 OK
 *   {
 *       "success": true,
 *       "message": "Your purchase has been placed.",
 *       "data": {
 *          "jobID": "1"
 *       }
 *   }
 */
const Buy = async (ctx) => {
    result = {
        success: false,
        message: '',
        data: null
    };
    await buyQueue.add({
        username: ctx.request.body.username,
        symbol: ctx.request.body.symbol,
        quantity: ctx.request.body.quantity,
        add_time: Date.now()
    }, { lifo: true }).then(job => {
        result.data = {
            jobID: job.id
        };
        result.success = true;
        result.message = 'Your purchase has been placed.';
        console.log('Add buy job to queue.');
    }).catch(err => {
        ctx.body = err;
    });
    ctx.body = result;
};

/**
 * @api {post} /stock/sell/one Sell stock at one time.
 * @apiName SellOne
 * @apiGroup Stock Exchange
 *
 * @apiParam {String} username  Username.
 * @apiParam {String} symbol    Stock symbol.
 * @apiParam {String} quantity  Quantity of purchase.

 * @apiParamExample {json} Request-Example:
 *   {
 *       "username": "abc",
 *       "symbol": "APPL",
 *       "quantity": 50,
 *   }
 *
 * @apiSuccess {Boolean} success        Success or not.
 * @apiSuccess {String} message         Message.
 * @apiSuccess {Object} data            
 * @apiSuccess {String} data.jobID      Queue Job id.
 * @apiSuccessExample {json} Success-Response:
 *   HTTP/1.1 200 OK
 *   {
 *       "success": true,
 *       "message": "Your selling has been placed.",
 *       "data": {
 *          "jobID": "2"
 *       }
 *   }
 */
const Sell = async (ctx) => {
    result = {
        success: false,
        message: '',
        data: null
    };
    await sellQueue.add({
        username: ctx.request.body.username,
        symbol: ctx.request.body.symbol,
        quantity: ctx.request.body.quantity,
        add_time: Date.now()
    }, { lifo: true }).then(job => {
        result.data = {
            jobID: job.id
        };
        result.success = true;
        result.message = 'Your selling has been placed.'
        console.log('Add sell job to queue.');
    });
    ctx.body = result;
};

/**
 * @api {post} /stock/buy/recur Buy stock recursively.
 * @apiName BuyRecur
 * @apiGroup Stock Exchange
 *
 * @apiParam {String} username  Username.
 * @apiParam {String} symbol    Stock symbol.
 * @apiParam {String} quantity  Quantity of purchase.
 * @apiParam {Object} recur
 * @apiParam {Integer} recur.every  Fequence of purchase(ms).
 * @apiParam {Integer} recur.limit  Total times of purchase(ms).
 * @apiParamExample {json} Request-Example:
 *   {
 *       "username": "abc",
 *       "symbol": "APPL",
 *       "quantity": 50,
 *       "recur": {
 *          "every": 6000000,
 *          "limit": 100
 *       }
 *   }
 *
 * @apiSuccess {Boolean} success        Success or not.
 * @apiSuccess {String} message         Message.
 * @apiSuccess {Object} data            
 * @apiSuccess {String} data.jobID      Queue Job id.
 * @apiSuccessExample {json} Success-Response:
 *   HTTP/1.1 200 OK
 *   {
 *       "success": true,
 *       "message": "Your purchase has been placed.",
 *       "data": {
 *          "jobID": "3"
 *       }
 *   }
 */
const BuyRecur = async (ctx) => {
    result = {
        success: false,
        message: '',
        data: null
    };
    let every = ctx.request.body.every;
    let limit = ctx.request.body.limit;
    await buyQueue.add({
        username: ctx.request.body.username,
        symbol: ctx.request.body.symbol,
        quantity: ctx.request.body.quantity,
        add_time: Date.now()
    }, {
        repeat: {
            every: every,
            limit: limit
        }
    }).then(job => {
        result.data = {
            jobID: job.id
        };
        result.success = true;
        result.message = 'Your purchase has been placed.'
        console.log('Add buy job to queue.');
    });
    ctx.body = result;
};

/**
 * @api {post} /stock/sell/recur Sell stock recursively.
 * @apiName SellRecur
 * @apiGroup Stock Exchange
 *
 * @apiParam {String} username  Username.
 * @apiParam {String} symbol    Stock symbol.
 * @apiParam {String} quantity  Quantity of purchase.
 * @apiParam {Object} recur
 * @apiParam {Integer} recur.every  Fequence of purchase(ms).
 * @apiParam {Integer} recur.limit  Total times of purchase(ms).
 * @apiParamExample {json} Request-Example:
 *   {
 *       "username": "abc",
 *       "symbol": "APPL",
 *       "quantity": 50,
 *       "recur": {
 *          "every": 6000000,
 *          "limit": 100
 *       }
 *   }
 *
 * @apiSuccess {Boolean} success        Success or not.
 * @apiSuccess {String} message         Message.
 * @apiSuccess {Object} data            
 * @apiSuccess {String} data.jobID      Queue Job id.
 * @apiSuccessExample {json} Success-Response:
 *   HTTP/1.1 200 OK
 *   {
 *       "success": true,
 *       "message": "Your selling has been placed.",
 *       "data": {
 *          "jobID": "4"
 *       }
 *   }
 */
const SellRecur = async (ctx) => {
    result = {
        success: false,
        message: '',
        data: null
    };
    let every = ctx.request.body.every;
    let limit = ctx.request.body.limit;
    await sellQueue.add({
        username: ctx.request.body.username,
        symbol: ctx.request.body.symbol,
        quantity: ctx.request.body.quantity,
        add_time: Date.now()
    }, {
        repeat: {
            every: every,
            limit: limit
        }
    }).then(job => {
        result.data = {
            jobID: job.id
        };
        result.success = true;
        result.message = 'Your selling has been placed.'
        console.log('Add sell job to queue.');
    });
    ctx.body = result;
};

/**
 * @api {post} /stock/schedule/update Update schedule in queue.
 * @apiName UpdateSchedule
 * @apiGroup Stock Exchange
 *
 * @apiParam {String} username  Username.
 * @apiParam {String} symbol    Stock symbol.
 * @apiParam {String} quantity  Quantity of purchase.
 * @apiParam {String} jobID     Original job ID.
 * @apiParam {Object} recur     New recur info.
 * @apiParam {Integer} recur.every  Fequence of purchase(ms).
 * @apiParam {Integer} recur.limit  Total times of purchase(ms).
 * @apiParam {String} behavior  Sell or buy.
 * @apiParamExample {json} Request-Example:
 *   {
 *       "username": "abc",
 *       "symbol": "APPL",
 *       "quantity": 50,
 *       "jobID": "3",
 *       "behavior": "buy"
 *       "recur": {
 *          "every": 6000000,
 *          "limit": 100
 *       }
 *   }
 *
 * @apiSuccess {Boolean} success        Success or not.
 * @apiSuccess {String} message         Message.
 * @apiSuccessExample {json} Success-Response:
 *   HTTP/1.1 200 OK
 *   {
 *       "success": true,
 *       "message": "Update schedule successfully.",
 *   }
 */
const UpdateSchedule = async (ctx) => {
    result = {
        success: false,
        message: ''
    };
    // let newRecur = ctx.request.body.recur;
    let newEvery = ctx.request.body.every;
    let newLimit = ctx.request.body.limit;
    let jobID = ctx.request.body.jobID;
    let behavior = ctx.request.body.behavior;
    let job = null;
    if (behavior === 'buy') {
        job = buyQueue.getJob(jobID);
    } else if (behavior === 'sell') {
        job = sellQueue.getJob(jobID);
    } else {
        result.message = 'Wrong behavior!';
        ctx.body = result;
        return result;
    }
    await job.update({
        username: ctx.request.body.username,
        symbol: ctx.request.body.symbol,
        quantity: ctx.request.body.quantity,
        add_time: Date.now()
    }, {
        repeat: {
            every: newEvery,
            limit: newLimit
        }
    });
    result.success = true;
    result.message = 'Update schedule successfully.';
    ctx.body = result;
};

/**
 * @api {post} /stock/schedule/cancel Cancel schedule in queue.
 * @apiName CancelSchedule
 * @apiGroup Stock Exchange
 *
 * @apiParam {String} username  Username.
 * @apiParam {String} jobID     Original job ID.
 * @apiParam {String} behavior  Sell or buy.
 * @apiParamExample {json} Request-Example:
 *   {
 *       "username": "abc",
 *       "jobID": "3",
 *       "behavior": "buy"
 *   }
 *
 * @apiSuccess {Boolean} success        Success or not.
 * @apiSuccess {String} message         Message.
 * @apiSuccessExample {json} Success-Response:
 *   HTTP/1.1 200 OK
 *   {
 *       "success": true,
 *       "message": "Cancel schedule successfully.",
 *   }
 */
const CancelSchedule = async (ctx) => {
    result = {
        success: false,
        message: ''
    };
    let jobID = ctx.request.body.jobID;
    let behavior = ctx.request.body.behavior;
    let job = null;
    if (behavior === 'buy') {
        job = buyQueue.getJob(jobID);
    } else if (behavior === 'sell') {
        job = sellQueue.getJob(jobID);
    } else {
        result.message = 'Wrong behavior!';
        ctx.body = result;
        return result;
    }
    await job.remove();
    result.success = true;
    result.message = 'Cancel schedule successfully.';
    ctx.body = result;
};

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

buyQueue.process(async (job) => {
    await sleep(30000);
    post = {
        username: job.data.username,
        symbol: job.data.symbol,
        quantity: job.data.quantity,
        add_time: job.data.add_time
    }
    result = await buyStock(post)
    console.log(result);
    return result;
});

sellQueue.process(async (job) => {
    await sleep(30000);
    post = {
        username: job.data.username,
        symbol: job.data.symbol,
        quantity: job.data.quantity,
        add_time: job.data.add_time
    }
    retsult = await sellStock(post);
    console.log(result);
    return result;
});

async function getStockPrice(symbol) {
    let result = null;
    let url = 'https://silvermont-stock-service.herokuapp.com';
    let path = '/stock/v1/current';
    console.log(url + path, symbol);
    await axios.get(url + path, {
        params: {
            symbol: symbol
        }
    }).then(function (response) {
        result = Number(response.data.price);
        console.log(result);
        return result;
    }).catch(function (error) {
        return error;
    });
    return result;
};

async function buyStock(post) {
    let result = {
        success: false,
        message: '',
        data: null
    };
    let price = await getStockPrice(post.symbol);
    let quantity = Number(post.quantity)
    let totalPrice = price * quantity;
    await User.findOne({
        where: {
            username: post.username
        }
    }).then(async (user) => {
        if (!user) {
            result.message = 'No such user.';
            console.log(result);
            return result;
        } else if (user.token === null) {
            result.message = 'Please Login.';
            console.log(result);
            return result;
        } else if (user.balance < totalPrice) {
            result.message = 'Insufficient balance, please deposit.';
            console.log(result);
            return result;
        } else {
            user.balance -= totalPrice;
            await user.save();
            await Batch.create({
                bought_time: post.add_time,
                quantity: quantity,
                symbol: post.symbol
            }).then(async (batch) => {
                let batch_id = batch.dataValues.batch_id;
                await UserBatch.create({
                    username: post.username,
                    batch_id: batch_id,
                }).catch(err => {
                    return err;
                });
            }).catch(err => {
                return err;
            });
            await UserStock.findOne({
                where: {
                    username: post.username,
                    symbol: post.symbol
                }
            }).then(async (userStock) => {
                if (!userStock) {
                    await UserStock.create({
                        username: post.username,
                        symbol: post.symbol,
                        quantity: quantity
                    }).catch(err => {
                        return err;
                    });
                } else {
                    userStock.quantity += quantity;
                    await userStock.save();
                }
            }).catch(err => {
                return err;
            });
            result.success = true;
            result.message = 'Buy stocks successfully.';
            result.data = {
                username: post.username,
                symbol: post.symbol,
                quantity: quantity,
                price: price
            };
            console.log(result);
        }
    }).catch(err => {
        return err;
    });
    return result;
};

async function sellStock(post) {
    let result = {
        success: false,
        message: '',
        data: null
    };
    let price = await getStockPrice(post.symbol);
    let quantity = Number(post.quantity)
    let totalPrice = price * quantity;
    await User.findOne({
        where: {
            username: post.username
        }
    }).then(async (user) => {
        if (!user) {
            result.message = 'No such user.';
            console.log(result);
            return result;
        } else if (user.token === null) {
            result.message = 'Please Login.';
            console.log(result);
            return result;
        } else {
            await UserStock.findOne({
                where: {
                    username: post.username,
                    symbol: post.symbol
                }
            }).then(async (userStock) => {
                if (!userStock) {
                    result.message = 'User does not have this stock.';
                    console.log(result);
                    return result;
                } else if (userStock.quantity < quantity) {
                    result.message = 'Insufficient stocks.';
                    console.log(result);
                    return result;
                } else {
                    user.balance += totalPrice;
                    await user.save();
                    await Batch.create({
                        bought_time: post.add_time,
                        quantity: post.quantity
                    }).then(async (batch) => {
                        let batch_id = batch.dataValues.batch_id;
                        await UserBatch.create({
                            username: post.username,
                            batch_id: batch_id
                        }).catch(err => {
                            return err;
                        });
                    }).catch(err => {
                        return err;
                    });
                    userStock.quantity -= quantity;
                    await userStock.save();
                    result.success = true;
                    result.message = 'Sell stocks successfully.';
                    result.data = {
                        username: post.username,
                        symbol: post.symbol,
                        quantity: quantity,
                        price: price
                    };
                    console.log(result);
                }
            }).catch(err => {
                return err;
            });
        }
    }).catch(err => {
        return err;
    });
    return result;
};

module.exports = (router) => {
    router.post('/buy/one', Buy);
    router.post('/sell/one', Sell);
    router.post('/buy/recur', BuyRecur);
    router.post('/sell/recur', SellRecur);
    router.post('/schedule/update', UpdateSchedule);
    router.post('/schedule/cancel', CancelSchedule);
};
