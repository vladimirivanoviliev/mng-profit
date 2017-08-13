var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var expressApp = express();

expressApp.get('/scrape', function(req, res){

    url = 'https://whattomine.com/calculators';

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

                var url = $(anchors[0]).prop('href');
                var imageUrl = element.find('img').prop('src');
                var name = names[1].replace('(', '').replace(')', '');
                var fullName = names[0];

                var currency = {
                    url: url,
                    imageUrl: imageUrl,
                    name: name,
                    fullName: fullName,
                    details: []
                };

                currencies.push(currency);
            });

            fs.readFile('indexTemplate.html', 'utf8', function (err,data) {
                if (err) {
                    return console.log('Error reading template file: ', err);
                }

                res.send(data.replace('<!--replace-->', JSON.stringify(currencies)));
            });

            //res.send(JSON.stringify(currencies, null, 4));

            //fs.writeFile('output.json', JSON.stringify(currencies, null, 4), function(err){
            //    console.log('File successfully written.');
            //});
        }
    });
});

expressApp.listen('8081')

console.log('Magic happens on port 8081');

exports = module.exports = expressApp;