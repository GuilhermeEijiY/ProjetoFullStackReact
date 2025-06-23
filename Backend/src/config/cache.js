const NodeCache = require('node-cache'); 
const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 }); 

function get(key) {
    return new Promise((resolve) => {
        const value = cache.get(key);
        resolve(value);
    });
}

function set(key, value, ttl = 3600) { 
    return new Promise((resolve) => {
        cache.set(key, value, ttl);
        resolve();
    });
}

module.exports = { get, set };