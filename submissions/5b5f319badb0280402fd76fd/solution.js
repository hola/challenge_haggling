module.exports = class Trader {
    constructor(me, counts, values, max_rounds, log) {
       this.isMakingFirstOffer = me
       this.amounts = counts
       this.values = values
       this.max_rounds = max_rounds

       this.products = counts.reduce((acc, amount, index) => {
           return acc.concat({
               index,
               value: values[index],
               amount,
               opponentValue: values[index],
           })
       }, [])

       this.allVariations = {
           byValue: this.getAllVariations()
       }

       this.productsByValue = [...this.products].sort((a, b) => b.value - a.value)

       this.state = {
           minValueSum: 9,
           currentRound: 1,
       }
   }

   offer(o) {
       if (o === undefined) {
           return this.getOptimizedOffer()
       }
       this.state.currentRound++
       const offerValue = this.getOfferValue(o) 

       if (offerValue >= 7 - this.state.currentRound/1.5) {
           return undefined
       } else {
           const offer = this.getOptimizedOffer()
           this.state.minValueSum--
           return offer
       }
   }

   getOptimizedOffer() {
       let result

       for (let value = 10; value >= 4; value--) {
           if (this.allVariations.byValue[value]) {
               let obj = this.allVariations.byValue[value].find(variation => !variation.used && variation.inLimit)

               if (obj) {
                   obj.used = true 
                   result = obj.variation
                   break 
               }
           }
       }
       
       if (!result) {
           const minValue = Math.min(...Object.keys(this.allVariations.byValue))
           result = this.allVariations.byValue[minValue].find(variation => variation.used && variation.inLimit).variation
       }

       return result
       
   }

   getOfferValue(offer) {
       let sum = 0
       for (let i = 0; i < this.products.length; i++) {
           sum += this.products[i].value * offer[i]
       }
       return sum
   }

   getAllVariations() {
       let size = this.products.length
       let direct = new Array(size).fill(1)
       let array = new Array(size).fill(0)
       let status = true
       let allVariations = {}

       while (status) {
           status = false
           for (let i = 0; i < size; i++){
               if (this.products[i].value > 0) {
                   if (direct[i] == 1) {
                       if (array[i] < this.products[i].amount) {

                           status = true
                           for (let j = 0; j < i; j++) direct[j] = (direct[j] + 1) % 2
                           array[i]++
                           break
                       }
                   } else {
                       if (array[i] > 0) {
                           status = true
                           for (let j = 0; j < i; j++) direct[j] = (direct[j] + 1) % 2
                           array[i]--
                           break
                       }

                   }
               } 
           }
           if (!status) continue
           const value = this.getOfferValue(array) 
           if (value < 4) continue
           
           if (allVariations[value]) {
               allVariations[value].push({
                   used: false,
                   inLimit: array.reduce((accumulator, currentValue) => accumulator + currentValue) <= 4,
                   variation: [...array]
               })
           } else {
               allVariations[value] = [{
                   used: false,
                   inLimit: array.reduce((accumulator, currentValue) => accumulator + currentValue) <= 4,
                   variation: [...array]
               }]
           }
           
       }

       return allVariations
   }
}