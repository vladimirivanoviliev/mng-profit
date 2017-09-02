/*
    `name`	TEXT NOT NULL UNIQUE,
    `fullName`	TEXT,
    `url`	TEXT,
    `imageUrl`	TEXT,
    `algorithm`	TEXT,
*/

const CLASS_PROPERTIES = ['name','fullName', 'url', 'imageUrl', 'algorithm', 'date'];

class Currency {
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

        this[`_${prop}`] = value;
    }
};

export default Currency;