//create request and scrap the site
//write changes to DB ?
const URL = 'https://whattomine.com/calculators';
const CURRENCY_BASE_URL = 'https://whattomine.com';

//DO NOT GO BELOW 250ms, even 500ms is the safe limit
const REQUEST_TIME = 500;

//remove ones that are hard to mine with GPU
const BLOCKED_CURRENCIES = [
    //Scrypt
    'DOGE', 'LTC',

    //SHA256
    'BTC', 'BCC', 'CRW', 'CURE', 'DEM', 'DGB', 'DGC',
    'ARG',

    //X11
    'ADZ', 'CANN', 'CHILD', 'CKC', 'CRYPT', 'DASH', 'GB', 'GDN', 'DP', 'MIL',
    'MND', 'MUE', 'MUN', 'ONX', 'HIRO', 'INFX', 'KARM', 'LGC', 'LIMX', 'LTCX',
    'PXI', 'QBC', 'SMC'
];

class Scrapper {
    constructor(dataAccess) {
        this._dataAccess = dataAccess;
    }

    scrap() {
        request(URL, function(error, response, html){
            if(!error){
                const $ = cheerio.load(html);
                let currencies = [];
    
                $('.list > .calculator').filter(function(){
                    //Example HTML:
                    //<div class="float text-center calculator">
                    //    <div>
                    //        <a href="/coins/74-365-keccak"><img src="https://images.whattomine.com/coins/logos/000/000/074/medium/365.png?1486175409" alt="365" width="100" height="100"></a>
                    //    </div>
                    //    <div class="link-index name_tag_algo" style="margin-top: -10px">
                    //        <h3><a href="/coins/74-365-keccak">365Coin<br>(365)</a></h3>
                    //    </div>
                    //</div>
    
                    const element = $(this);
                    const anchors = element.find('a');
                    const names = $(anchors[1]).html().split('<br>');
    
                    const currencyUrl = $(anchors[0]).prop('href');
                    const imageUrl = element.find('img').prop('src');
                    let name = names[1].replace('(', '').replace(')', '');
                    let fullName = names[0];
    
                    if (typeof name === 'string' && name.toUpperCase() != name) {
                        //combined currency, like Eth + Decred
                        const temp = fullName;
                        fullName = name + ' + ' + temp;
                        name = name.toUpperCase() + '_' + temp.toUpperCase();
                    }
    
                    //TODO: change with Currency Class
                    //class
                    const currency = {
                        name: name, //id
                        fullName: fullName,
                        url: currencyUrl,
                        imageUrl: imageUrl,
                        dayProfit: null,
                        algo: ''
                    };
    
                    currencies.push(currency);
                });
    
                if (currencies.length === 0) {
                    console.log('Error: No currencies found. Check for API changes');
                    res.send('Error: No currencies found. Check for API changes');
                    return;
                }
    
                let requestsMade = 0;
    
                //remove not minable currencies
                currencies = currencies.filter((item) => {
                    return BLOCKED_CURRENCIES.indexOf(item.name) === -1;
                });
    
                //=== TEST ONLY ===
                //REDUCE THE NUMBER OF REQUESTS TO AVOID BLOCKING.
                currencies = currencies.slice(0,20);
                //=================
    
                //TODO: Optimization - write output to file and request new data from server only once an hour
                //TODO: possibly keep old data with date prefix to watch for tendencies
                currencies.forEach((value, index, array) => {
                    const currentCurrency = value;
    
                    requestsMade += 1;
    
                    //needed to prevent ban from the page
                    setTimeout(() => {
                        console.log('New request made in:', new Date(), ' ', value.name);
                        request(
                            CURRENCY_BASE_URL + currentCurrency.url,
                            (nestedError, nestedResponse, nestedHtml) => {
                                const n$ = cheerio.load(nestedHtml);
                                
                                //TODO: change with Currency Class
                                const currentHistory = {};
                                requestsMade -= 1;
    
                                //..this jQuery implementation does not support pseudo selectors
                                const dayProfitValue = n$(n$(n$(n$('table')[0]).find('tbody tr')[1]).find('td')[6]).text().replace(/\s/g, '');
                                const dayProfit = parseFloat(dayProfitValue.replace('$', ''));
                                const currencyName = n$('h1').text().replace(')', '').split('(')[1];
                                const algo = n$(n$('.col-xs-3 > p')[0]).text().replace(/\s/g, '');
    
                                if (!currentCurrency) {
                                    console.log('Error: currency not found for details inject');
                                    return;
                                } else {
                                    currentCurrency.algo = algo;

                                    //TODO: add other props 
                                    currentHistory.dayProfit = dayProfit;
                                }
    
                                if (requestsMade === 0) {
                                    //TODO: WRITE IN THE DATABASE

                                    //1. Write currentCurrency to currency table if it's not available or changed
                                    //2. Write other details in history page
                                }
                            });
                    }, index * REQUEST_TIME);
                });
            }
        });
    }
}

export default Scrapper;