
const BFX = require('bitfinex-api-node');
const async = require('async');
const _ = require('lodash');
const creds = require('../../api-keys/bitfinex');
const REST_URL = 'https://api.bitfinex.com/';

const bfx = new BFX({
	apiKey: creds.key,
	apiSecret: creds.secret,
	rest: {
	    url: REST_URL,
	},
});

const rest = bfx.rest(2, { transform: true });

console.log('fetching data');

async.parallelLimit({
	balance: function(cb) {
		rest.wallets((err, wallets) => {
			if (!wallets || wallets.length === 0) {
				return cb(err, 0);
			}
			let fundingWallet = _.find(wallets, w => {
				return w.type === 'funding' && w.currency === 'USD';
			});
			cb(err, fundingWallet.balance);
		});
	},
	credits: function(cb) {
		rest.fundingCredits('fUSD', (err, credits) => {

			if (!credits || credits.length === 0) {
				return cb(err, 0);
			}

			let sum = _.sumBy(credits, l => {
				return l.amount;
			});

			cb(err, sum);
		});
	},
	offers: function(cb) {
		rest.fundingOffers('fUSD', (err, offers) => {
			
			if (!offers || offers.length === 0) {
				return cb(err, 0);
			}

			let sum = _.sumBy(offers, o => {
				return o.amount;
			});
			
			cb(err, sum);
		});
	},
	frr: function(cb) {
		rest.ticker('fUSD', (err, ticker) => {
			cb(err, ticker.frr);
		});
	},
},
1,
function(err, results) {
	if (err) {
		return console.error(err);
	}
	results.profit = results.balance - 9838;
	console.log(results);
});
