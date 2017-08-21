import {parseSeparatedFloat, parseCustomInt, parseRelativeTime} from './util';

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

const CLASS_PROPERTIES = ['id','name','difficulty','nethash','exchangeRate','blockTimeSeconds','lastBlock','blockReward','marketCap'];

class History {
    static parse(props) {
        const {id, name, difficulty, nethash, exchangeRate, blockTimeSeconds,
            lastBlock, blockReward, marketCap} = props;

        return {
            id: parseCustomInt(id),
            name: name,
            difficulty: parseSeparatedFloat(difficulty),
            nethash: parseHashRate(nethash),
            exchangeRate: parseSeparatedFloat(exchangeRate),
            blockTimeSeconds: parseRelativeTime(blockTimeSeconds),
            lastBlock: parseCustomInt(lastBlock),
            blockReward: parseSeparatedFloat(blockReward),
            marketCap: parseCustomInt(marketCap)
        };
    };

    static isParsed(props) {
        const {id, name, difficulty, nethash, exchangeRate, blockTimeSeconds,
            lastBlock, blockReward, marketCap} = props;

        if (id && typeof id !== 'number') {
            return true;
        }

        if (name && typeof name !== 'string') {
            return true;
        }

        if (difficulty && typeof difficulty !== 'number') {
            return true;
        }

        if (nethash && typeof nethash !== 'number') {
            return true;
        }

        if (exchangeRate && typeof exchangeRate !== 'number') {
            return true;
        }

        if (blockTimeSeconds && typeof blockTimeSeconds !== 'number') {
            return true;
        }

        if (lastBlock && typeof lastBlock !== 'number') {
            return true;
        }

        if (blockReward && typeof blockReward !== 'number') {
            return true;
        }

        if (marketCap && typeof marketCap !== 'number') {
            return true;
        }

        return false;
    }

    constructor(props) {
        this.setProps(props);
    }

    getProps() {
        let props = {};

        CLASS_PROPERTIES.forEach((prop) => {
            props[prop] = this[`_${prop}`];
        });

        return props;
    }

    setProps(props) {
        let parsedProps;

        if (History.isParsed(props)) {
            parsedProps = History.parse(props)
        } else {
            parsedProps = {...props};
        }

        CLASS_PROPERTIES.forEach((prop) => {
            this[`_${prop}`] = parsedProps[prop];
        });
    }
};

export default History;