var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var expressApp = express();

expressApp.get('/scrape', function(req, res){

    var url = 'https://whattomine.com/calculators';
    var currencyBaseUrl = 'https://whattomine.com';

    request(url, function(error, response, html){
        if(!error){
            var $ = cheerio.load(html);
            var currencies = [];

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

                var element = $(this);
                var anchors = element.find('a');
                var names = $(anchors[1]).html().split('<br>');

                var currencyUrl = $(anchors[0]).prop('href');
                var imageUrl = element.find('img').prop('src');
                var name = names[1].replace('(', '').replace(')', '');
                var fullName = names[0];

                var currency = {
                    url: currencyUrl,
                    imageUrl: imageUrl,
                    name: name,
                    fullName: fullName,
                    details: {
                        dayProfit: null,
                        algo: ''
                    }
                };

                currencies.push(currency);
            });

            if (currencies.length === 0) {
                console.log('Error: No currencies found. Check for API changes');
                res.send('Error: No currencies found. Check for API changes');
                return;
            }

            var requestsMade = 0;

            //=== TEST ONLY ===
            //REDUCE THE NUMBER OF REQUESTS TO AVOID BLOCKING.
            //currencies = currencies.slice(0, 40);
            var coinsOfInterest = ['ETC', 'ETH', 'ZEC', 'ZEN', 'SIGT'];
            currencies = currencies.filter(function(item) {
                return coinsOfInterest.indexOf(item.name) > -1;
            });
            //=================

            //TODO: Optimization - write output to file and request new data from server only once an hour
            //TODO: possibly keep old data with date prefix to watch for tendencies
            currencies.forEach(function(value, index, array) {
                var currentCurrency = value;

                requestsMade += 1;

                //needed to prevent ban from the page
                var requestTime = 500;
                setTimeout(function () {
                    console.log('New request made in:', new Date());
                    request(
                        currencyBaseUrl + currentCurrency.url,
                        function(nestedError, nestedResponse, nestedHtml){
                            var n$ = cheerio.load(nestedHtml);
                            requestsMade -= 1;

                            //..this jQuery implementation does not support pseudo selectors
                            var dayProfit = n$(n$(n$(n$('table')[0]).find('tbody tr')[1]).find('td')[6]).text().replace(/\s/g, '');
                            var currencyName = n$('h1').text().replace(')', '').split('(')[1];
                            var algo = n$(n$('.col-xs-3 > p')[0]).text().replace(/\s/g, '');

                            if (!currentCurrency) {
                                console.log('Error: currency not found for details inject');
                                return;
                            } else {
                                currentCurrency.algo = algo;
                                currentCurrency.dayProfit = dayProfit;
                            }

                            if (requestsMade === 0) {
                                fs.readFile('indexTemplate.html', 'utf8', function (err,data) {
                                    if (err) {
                                        return console.log('Error reading template file: ', err);
                                    }
                                    res.send(data.replace('<!--replace-->', JSON.stringify(currencies)));
                                });
                            }
                        });
                }, index * requestTime);
            });

            //fs.writeFile('output.json', JSON.stringify(currencies, null, 4), function(err){
            //    console.log('File successfully written.');
            //});
        }
    });
});

expressApp.listen('8081')

console.log('Magic happens on port 8081');

exports = module.exports = expressApp;