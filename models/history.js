import {parseSeparatedFloat, parseCustomInt, parseRelativeTime, parseHashRate} from './util';

/*
    `id`	INTEGER PRIMARY KEY AUTOINCREMENT,
    `name`	TEXT,
    `difficulty`	REAL,
    `nethash`	REAL, //needs TH, Mh.. multiplier
    `exchangeRate`	REAL,
    `blockTimeSeconds`	INTEGER, //needs 1h 13m 25s
    `lastBlock`	INTEGER,
    `blockReward`	REAL,
    `marketCap`	INTEGER
*/

const CLASS_PROPERTIES = ['id','name','difficulty','nethash','exchangeRate','blockTimeSeconds',
    'lastBlock','blockReward','marketCap','date', 'dayProfit', 'hourProfit'];

const CLASS_TYPES = {
    id: 'number',
    name: 'string',
    difficulty: 'number',
    nethash: 'number',
    exchangeRate: 'number',
    blockTimeSeconds: 'number',
    lastBlock: 'number',
    blockReward: 'number',
    marketCap: 'number',
    date: 'number',
    dayProfit: 'number',
    hourProfit: 'number'
};

const CLASS_PROPERTY_PARSERS = {
    id: parseCustomInt,
    name: (value) => {return value;},
    difficulty: parseSeparatedFloat,
    nethash: parseHashRate,
    exchangeRate: parseSeparatedFloat,
    blockTimeSeconds: parseRelativeTime,
    lastBlock: parseCustomInt,
    blockReward: parseSeparatedFloat,
    marketCap: parseCustomInt,
    date: (value) => {return parseInt(value);},
    dayProfit: parseSeparatedFloat,
    hourProfit: parseSeparatedFloat
};

class History {
    static parseProps(data) {
        const result = {};

        CLASS_PROPERTIES.forEach((prop) => {
            result[prop] = CLASS_PROPERTY_PARSERS[prop](data[prop]);
        });

        return result;
    };

    static isPropsParsed(data) {
        return CLASS_PROPERTIES.reduce((prev, prop) => {
            return prev && data && History.isPropParsed(prop, data[prop]);
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
        let parsedProps = !History.isPropsParsed(props) ? History.parseProps(props) : props;

        CLASS_PROPERTIES.forEach((prop) => {
            this[`_${prop}`] = parsedProps[prop];
        });
    }

    setProp(prop, value) {
        if (!prop || CLASS_PROPERTIES.indexOf(prop) === -1) {
            return;
        }

        if (!History.isPropParsed(prop, value)) {
            this[`_${prop}`] = CLASS_PROPERTY_PARSERS[prop](value);
        } else {
            this[`_${prop}`] = value;
        }
    }
};

export default History;