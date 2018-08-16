const sortValueSystem = ( objects ) => {
  objects.sortedByValues.sort( 
    ( a, b ) => {
      return a.value - b.value;
    }
  )
  objects.sortedByValues.forEach(
    ( sortedObject, index ) => {
      objects[ sortedObject.index ] = index;
    }
  )
  return objects;
}

const ALPHA = 2;
const LIMIT = 12;
class ValueSystem {
  constructor( counts, values, log ){
    if( !counts || !values || counts.length !== values.length )
      throw "counts or values are inconsistent";
    const objects = {
      sortedByValues: []
    }
    
    values.forEach(( value, i ) => {
      objects.sortedByValues.push({
        count: counts[i],
        value: value,
        index: i
      });
      objects[i] = i
    });

    this.values = values;
    this.counts = counts;
    this.log = log;
    this.objects = sortValueSystem( objects );
    this.createTotal();
  }

  createTotal(){
    this.total = this.objects.sortedByValues.reduce(
      ( accumulator, currentObject, currentIndex ) => {
        const value = currentObject.value < 0 ? 
          -currentObject.value : currentObject.value;
        return accumulator + value * this.counts[currentIndex];
      }, 0
    );
  }
  equals( otherValueSystem ) {
    return JSON.stringify( this ) === JSON.stringify( otherValueSystem );
  }

  scale( value ) {
    this.objects.sortedByValues.forEach(
      ( sortedObject ) => {
        sortedObject.value = sortedObject.value * ( value / this.total );
      }
    )
    this.createTotal();
  }

  sortAndTotal() {
    this.objects = sortValueSystem( this.objects );
    this.createTotal();
  }
  updateObjects( objects ) {
    this.objects = {
      ...this.objects,
      ...objects
    }
    this.sortAndTotal();
  } 

  getSortedObjectFromIndex( i ) {
    return [ this.objects.sortedByValues[ this.objects[i] ], this.objects[i] ];
  }

  getValueForCount( counts ) {
    return counts.reduce( 
      ( accumulator, count, currentIndex ) => {
        accumulator += this.values[currentIndex] * count;
        return accumulator;
      }, 0
    );
  }
  getValueForCounter( counts ) {
    return counts.reduce( 
      ( accumulator, count, currentIndex ) => {
        accumulator += this.values[currentIndex] * ( this.counts[currentIndex] - count );
        return accumulator;
      }, 0
    );
  }
  clone() {
    return {
      ...this
    }
  }
}

module.exports = class {
  constructor(me, counts, values, max_rounds, log){
    this.me = me;
    this.rounds = max_rounds;
    this.max_rounds = max_rounds;
    this.log = log; 
    this.valueSystem = new ValueSystem( counts, values, log );
    this.oppositionValueSystem = new ValueSystem( 
      counts, values.slice().fill(this.valueSystem.total), log 
    );
    this.oppositionValueSystem.scale( this.valueSystem.total );
    this.currentOffer = [ ...this.oppositionValueSystem.counts ];
  }
  offer(o){
    if( o ) this.analyzeOffer( o );
    return this.currentOffer;
  }
  analyzeOffer(o){
    const that = this;
    const ourObjects = this.valueSystem.objects;
    const oppositionObjects = this.oppositionValueSystem.objects;

    const valueGiven = this.valueSystem.getValueForCount(o);
    const valueLost = this.valueSystem.getValueForCounter(o);

    if( valueGiven > valueLost ) {
      this.currentOffer = undefined;
      return;
    }
    o.forEach(
      ( count, index ) => {
        const coreOppositionObject = oppositionObjects.sortedByValues[ oppositionObjects[index] ];
        const coreOurObject = ourObjects.sortedByValues[ ourObjects[index] ];
        coreOppositionObject.value =  coreOppositionObject.value - 
          (
            ( count * ALPHA ) / 
            ( coreOurObject.count * this.valueSystem.total  )
          ) * ( this.max_rounds / this.rounds );
      }
    );
    this.oppositionValueSystem.sortAndTotal();
    this.oppositionValueSystem.scale( this.valueSystem.total );
    this.rounds--;
    this.createOffer();
  }

  createOffer() {
    const oppositionObjects = this.oppositionValueSystem.objects;
    const ourObjects = this.valueSystem.objects;
    const valueDifference = this.valueSystem.values.slice();
    this.currentOffer = this.currentOffer || this.valueSystem.counts;
    oppositionObjects.sortedByValues.forEach(
      ( sortedByValue, index ) => {
        valueDifference[ sortedByValue.index ] = 
          ( this.valueSystem.getSortedObjectFromIndex( sortedByValue.index )[0].value - sortedByValue.value); 
      }
    );

    const diffValueSystem = new ValueSystem( this.valueSystem.counts, valueDifference );
    const diffSortedByValues = diffValueSystem.objects.sortedByValues.slice();
    let i = 0, j = diffSortedByValues.length - 1;
    const toKeep = this.currentOffer.slice().fill(0), toGive = this.currentOffer.slice().fill(0);
    while ( i<j ) {
      const countJ = diffSortedByValues[j].count, countI = diffSortedByValues[i].count;
      let valueJ = diffSortedByValues[j].value, valueI = diffSortedByValues[i].value;
      valueI = ( valueI < 0 ) ? -valueI : valueI;
      valueJ = ( valueJ < 0 ) ? -valueJ : valueJ;
      let trials = 0;
      if( valueJ > valueI ) {
        const count = Math.floor( valueJ/valueI );
        if( count > countI ) {
          toKeep[i] = 0;
        } else {
          toKeep[i] = countI - count;
        }
        toKeep[j] = Math.ceil( valueI * countJ / valueJ );
        diffSortedByValues[j].count -= toKeep[j];
        diffSortedByValues[i].count -= toKeep[i];
      } else {
        const count = Math.floor( valueI/valueJ );
        if( count > countJ ) {
          toKeep[j] = countJ;
        } else {
          toKeep[j] = count;
        }

        toKeep[j] = Math.ceil( valueJ * countI / valueI );
        diffSortedByValues[j].count -= toKeep[j];
        diffSortedByValues[i].count -= toKeep[i];
      }
      if( diffSortedByValues[j].count <= 0 ) j--;
      if( diffSortedByValues[i].count <= 0 ) i++;
      trials++;
      if( trials >= LIMIT ) {
        j--, i++, trials = 0;
      }
    }
    this.currentOffer = this.valueSystem.counts.reduce(
      (accum, value, i ) => {
        return accum.concat( toKeep[i] > value ? value : toKeep[i] );
      }, []
    );
    return this.currentOffer;
  }
}