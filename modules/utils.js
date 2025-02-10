const ALPHNUM = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const { randomUUID } = require('crypto');

function generate_random_string(char_count = 32) {
    let result = '';
    for (let i=0; i < char_count; i++) result += ALPHNUM[Math.floor(Math.random()*ALPHNUM.length)];
    return result;
}

function generate_random_int(digit_count = 16) {
    let result = '';
    for (let i=0; i < digit_count; i++) result += Math.floor(Math.random()*10).toString();
    return Number(result);
}

function generate_client_id() {
    let date = new Date();
    let year = date.getUTCFullYear().toString();
    let month = date.getUTCMonth().toString();
    let day = date.getUTCDate().toString();
    let milli = (date.getTime()%86400000).toString();
    return Number(`${year.substring(2)}${month}${day}${milli}${generate_random_int(4)}`);
}

module.exports = {
    generate_random_string: generate_random_string,
    generate_random_int:generate_random_int,
    generate_client_id:generate_client_id
}