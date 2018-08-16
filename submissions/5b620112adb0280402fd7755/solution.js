// TODO: refactor *everything*

const sub = (x, y) => x - y;
const zipWith = (f, xs, ys) => xs.map((x, i) => f(x, ys[i]));
const subCounts = (xs, ys) => zipWith(sub, xs, ys);
const sortBy = (xs, f) => xs.slice().sort((a, b) => f(a) - f(b));
const sortByDesc = (xs, f) => sortBy(xs, x => -f(x));
const sum = xs => xs.reduce((x, y) => x + y, 0);

module.exports = function(me, counts, values, maxRounds, log) {
    const nItems = values.length;
    const myOffers = [], theirOffers = [];
    const allItems = [].concat(...counts.map((c, i) => Array(c).fill(i)));
    const itemIndicesByMyValueAsc = Array.from({length: nItems}, (_, i) => i).sort((a, b) => values[a] - values[b]);
    const itemIndicesByMyValueDesc = Array.from({length: nItems}, (_, i) => i).sort((a, b) => values[b] - values[a]);
    let iRound = 0;
    let myFirstOffer, myLastOffer;
    let tryCompromise = true, firstReduction = true;
    function removeTrash(offer) {
        return offer && offer.map((n, i) => values[i] == 0 ? 0 : n);
    }
    function returning(offer, choiceType) {
        log(choiceType + ' ' + removeTrash(offer));
        myLastOffer = removeTrash(offer);
        if (!myFirstOffer)
            myFirstOffer = myLastOffer;
        myOffers.push(myLastOffer);
        return myLastOffer;
    }
    function getMyValue(offer) {
        return offer.map((n, i) => n * values[i]).reduce((a, b) => a + b, 0);
    }
    return {
        offer(theirOffer) {
            iRound++;
            if (theirOffer)
                theirOffers.push(theirOffer);
            if (!theirOffer) {
                const allItemsDesc = allItems.slice().sort((a, b) => values[b] - values[a] || counts[b] - counts[a]);
                const myOffer = Array(nItems).fill(0);
                let myValue = 0;
                for (const i of allItemsDesc) {
                    myOffer[i]++;
                    myValue += values[i];
                    if (myValue >= 8)
                        return returning(myOffer, 'initial');
                }
                throw new Error('total value too low');
            } else if (getMyValue(theirOffer) >= 7/* || me == 1 && getMyValue(theirOffer) >= 7*/) {
                return undefined;
            } else if (/*me == 1 &&*/ iRound == maxRounds - 1) {
                const allItemsDesc = allItems.slice().sort((a, b) => values[a] - values[b] || counts[a] - counts[b]);
                const myOffer = Array(nItems).fill(0);
                let myValue = 0;
                for (const i of allItemsDesc) {
                    myOffer[i]++;
                    myValue += values[i];
                    if (myValue >= (me == 0 ? 6 : 5)) {
                        if (myOffer.join() != myFirstOffer.join())
                            return returning(myOffer, 'initial');
                        break;
                    }
                }
                // continue further
            }
            if (iRound == maxRounds) {
                const myPossibleOffer = theirOffers.sort((a, b) => getMyValue(b) - getMyValue(a) || sum(a) - sum(b))[0],
                    myValue = getMyValue(myPossibleOffer);
                const stubbornOpponent = new Set(theirOffers.map(o => o.join())).size <= 2 &&
                    theirOffers[1].join() == theirOffers[2].join() &&
                    new Set(myOffers.map(o => o.join())).size > 1;
                if (stubbornOpponent)
                    log('had repeated offers');
                if (me == 1) {
                    return getMyValue(theirOffer) >= 1 ? returning(undefined, 'accepting whatever') : returning(myFirstOffer, '0-0');
                } else {
                    return myValue >= 6 || stubbornOpponent && myValue >= 1 ?
                        returning(myPossibleOffer, 'last') :
                        returning(myFirstOffer, 'greedy last = first');
                }
            } else {
                // and now i've found out that the meaning of `!myFirstOffer` looks ambiguous in this context
                if (!myFirstOffer) {
                    const allItemsDesc = allItems.slice().sort((a, b) => values[b] - values[a] || counts[b] - counts[a]);
                    const myOffer = Array(nItems).fill(0);
                    let myValue = 0;
                    for (const i of allItemsDesc) {
                        myOffer[i]++;
                        myValue += values[i];
                        if (myValue >= 8) {
                            myFirstOffer = myLastOffer = myOffer;
                            break;
                        }
                    }
                    if (myFirstOffer.join() != theirOffer.join())
                        return returning(myOffer, 'initial');
                }

                const diff = subCounts(myLastOffer, theirOffer);
                const myOffer = myLastOffer.slice();
                //log('mlo'+myLastOffer);
                //log('tlo'+theirOffer);
                //log('imo'+myOffer);
                const theirNextItem = itemIndicesByMyValueAsc.find(i => diff[i] > 0);
                if (theirNextItem == null)
                    return returning(myFirstOffer, '!theirNextItem');
                myOffer[theirNextItem]--;
                //log('d'+diff);
                diff[theirNextItem]--;
                //log('d'+diff);
                while (getMyValue(myOffer) < 7) {
                    const myNextItem = itemIndicesByMyValueDesc.find(i => diff[i] < 0);
                    if (myNextItem == null)
                        break;
                    myOffer[myNextItem]++;
                    diff[myNextItem]++;
                    //log('d'+diff);
                }
                if (getMyValue(myOffer) >= 7) {
                    if (firstReduction) {
                        tryCompromise = false;
                        firstReduction = false;
                    }
                    return returning(myOffer, 'found something (!!!)');
                }
                while (getMyValue(myOffer) < 7) {
                    const myNextItem = itemIndicesByMyValueAsc.find(i => myOffer[i] < counts[i]);
                    if (myNextItem == null)
                        return returning(myFirstOffer, '!myNextItem');
                    myOffer[myNextItem]++;
                    //diff[myNextItem]++;
                    //log('d'+diff);
                }
                firstReduction = false;
                return returning(myOffer, 'found something');
            }
            throw new Error('no condition matched');
        }
    };
};
