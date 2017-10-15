import {parseSeparatedFloat, parseCustomInt, parseRelativeTime, parseHashRate} from './util';

/*
    `id`	INTEGER PRIMARY KEY AUTOINCREMENT,
    `pairName`	TEXT,
    `sourceCurrency`	TEXT,
    `destinationCurrency`	TEXT,
    `timestamp`	INTEGER,
    `exchange`	TEXT,
    `askPrice`	REAL,
    `askWholeLotVolume`	REAL,
    `askLotVolume`	REAL,
    `bidPrice`	REAL,
    `bidWholeLotVolume`	REAL,
    `bidLotVolume`	REAL,
    `lastClosedTradePrice`	REAL,
    `lastClosedTradeLotVolume`	REAL,
    `volumeToday`	REAL,
    `volume24h`	REAL,
    `volumeWeightedAvaragePriceToday`	REAL,
    `volumeWeightedAvaragePrice24h`	REAL,
    `numberOfTradesToday`	REAL,
    `numberOfTrades24h`	REAL,
    `lowToday`	REAL,
    `low24h`	REAL,
    `highToday`	REAL,
    `high24h`	REAL,
    `todayOpeningPrice`	REAL
*/

const CLASS_PROPERTIES = ['id', 'pairName', 'sourceCurrency', 'destinationCurrency', 'timestamp', 'exchange', 'askPrice',
    'askWholeLotVolume', 'askLotVolume', 'bidPrice', 'bidWholeLotVolume', 'bidLotVolume', 'lastClosedTradePrice',
    'lastClosedTradeLotVolume', 'volumeToday', 'volume24h', 'volumeWeightedAvaragePriceToday', 'volumeWeightedAvaragePrice24h',
    'numberOfTradesToday', 'numberOfTrades24h', 'lowToday', 'low24h', 'highToday', 'high24h', 'todayOpeningPrice'];

const CLASS_TYPES = {
    id: 'number',
    pairName: 'string',
    sourceCurrency: 'string',
    destinationCurrency: 'string',
    timestamp: 'number',
    exchange: 'string',
    askPrice: 'number',
    askWholeLotVolume: 'number',
    askLotVolume: 'number',
    bidPrice: 'number',
    bidWholeLotVolume: 'number',
    bidLotVolume: 'number',
    lastClosedTradePrice: 'number',
    lastClosedTradeLotVolume: 'number',
    volumeToday: 'number',
    volume24h: 'number',
    volumeWeightedAvaragePriceToday: 'number',
    volumeWeightedAvaragePrice24h: 'number',
    numberOfTradesToday: 'number',
    numberOfTrades24h: 'number',
    lowToday: 'number',
    low24h: 'number',
    highToday: 'number',
    high24h: 'number',
    todayOpeningPrice: 'number'
};

const CLASS_PROPERTY_PARSERS = {
    id: parseCustomInt,
    pairName: (value) => {return value;},
    sourceCurrency: (value) => {return value;},
    destinationCurrency: (value) => {return value;},
    timestamp: parseCustomInt,
    exchange: (value) => {return value;},
    askPrice: parseSeparatedFloat,
    askWholeLotVolume: parseSeparatedFloat,
    askLotVolume: parseSeparatedFloat,
    bidPrice: parseSeparatedFloat,
    bidWholeLotVolume: parseSeparatedFloat,
    bidLotVolume: parseSeparatedFloat,
    lastClosedTradePrice: parseSeparatedFloat,
    lastClosedTradeLotVolume: parseSeparatedFloat,
    volumeToday: parseSeparatedFloat,
    volume24h: parseSeparatedFloat,
    volumeWeightedAvaragePriceToday: parseSeparatedFloat,
    volumeWeightedAvaragePrice24h: parseSeparatedFloat,
    numberOfTradesToday: parseSeparatedFloat,
    numberOfTrades24h: parseSeparatedFloat,
    lowToday: parseSeparatedFloat,
    low24h: parseSeparatedFloat,
    highToday: parseSeparatedFloat,
    high24h: parseSeparatedFloat,
    todayOpeningPrice: parseSeparatedFloat,
};

class Ticker {
    static parseProps(data) {
        const result = {};

        CLASS_PROPERTIES.forEach((prop) => {
            result[prop] = CLASS_PROPERTY_PARSERS[prop](data[prop]);
        });

        return result;
    };

    static isPropsParsed(data) {
        return CLASS_PROPERTIES.reduce((prev, prop) => {
            return prev && data && Ticker.isPropParsed(prop, data[prop]);
        }, true);
    }

    static isPropParsed(prop, value) {
        return value === undefined || typeof value === CLASS_TYPES[prop];
    }

    constructor(props) {
        this.setProps(props);
    }

    //TODO: Make static
    getPropList() {
        return CLASS_PROPERTIES.slice();
    }

    getProps() {
        let props = {};

        CLASS_PROPERTIES.forEach((prop) => {
            if (prop !== 'id') {
                props[prop] = this[`_${prop}`];
            }
        });

        return props;
    }

    getProp(prop) {
        if (!prop) {
            return;
        }

        return this[`_${prop}`];
    }

    setProps(props) {
        let parsedProps = !Ticker.isPropsParsed(props) ? Ticker.parseProps(props) : props;

        CLASS_PROPERTIES.forEach((prop) => {
            this[`_${prop}`] = parsedProps[prop];
        });
    }

    setProp(prop, value) {
        if (!prop || CLASS_PROPERTIES.indexOf(prop) === -1) {
            return;
        }

        if (!Ticker.isPropParsed(prop, value)) {
            this[`_${prop}`] = CLASS_PROPERTY_PARSERS[prop](value);
        } else {
            this[`_${prop}`] = value;
        }
    }
};

export default Ticker;