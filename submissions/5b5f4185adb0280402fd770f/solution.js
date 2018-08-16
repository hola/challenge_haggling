/*jslint
    es6: true,
    node: true,
    esversion: 6
*/

'use strict';

module.exports = class Agent {

    /*
    constructor notes:
    me:
        is 0 if your turn is first, and 1 if your turn is second.
    counts:
        is an array of integers, describing how many of each type of object there is.
        This array is between 2 and 10 elements long.
    values:
        is an array of integers the same length as counts,
        describing how much every object is worth to you.
    max_rounds:
        is the limit on the number of rounds in the negotiations;
        a round is two turns, one by each partner.
    log:
        is a function which your code can call to output a message for debugging
        (console.log won't work).
    */
    constructor (me, counts, values, max_rounds, log) {
        // -1 quiet, 1 error, 2 minimum, 3 verbose
        this.debugMode = 3;
        this.log = log;

        // the lowest valued offer I will accept
        // remember 1 > 0, some > none
        this.acceptOfferMinValueToMe = 3;
        this.acceptOfferMinValueToMe += max_rounds;

        this.iGoFirst = false;
        this.initIGoFirst(me);

        this.roundsToGo = 0;
        this.roundsLength = 0;
		this.roundsIndex = 0;
        this.initRounds(max_rounds);

        this.typeNamesSerial = 0;
        this.itemTypeNames = [];
        this.initItemTypeNames();

        this.items = [];
        this.initItems(counts, values);

        this.itemsTotalValueToMe = 0;
        this.initItemsTotalValueToMe();
    }

    // log debug messages
    writeLog (key, message, mode, spacing) {
        key = key || '';
        message = message || '';
        mode = mode || 3;
        spacing = spacing || 0;

        var debugMode = this.debugMode || 3,
            messageStr = '',
            logMessage = '',
            messageIsArray = false;
        
        if (debugMode > -1) {
            messageIsArray = Array.isArray(message);
            if (messageIsArray) {
                if (spacing) {
                    messageStr = JSON.stringify(message, null, 2);
                } else {
                    messageStr = JSON.stringify(message);
                }
            } else {
                messageStr = String(message);
            }

            if (debugMode >= mode) {
                if (key) {
                    logMessage += key + ': ';
                }
                logMessage += message;
                this.log(logMessage);
            }
        }
    }

    getRandomInt (max) {
        max = max || 1;

        var result = Math.floor(Math.random() * Math.floor(max));
        return result;
    }

    // testing seems easier with real names for the objects
    initItemTypeNames () {
        this.itemTypeNames = [
            'book', 'hat', 'ball'
        ];
        this.writeLog('init itemTypeNames', this.itemTypeNames, 3);
    }

    // get the name of the object
    getItemTypeName (index) {
        index = index || 0;

        var itemTypeName = '',
            itemTypeNames = this.itemTypeNames || [],
            itemTypeNamesLength = itemTypeNames.length || 0;

        if (itemTypeNamesLength >= index) {
            itemTypeName = itemTypeNames[index];
        }
        if (!itemTypeName) {
            itemTypeName = 'type_' + this.typeNamesSerial;
            this.typeNamesSerial += 1;
        }
        return itemTypeName;
    }

    initIGoFirst (me) {
        me = me || 0;

        this.iGoFirst = false;
		if (me === 0) {
            this.iGoFirst = true;
        }
        this.writeLog('init iGoFirst', this.iGoFirst);
    }

    initRounds (maxRounds) {
        maxRounds = maxRounds || 5;

        this.roundsToGo = maxRounds;
        this.writeLog('roundsToGo', this.roundsToGo);
        this.roundsLength = maxRounds;
        this.writeLog('constructor roundsLength', this.roundsLength);
		this.roundsIndex = 0;
    }

    /*
        init the items as a flat list
        a flat list is an item object for every count
        examples:
            [2: books, 0 hats, 1 ball] => [{1 book}, {1 book}, {1 ball}]
            [1: books, 2 hats, 3 ball] => [{1 book}, {1 hat}, {1 hat}, {1 ball}]
    */
    initItems (countsParam, valuesParam) {
        countsParam = countsParam || [];
        valuesParam = valuesParam || [];

        var items = [],
            itemTypeName = '',
            counts = countsParam || [],
			countsLength = counts.length || 0,
			count = 0,
			values = valuesParam || [],
			value = 0,
            countsIndex = 0,
            item = null,
            countIndex = 0,
            itemKey = '',
            sortIndex = 0;

        for (countsIndex = 0; countsIndex < countsLength; countsIndex += 1) {
            count = counts[countsIndex];
            count = parseInt(count, 10);
            value = values[countsIndex];
            value = parseInt(value, 10);
            itemTypeName = this.getItemTypeName(countsIndex);

            for (countIndex = 0; countIndex < count; countIndex += 1) {
                itemKey = countsIndex + '_' + countIndex;
                item = {
                    'sortIndex': sortIndex,
                    'itemTypeName': itemTypeName,
                    'countsIndex': countsIndex,
                    'itemKey': itemKey,
                    'valueToMe': value,
                    'offeredToMe': false,
                    'offeredToMeCount': 0,
                    'offerToThem': false
                };
                items.push(item);
                sortIndex += 1;
            }
        }
        this.items = items;
        this.counts = counts;
        this.values = values;
        this.writeLog('items', this.items);
    }

    // get my total value of the items
    initItemsTotalValueToMe () {
        var items = this.items || [],
            itemsLength = items.length || 0,
            item = null,
            itemsIndex = 0,
            valueToMe = 0,
            itemsTotalValueToMe = 0;

        for (itemsIndex = 0; itemsIndex < itemsLength; itemsIndex += 1) {
            item = items[itemsIndex] || {};
            valueToMe = item.valueToMe || 0;
            itemsTotalValueToMe += valueToMe;
        }
        this.itemsTotalValueToMe = itemsTotalValueToMe;
        this.writeLog('init itemsTotalValueToMe', itemsTotalValueToMe);
    }

    resetOfferItemsOfferedToMe () {
        var items = this.items || [],
            itemsLength = items.length || 0,
            item = null,
            itemsIndex = 0;

        for (itemsIndex = 0; itemsIndex < itemsLength; itemsIndex += 1) {
			item = items[itemsIndex] || {};
            item.offeredToMe = false;
        }
    }

    resetOfferItemsOfferToThem () {
        var items = this.items || [],
            itemsLength = items.length || 0,
            item = null,
            itemsIndex = 0;

        for (itemsIndex = 0; itemsIndex < itemsLength; itemsIndex += 1) {
			item = items[itemsIndex] || {};
            item.offerToThem = false;
        }
    }

    // sort the items by the original sort order
    sortItemsBySortIndex () {
        var itemsCompareSortIndex = null,
            items = this.items || [];

        itemsCompareSortIndex = function (item1, item2) {
            var result = item1.sortIndex - item2.sortIndex;
            return result;
        };

        items.sort(itemsCompareSortIndex);
        return items;
    }

    /*
        sort the items by the valueToMe ascending
        if the valueToMe is the same sort
        the items offered to me above the items
        not offered to me
    */
    sortItemsByValueToMe () {
        var itemsCompareValueToMe = null,
            items = this.items || [];

        itemsCompareValueToMe = function (item1, item2) {
            item1 = item1 || {};
            item1 = item2 || {};

            var valueToMe1 = item1.valueToMe || 0,
                valueToMe2 = item2.valueToMe || 0,
                offeredToMeCount1 = 0,
                offeredToMeCount2 = 0,
                result = 0;

            result = (valueToMe1 - valueToMe2);
            if (result === 0 || result === -1 || result === 1) {
                if (offeredToMeCount1 && offeredToMeCount2) {
                    result = offeredToMeCount2 - offeredToMeCount1;
                }

                // if (offeredToMeCount1 && valueToMeCount2) {
                //     result = 0;
                // } else if (offeredToMeCount1) {
                //     result = 1;
                // } else if (valueToMeCount2) {
                //     result = -1;
                // }
            }
            return result;
        };

        items.sort(itemsCompareValueToMe);
        return items;
    }

    // find the item given an item key
    getItemByItemKey (itemKeyToFind) {
        itemKeyToFind = itemKeyToFind || '';

        var items = this.items || [],
            itemsLength = items.length || 0,
            item = null,
            itemsIndex = 0,
            itemKey = '',
            result = null;

        for (itemsIndex = 0; itemsIndex < itemsLength; itemsIndex += 1) {
            item = items[itemsIndex] || {};
            itemKey = item.itemKey || '';
            if (itemKey) {
                if (itemKey === itemKeyToFind) {
                    result = item;
                    break;
                }
            }
        }
        return result;
    }

    // set the item property of offeredToMe
    // if it is in the offer
    initItemsWithOffer (offer) {
        offer = offer || [];

        var item = null,
            offerCount = 0,
            offerLength = offer.length || 0,
            offerIndex = 0,
            offerCountIndex = 0,
            itemKey = '';

        for (offerIndex = 0; offerIndex < offerLength; offerIndex += 1) {
            offerCount = offer[offerIndex] || 0;

            for (offerCountIndex = 0; offerCountIndex < offerCount; offerCountIndex += 1) {
                itemKey = offerIndex + '_' + offerCountIndex;
                // this.writeLog('itemKey', itemKey);
                if (itemKey) {
                    item = this.getItemByItemKey(itemKey);
                    if (item) {
                        item.offeredToMe = true;
                        item.offeredToMeCount += 1;
                    }
                }
            }
        }
    }

    // init the total value of the items offeredToMe 
    initOfferTotalValueToMe () {
        var items = this.items || [],
            itemsLength = items.length || 0,
            item = null,
            itemsIndex = 0,
            offeredToMe = false,
            offerValueToMe = 0,
            offerTotalValueToMe = 0;

        for (itemsIndex = 0; itemsIndex < itemsLength; itemsIndex += 1) {
            item = items[itemsIndex] || {};
            offeredToMe = item.offeredToMe || false;
            offerValueToMe = item.valueToMe || 0;

            if (offeredToMe) {
                offerTotalValueToMe += offerValueToMe;
            }
        }
        this.writeLog('offerTotalValueToMe', offerTotalValueToMe);
        this.offerTotalValueToMe = offerTotalValueToMe;
    }

    // finalize the round
    onRoundFinished () {
        this.writeLog('roundsToGo', this.roundsToGo);
        this.roundsToGo -= 1;

        this.writeLog('roundsIndex', this.roundsIndex);
        this.roundsIndex += 1;

        this.writeLog('counts', this.counts);
        this.writeLog('values', this.values);
    }

    offer (offer) {
        var result;

        result = this.go(offer);
        return result;
    }

    // get the total value of the items I am keeping
    getItemsTotalValueIKeep (items) {
        items = items || [];

        var itemsLength = items.length || 0,
            item = null,
            itemsIndex = 0,
            valueToMe = 0,
            offerToThem = false,
            totalValueIKeep = 0;

        for (itemsIndex = 0; itemsIndex < itemsLength; itemsIndex += 1) {
            item = items[itemsIndex] || {};
            offerToThem = item.offerToThem || false;
            valueToMe = item.valueToMe || 0;
            if (!offerToThem) {
                totalValueIKeep += valueToMe;
            }
        }
        this.writeLog('totalValueIKeep', totalValueIKeep);
        return totalValueIKeep;
    }

    /*
        set the items offerToThem property to false
        however, we do not want to be greedy
        so we can still offer them the items
        that have no value to me
    */
    resetItemsOfferToThem (items, greedy) {
        items = items || [];
        greedy = greedy || false;

        var item = null,
            itemsLength = items.length || 0,
            itemsIndex = 0,
            offerToThem = false,
            valueToMe = 0;

        for (itemsIndex = 0; itemsIndex < itemsLength; itemsIndex += 1) {
            item = items[itemsIndex];
            valueToMe = item.valueToMe || 0;
            offerToThem = false;
            if (!greedy) {
                if (valueToMe === 0) {
                    offerToThem = true;
                }
            }
            item.offerToThem = offerToThem;
        }
    }

    getTakeTheirOffer () {
        var takeTheirOffer = false;

        if (this.offerTotalValueToMe === 0) {
            // this.writeLog('offerTotalValueToMe', this.offerTotalValueToMe);
            this.writeLog('offerResult', 'REJECTING OFFER (WORST)', 1);
            takeTheirOffer = false;
        } else if (this.itemsTotalValueToMe === this.offerTotalValueToMe) {
            // they are offering you the best offer take it $10
            this.writeLog('offerResult', 'TAKING OFFER (FIRST BEST)', 1);
            takeTheirOffer = true;
        }
        
        // accept less money as the offers continue
        if (!takeTheirOffer && this.offerTotalValueToMe > this.acceptOfferMinValueToMe) {
            // if (this.offerTotalValueToMe >= (this.itemsTotalValueToMe - (this.roundIndex))) {
                this.writeLog('offerTotalValueToMe', this.offerTotalValueToMe, 1);
                this.writeLog('itemsTotalValueToMe', this.itemsTotalValueToMe, 1);
                this.writeLog('roundIndex', this.roundIndex, 1);
                this.writeLog('offerResult', 'TAKING OFFER', 1);
                takeTheirOffer = true;
            // }
        }
        return takeTheirOffer;
    }


    initItemsOfferToThem () {
        var items = this.items || [],
            item = null,
            itemsLength = items.length || 0,
            itemsIndex = 0,
            offerToThem = false,
            offerToThemIndex = 0,
            offeredToMe = false,
            offeredToMeCount = 0,
            itemsTotalValueIKeep = 0,
            randomIndex = 0,
            randomItemIndex = 0,
            randomMax = 100;

        this.sortItemsByValueToMe(items);

        this.resetItemsOfferToThem(items);

        offerToThemIndex = 0;
        for (itemsIndex = 0; itemsIndex < itemsLength; itemsIndex += 1) {
            item = items[itemsIndex] || {};
            offerToThem = item.offerToThem || false;
            offeredToMe = item.offeredToMe || false;
            offeredToMeCount = item.offeredToMeCount || 0;
            if (!offerToThem) {
                if (offerToThemIndex < this.roundsIndex) {
                    offerToThemIndex += 1;
                    item.offerToThem = true;
                }
            }
            itemsTotalValueIKeep = this.getItemsTotalValueIKeep(items);
            if (itemsTotalValueIKeep < this.acceptOfferMinValueToMe) {
                item.offerToThem = false;
                break;
            }
        }


        // if (itemsTotalValueIKeep < this.acceptOfferMinValueToMe) {
        //     // try giving them the less valuable items
        //     this.resetItemsOfferToThem(items);
        //     offerToThemIndex = 0;
        //     for (itemsIndex = 0; itemsIndex < itemsLength; itemsIndex += 1) {
        //         item = items[itemsIndex] || {};
        //         offerToThem = item.offerToThem || false;
        //         if (!offerToThem) {
        //             if (offerToThemIndex < this.roundsIndex) {
        //                 offerToThemIndex += 1;
        //                 item.offerToThem = true;
        //             }
        //         }
        //     }
        //     itemsTotalValueIKeep = this.getItemsTotalValueIKeep(items);
        // }
        

        // make sure I keep more than my minumum
        // offer them the more expensive items
        // if (itemsTotalValueIKeep < this.acceptOfferMinValueToMe) {
        //     this.resetItemsOfferToThem(items);

        //     for (itemsIndex = (itemsLength - 1); itemsIndex >= 0; itemsIndex -= 1) {
        //         item = items[itemsIndex] || {};
        //         if (!item.offerToThem) {
        //             item.offerToThem = true;
        //             break;
        //         }
        //     }
        //     itemsTotalValueIKeep = this.getItemsTotalValueIKeep(items);
        // }

        // make sure I keep more than my minumum
        // if I have made it this far, just offer them a random item
        // randomIndex = 0;
        // randomMax = 10;
        // while (itemsTotalValueIKeep < this.acceptOfferMinValueToMe) {
        //     randomIndex += 1;
        //     if (randomIndex > randomMax) {
        //         break;
        //     }
        //     this.resetItemsOfferToThem(items);
        //     randomItemIndex = this.getRandomInt(itemsLength);
        //     this.writeLog('randomItemIndex', randomItemIndex);
        //     item = items[randomItemIndex] || {};
        //     item.offerToThem = true;
        //     itemsTotalValueIKeep = this.getItemsTotalValueIKeep(items);
        // }

        // make sure I keep more than my minumum
        // itemsTotalValueIKeep = this.getItemsTotalValueIKeep(items);
        if (itemsTotalValueIKeep < this.acceptOfferMinValueToMe) {
            this.writeLog('endInitItemsOfferToThem', 'itemsTotalValueIKeep < acceptOfferMinValueToMe');
            this.resetItemsOfferToThem(items);
        }

        // sort the items back to the original order
        this.sortItemsBySortIndex(this.items);
    }

    getCounterOfferFromItems () {
        var items = this.items || [],
            item = null,
            itemsLength = items.length || 0,
            itemsIndex = 0,
            offerToThem = false,
            countsIndex = 0,
            myCounterOffer = null;

        myCounterOffer = this.counts.concat();
        for (itemsIndex = 0; itemsIndex < itemsLength; itemsIndex += 1) {
            item = items[itemsIndex] || {};
            offerToThem = item.offerToThem || false;
            countsIndex = item.countsIndex || 0;

            if (offerToThem) {
                myCounterOffer[countsIndex] -= 1;
            }
        }
      	return myCounterOffer;
    }

    go (offer) {
        var result,
            takeTheirOfferResult,
            myCounterOffer = this.counts.concat(),
            items = this.items || [],
            resultDecided = false,
            takeTheirOffer = false;

        if (!offer) {
            this.resetItemsOfferToThem(items);
            resultDecided = true;
            takeTheirOffer = false;
            myCounterOffer = this.getCounterOfferFromItems();
            this.writeLog('myFirstOffer', myCounterOffer, 1);
        } else {
            this.writeLog('offer', offer, 1);
            this.acceptOfferMinValueToMe -= 1;
            this.resetOfferItemsOfferedToMe();
            this.resetOfferItemsOfferToThem();
            this.initItemsWithOffer(offer);
            this.initOfferTotalValueToMe();

            takeTheirOffer = this.getTakeTheirOffer();

            if (takeTheirOffer) {
                resultDecided = true;
                myCounterOffer = takeTheirOfferResult;
            }

            // if I am not taking the offer
            // and it is the last round just give up
            // I still need to return an offer so
            // just counter offer with the best offer for me
            if (!takeTheirOffer && !this.iGoFirst && this.roundsToGo === 1) {
                this.writeLog('offerResult', 'REJECTING OFFER (LAST)', 1);
                resultDecided = true;
                // concat is used to create a clone of counts
                myCounterOffer = this.counts.concat();
            }

            if (!resultDecided) {
                this.initItemsOfferToThem();

                myCounterOffer = this.getCounterOfferFromItems();
                this.writeLog('myCounterOffer', myCounterOffer, 1);
            }
        }

        result = myCounterOffer;
        this.onRoundFinished();
        return result;
    }
};