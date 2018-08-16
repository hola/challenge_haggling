const generate = require('./generate.js');
const fs = require('fs');

function count(counter, max_numbers)
{
    let N = counter.length;
    counter[0]++;
    for (let i = 1; i < N; i++)
    {
        if (counter[i-1] > max_numbers[i-1])
        {
            counter[i-1] = 0;
            counter[i]++;
        }
        else
            break;
    }
    return counter[N-1] <= max_numbers[N-1];
}

function filterOffer(counts, values, offer)
{
    let sum = 0;
    let flag = true;
    for (let i = 0; i < offer.length; i++)
    {
        if (offer[i] && (!values[i]))
            return false;
        sum += offer[i] * values[i];
        flag = flag && (offer[i] === counts[i]);
    }
    return (sum > 0) && (!flag);
}

function scoreOffers(counts, values, valuations, offers, threshold)
{
    let sum = 0;
    for (let i = 0; i < valuations.length; i++)
    {
        for (let round = 0; round < offers.length; round++)
        {
            let sum_opposite = 0;
            for (let j = 0; j < counts.length; j++)
                sum_opposite += (counts[j] - offers[round][j]) * valuations[i][j];
            if (sum_opposite >= threshold)
            {
                for (let k = 0; k < counts.length; k++)
                    sum += offers[round][k] * values[k];
                break;
            }
        }
    }
    return sum;
}

function search(counts, values, valuations, max_rounds, threshold)
{
    let set = []; // list of all possible offers
    let offer = new Array(counts.length).fill(0);
    while (count(offer, counts))
        if (filterOffer(counts, values, offer))
            set.push(offer.slice());

    let offers = new Array(max_rounds);
    let bestOffers = new Array(max_rounds);
    let index = new Array(max_rounds).fill(0);
    index[0] = -1;
    let max_numbers = new Array(max_rounds).fill(set.length-1);

    let best_sum = -1;
    while (count(index, max_numbers))
    {
        for (let round = 0; round < max_rounds; round++)
            offers[round] = set[index[round]].slice();

        let sum = scoreOffers(counts, values, valuations, offers, threshold);

        if (sum > best_sum)
        {
            best_sum = sum;
            for (let round = 0; round < max_rounds; round++)
                bestOffers[round] = offers[round].slice();
        }
    }
    return bestOffers;
}

function fullSearch(generator)
{
    let obj_sets = generator.obj_sets;
    let max_rounds = generator.max_rounds;
    let threshold = generator.total/2;

    for (let i = 0; i < obj_sets.length; i++)
    {
        obj_sets[i].offers = [];
        let counts = obj_sets[i].counts;
        let valuations = obj_sets[i].valuations;
        for (let j = 0; j < valuations.length; j++)
        {
            let values = valuations[j];
            console.log( (i+1) + " from " + obj_sets.length + " counts = " + counts + "; " +
                (j+1) + " from " + valuations.length + " values = " + values + "...");

            let offers = search(counts, values, valuations, max_rounds, threshold);
            obj_sets[i].offers.push(offers);
        }
    }
}

let min_obj = 1;
let max_obj = 6;
let types = 3;
let total = 10;
let max_rounds = 5;
let generator = new generate.Generator(types, min_obj, max_obj, total, max_rounds);

fullSearch(generator);
fs.writeFileSync('offers.txt', JSON.stringify(generator));