'use strict';
const fs = require('fs');
const random_js = require('random-js');

// Using tweet: https://twitter.com/SpringerTV/status/1025799527301873667
const text = 'Watch a little Jerry-in-the-middle on @GetNosey! http://m.onelink.me/a5aae97a';

function main(){
    let bytes = Array.from(new Buffer(text));
    let random = new random_js(random_js.engines.mt19937().seedWithArray(bytes));
    let odd = '', even = '';
    for (let i = 0; i<1000; i++)
    {
        let n = random.uint32();
        if (i%2)
            odd += `${n}\n`;
        else
            even += `${n}\n`;
    }
    fs.writeFileSync('round1.txt', odd);
    fs.writeFileSync('finals.txt', even);
}

main();
