import request from 'request';
import cheerio from 'cheerio';
import Ticker from './../../models/ticker';

//list is get from AssetPairs
const ALL_CURRENCY_PAIRS_LIST = [
    "BCHEUR", "BCHUSD", "BCHXBT", "DASHEUR", "DASHUSD", "DASHXBT", "EOSETH", "EOSXBT", "GNOETH", "GNOXBT",
    "USDTZUSD", "XETCXETH", "XETCXXBT", "XETCZEUR", "XETCZUSD", "XETHXXBT", "XETHXXBT.d", "XETHZCAD",
    "XETHZCAD.d", "XETHZEUR", "XETHZEUR.d", "XETHZGBP", "XETHZGBP.d", "XETHZJPY", "XETHZJPY.d", "XETHZUSD",
    "XETHZUSD.d", "XICNXETH", "XICNXXBT", "XLTCXXBT", "XLTCZEUR", "XLTCZUSD", "XMLNXETH", "XMLNXXBT", "XREPXETH",
    "XREPXXBT", "XREPZEUR", "XXBTZCAD", "XXBTZCAD.d", "XXBTZEUR", "XXBTZEUR.d", "XXBTZGBP", "XXBTZGBP.d",
    "XXBTZJPY", "XXBTZJPY.d", "XXBTZUSD", "XXBTZUSD.d", "XXDGXXBT", "XXLMXXBT", "XXMRXXBT", "XXMRZEUR",
    "XXMRZUSD", "XXRPXXBT", "XXRPZEUR", "XXRPZUSD", "XZECXXBT", "XZECZEUR", "XZECZUSD"
];

const CURRENCY_PAIRS_FOR_LOAD = {
    //load USD as well?
    DASHEUR: { source: 'DASH', destination: 'EUR' },
    XXBTZEUR: { source: 'XBT', destination: 'EUR' },
    BCHEUR: { source: 'BCH', destination: 'EUR' },
    XZECZEUR: { source: 'ZEC', destination: 'EUR' },
    XZECXXBT: { source: 'ZEC', destination: 'XBT' },
    XETCZEUR: { source: 'ETC', destination: 'EUR' },
    XETHZEUR: { source: 'ETH', destination: 'EUR' }
};

const TICKER_API_URL = 'https://api.kraken.com/0/public/Ticker?pair=';
const SERVER_TIME_API_URL = 'https://api.kraken.com/0/public/Time';


//responses are:
// {error: [], result: [] | {}}
//max API pending calls: 15
//time to reacharge 1 API call: 3 seconds


//1. Get server time to sync with ours:
// https://api.kraken.com/0/public/Time
// {unixtime:  as unix timestamp, rfc1123 = as RFC 1123 time format}

//2. Get ticker info - one of the needed:



//TODO: MAKE REQUEST:

class KrakenReader {
    constructor(dataService) {
        this._dataService = dataService;

        this._readServerTime();
    }

    _readServerTime() {
        const requestUrl = SERVER_TIME_API_URL;

        request(requestUrl, (error, response, html) => {
            if (!error) {
                let responseBody;
                try {
                    responseBody = JSON.parse(response.body);
                } catch(e) {
                    console.log('>>> KRAKEN SERVER DOWN. NO VALID JSON RESPONSE.');
                    return;
                }

                if (responseBody.error.length > 0) {
                    console.log('>>> KRAKEN SERVER TIME API READ ERROR', responseBody.error);
                    return;
                } else {
                    this._serverTime = new Date(responseBody.result.rfc1123).getTime();
                    this._serverTimeTimeStamp = new Date().getTime();
                }
            } else {
                console.log('>>> KRAKEN SERVER TIME API READ ERROR', error);
            }
        });
    }

    _readTickerInfo() {
        const requestUrl = TICKER_API_URL + Object.keys(CURRENCY_PAIRS_FOR_LOAD).join(',');

        if (!this._serverTime) {
            console.log('>>> KRAKEN SERVER TIME NOT LOADED. ABORTING READ.');
            return;
        }

        const timeStamp = this._serverTime + (new Date().getTime() - this._serverTimeTimeStamp);
        request(requestUrl, (error, response, html) => {
            if (!error) {
                let responseBody;
                try {
                    responseBody = JSON.parse(response.body);
                } catch(e) {
                    console.log('>>> KRAKEN SERVER DOWN. NO VALID JSON RESPONSE.');
                    return;
                }

                if (responseBody.error.length > 0) {
                    console.log('>>> KRAKEN TICKER API READ ERROR', responseBody.error);
                    return;
                } else {
                    const result = Object.keys(responseBody.result).map((pairName) => {
                        const pairInfo = responseBody.result[pairName];

                        console.log('>>> Pair info available: ', !!pairInfo);

                        const currentTicker = new Ticker({
                            pairName: pairName,
                            sourceCurrency: CURRENCY_PAIRS_FOR_LOAD[pairName].source,
                            destinationCurrency: CURRENCY_PAIRS_FOR_LOAD[pairName].destination,
                            timestamp: timeStamp,
                            exchange: 'KRAKEN',

                            askPrice: pairInfo.a[0],
                            askWholeLotVolume: pairInfo.a[1],
                            askLotVolume: pairInfo.a[2],

                            bidPrice: pairInfo.b[0],
                            bidWholeLotVolume: pairInfo.b[1],
                            bidLotVolume: pairInfo.b[2],

                            lastClosedTradePrice: pairInfo.c[0],
                            lastClosedTradeLotVolume: pairInfo.c[1],

                            volumeToday: pairInfo.v[0],
                            volume24h: pairInfo.v[1],

                            volumeWeightedAvaragePriceToday: pairInfo.p[0],
                            volumeWeightedAvaragePrice24h: pairInfo.p[1],

                            numberOfTradesToday: pairInfo.t[0],
                            numberOfTrades24h: pairInfo.t[1],

                            lowToday: pairInfo.l[0],
                            low24h: pairInfo.l[1],

                            highToday: pairInfo.h[0],
                            high24h: pairInfo.h[1],

                            todayOpeningPrice: pairInfo.o
                        });

                        this._dataService
                            .insert('ticker', currentTicker.getProps());

                        console.log('New ticker is saved: ', new Date(), ' ', currentTicker.getProp('pairName'), ' ', currentTicker.getProp('exchange'));
                    });
                }
            } else {
                console.log('>>> KRAKEN TICKER API READ ERROR', error);
            }
        });
    }

    read() {
        this._readTickerInfo();
    }
}

export default KrakenReader;



//example result:
// {
//     "error": [],
//     "result": {
//         "BCHEUR": {
//             "a": ["264.700000", "1", "1.000"],
//             "b": ["263.000000", "19", "19.000"],
//             "c": ["263.000000", "0.10500000"],
//             "v": ["1128.59805361", "3826.30076688"],
//             "p": ["265.168459", "266.950947"],
//             "t": [580, 1963],
//             "l": ["261.700000", "261.700000"],
//             "h": ["270.100000", "273.000000"],
//             "o": "269.100000"
//         }
//     }
// }

//3. asset list
//https://api.kraken.com/0/public/Assets
//{"error":[],"result":{"BCH":{"aclass":"currency","altname":"BCH","decimals":10,"display_decimals":5}

//4. Get list of tradable currency pairs:
//https://api.kraken.com/0/public/AssetPairs
// {
//     "error": [],
//     "result": {
//         "BCHEUR": {
//             "altname": "BCHEUR",
//             "aclass_base": "currency",
//             "base": "BCH",
//             "aclass_quote": "currency",
//             "quote": "ZEUR",
//             "lot": "unit",
//             "pair_decimals": 1,
//             "lot_decimals": 8,
//             "lot_multiplier": 1,
//             "leverage_buy": [],
//             "leverage_sell": [],
//             "fees": [
//                 //...
//             ],
//             "fees_maker": [
//                 //....
//             ],
//             "fee_volume_currency": "ZUSD",
//             "margin_call": 80,
//             "margin_stop": 40
//         }
//     }
// }