import request from 'request';
import cheerio from 'cheerio';
import Currency from './../models/currency';
import History from './../models/history';

//create request and scrap the site
//write changes to DB ?
const URL = 'https://whattomine.com/calculators';
const CURRENCY_BASE_URL = 'https://whattomine.com';

//DO NOT GO BELOW 250ms, even 500ms is the safe limit
const REQUEST_TIME = 2000;

//remove ones that are hard to mine with GPU
const BLOCKED_CURRENCIES = [
    //Scrypt
    'DOGE', 'LTC', 'XPY', 'DUO', 'ARI', 'NYAN', 'BTM', 'NVC', 'IEC', 'MOON', 'EMC2',
    'WDC', 'SCORE', 'GAME', 'LINX', 'PINK', 'MEC', 'XVG', 'AUR', 'POT', 'NOTE', 'NLG',
    'CAT', 'RBY', 'BTA', 'RDD', 'XMY', 'CAP', 'CBX', 'VIA', 'BOB', 'DOPE', 'EAC', 'EPC',
    'FLT', 'FST', 'GLC', 'GOAL', 'LGD', 'MEOW', 'NAUT', 'RIPO', 'RPC', 'RZR', 'SAT2', 'TIPS',
    'USDE', 'USDE_USDE', 'FLO',

    //SHA256
    'BTC', 'BCC', 'CRW', 'CURE', 'DEM', 'DGB', 'DGC', 'UNIT',
    'ARG', 'BCH', 'PPC', 'MZC', 'CROC', 'ZET', 'SPC', 'NMC', 'UNB', 'UNO',

    //X11
    'ADZ', 'CANN', 'CHILD', 'CKC', 'CRYPT', 'DASH', 'GB', 'GDN', 'DP', 'MIL',
    'MND', 'MUE', 'MUN', 'ONX', 'HIRO', 'INFX', 'KARM', 'LGC', 'LIMX', 'LTCX',
    'PXI', 'QBC', 'SMC', 'SIB', 'START', 'URO', 'XC', 'CRM', 'XMCC', 'DPC', 'MARU',

    //X13
    'AMBER', 'BURN', 'CLOAK', 'CLOAK', 'SLG', 'VEIL', 'XHC',

    //QUARK
    'AMS', 'QRK', 'DNET', 'SRC', 'GEO',

    //EOL
    'BELA', 'JHA', 'JPC',

    //BLAKE
    'SC', 'DCR',

    //WTF
    'CACH'
];


//1080ti hashrate map
const CURRENCY_HASHRATE_MAP = {
    ethash: {
        hr: 35,
        p: 140,
        cost: 0.15
    },
    groestl: {
        hr: 58,
        p: 210,
        cost: 0.15
    },
    x11gost: {
        hr: 19.5,
        p: 170,
        cost: 0.15
    },
    cryptonight: {
        hr: 830,
        p: 140,
        cost: 0.15
    },
    equihash: {
        hr: 685,
        p: 190,
        cost: 0.15
    },
    lyra2rev2: {
        hr: 64000,
        p: 190,
        cost: 0.15
    },
    neoscrypt: {
        hr: 1400,
        p: 190,
        cost: 0.15
    },
    blake2s: {
        hr: 6000,
        p: 190,
        cost: 0.15
    },
    blake2b: {
        hr: 2800,
        p: 190,
        cost: 0.15
    },
    blake14r: {
        hr: 4350,
        p: 210,
        cost: 0.15
    },
    pascal: {
        hr: 1700,
        p: 210,
        cost: 0.15
    },
    skunkhash: {
        hr: 47.5,
        p: 190,
        cost: 0.15
    },
    lyra2z: {
        hr: 2900,
        p: 160,
        cost: 0.15
    }
};

const ALPHANUMERIC_REGEX = /\W+/g;

class Scrapper {
    constructor(dataService) {
        this._dataService = dataService;
    }

    _scrapCurrencyDetails(currentCurrency, index, algorithmUrlParams) {
        this._requestsMade += 1;

        //needed to prevent ban from the page
        setTimeout(() => {
            console.log('New request made in:', new Date(), ' ', currentCurrency.getProp('name'));

            request(
                CURRENCY_BASE_URL + currentCurrency.getProp('url') + algorithmUrlParams,
                (nestedError, nestedResponse, nestedHtml) => {
                    let n$;
                    try {
                        n$ = cheerio.load(nestedHtml);
                    }
                    catch (e) {
                        console.log('>>> ERROR: NO HTML, response: ', nestedHtml);
                        return;
                    }

                    this._requestsMade -= 1;

                    const hourProfitValue = n$(n$(n$(n$('table')[0]).find('tbody tr')[0]).find('td')[6]).text().replace(/\s/g, '');
                    const dayProfitValue = n$(n$(n$(n$('table')[0]).find('tbody tr')[1]).find('td')[6]).text().replace(/\s/g, '');

                    const hourProfit = parseFloat(hourProfitValue.replace('$', ''));
                    const dayProfit = parseFloat(dayProfitValue.replace('$', ''));

                    const currencyName = n$('h1').text().replace(')', '').split('(')[1];
                    const algorithm = n$(n$('.col-xs-3 > p')[0]).text().replace(/\s/g, '');
                    const date = new Date().getTime();

                    const mainColumns = n$(n$('div.row')[3]).children();

                    const titles = [];
                    const values = [];
                    const textreplacer = /[^a-zA-Z]/g;

                    n$(mainColumns[0])
                        .children()
                        .add(n$(mainColumns[2]).children())
                        .each(function () {
                            titles.push(n$(this)
                                .text()
                                .toLowerCase()
                                .replace(textreplacer, ''));
                        });

                    n$(mainColumns[1])
                        .children()
                        .add(n$(mainColumns[3]).children())
                        .each(function () {
                            values.push(n$(this).text().trim());
                        });

                    const columns = {};

                    for (let i = 0; i < titles.length; i++) {
                        columns[titles[i]] = values[i];
                    }

                    const { blocktime, difficulty, nethash, exrate,
                        lastblock, blreward, marketcap } = columns;

                    const currentHistory = new History({
                        name: currentCurrency.getProp('name'),
                        dayProfit,
                        hourProfit,
                        date,
                        difficulty: difficulty,
                        nethash: nethash,
                        exchangeRate: exrate,
                        blockTimeSeconds: blocktime,
                        lastBlock: lastblock,
                        blockReward: blreward,
                        marketCap: marketcap
                    });

                    //TODO: check for existing records or directly update?
                    currentCurrency.setProp('algorithm', algorithm);

                    this._dataService
                        .getFirst('currency', 'name', currentCurrency.getProp('name'))
                        .then((data) => {
                            if (!data) {
                                this._dataService.insert('currency', currentCurrency.getProps());
                            } else {
                                if (data.algorithm !== algorithm) {
                                    this._dataService
                                        .update('currency', 'name', data.name, 'algorithm', algorithm);
                                }
                            }
                        });

                    this._dataService
                        .insert('history', currentHistory.getProps());

                    //if (requestsMade === 0) {
                    //console.log('>> All data read:', JSON.stringify(currentHistory));
                    //TODO: WRITE IN THE DATABASE IN SINGLE TRANSACTION????????

                    //1. Write currentCurrency to currency table if it's not available or changed
                    //2. Write other details in history page
                    //}
                });
        }, index * REQUEST_TIME);
    }

    scrap() {
        request(URL, (error, response, html) => {
            if (!error) {
                const $ = cheerio.load(html);
                let currencies = [];
                let elements = [];

                $('.list > .calculator').filter(function () {
                    elements.push($(this));
                });

                elements.forEach((element) => {
                    const anchors = element.find('a');
                    const names = $(anchors[1]).html().split('<br>');

                    const currencyUrl = $(anchors[0]).prop('href');
                    const imageUrl = element.find('img').prop('src');
                    const nameIsInBrackets = names[1].indexOf('(') > -1;
                    let name = names[1].replace('(', '').replace(')', '');
                    let fullName = names[0];

                    if (typeof name === 'string' && (!nameIsInBrackets || name.toUpperCase() != name)) {
                        //combined currency, like Eth + Decred
                        const temp = fullName;
                        fullName = name + ' + ' + temp;
                        name = name.toUpperCase() + '_' + temp.toUpperCase();
                    }

                    const currency = new Currency({
                        name: name, //id
                        fullName: fullName,
                        url: currencyUrl,
                        imageUrl: imageUrl,
                        algorithm: '',
                        date: new Date()
                    });

                    currencies.push(currency);
                });

                if (currencies.length === 0) {
                    console.log('Error: No currencies found. Check for API changes');
                    return;
                }

                //careful - side effects can occur if no timeout is set
                this._requestsMade = 0;

                //remove not minable currencies
                currencies = currencies.filter((item) => {
                    return BLOCKED_CURRENCIES.indexOf(item.getProp('name')) === -1;
                });

                //=== TEST ONLY ===
                //REDUCE THE NUMBER OF REQUESTS TO AVOID BLOCKING.
                //currencies = currencies.slice(0, 2);
                //=================

                currencies.forEach((currentCurrency, index, originalArray) => {
                    this._dataService
                        .getFirst('currency', 'name', currentCurrency.getProp('name'))
                        .then((dbCurrency) => {
                            let algorithmUrlParams = '';
                            if (dbCurrency && dbCurrency.algorithm) {
                                const algorithmName = dbCurrency.algorithm.replace(ALPHANUMERIC_REGEX, '').toLowerCase();
                                const algorithmOptions = CURRENCY_HASHRATE_MAP[algorithmName];
                                algorithmUrlParams = !algorithmOptions ? '' : '?' + Object
                                    .keys(algorithmOptions)
                                    .map((hashProp, hashIdx, hashData) => {
                                        const isLast = hashData.length === hashIdx + 1;
                                        return `${hashProp}=${algorithmOptions[hashProp]}${isLast ? '' : '&'}`;
                                    })
                                    .join('');
                            }

                            this._scrapCurrencyDetails(currentCurrency, index, algorithmUrlParams);
                        });
                });
            }
        });
    }
}

export default Scrapper;