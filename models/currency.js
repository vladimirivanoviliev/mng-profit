/*
    `name`	TEXT NOT NULL UNIQUE,
    `fullName`	TEXT,
    `url`	TEXT,
    `imageUrl`	TEXT,
    `algorithm`	TEXT,
*/

const CLASS_PROPERTIES = ['name','fullName', 'url', 'imageUrl', 'algorithm'];

class Currency {
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

    getProp(prop) {
        if (!prop) {
            return;
        }

        return this[`_${prop}`];
    }

    setProps(props) {
        CLASS_PROPERTIES.forEach((prop) => {
            this[`_${prop}`] = props[prop];
        });
    }

    setProp(prop, value) {
        if (!prop || CLASS_PROPERTIES.indexOf(prop) === -1) {
            return;
        }

        this[`_${prop}`] = props[prop];
    }
};

export default Currency;