'use strict'; /*jslint node:true*/

module.exports = class Agent {
  constructor(me, counts, values, max_rounds, log) {
    this.me = me
    this.counts = counts
    this.values = values
    this.max_rounds = max_rounds
    this.rounds = max_rounds
    this.log = log
    this.total = this.o_sum(counts)
    this.o_history = []
    this.my_history = []
  }

  o_sum(o) {
    return o.reduce((acc, c, i) => { return acc + this.values[i] * c }, 0)
  }

  offer(o) {
    this.rounds--;
    // Рассматриваем поступающее предложение,
    // С каждым раундом понижаем сумму соглашения на сделку до 80% от максимальной
    // Для max_rounds=5 и total=10 это будет: 10, 9, 9, 8, 8
    // Если предложение нам подходит то соглашаемся
    if (o) {
      this.o_history.push(o)
      let round_accept_minimal = Math.ceil(this.total * (0.8 + this.rounds * (0.2 / this.max_rounds)))
      if (this.rounds == 0 && this.me == 1) {
        // Если это последний ответ, согласимся и на 40%.
        // Против нас скорее всего играет очень жадный алгоритм, здесь он скорее всего получит выгоды больше меня
        // Делается это в расчёте на то, что с другими участниками он не заключит договор
        round_accept_minimal = Math.ceil(this.total * 0.4)
      }
      if (this.o_sum(o) >= round_accept_minimal) {
        return undefined
      }
    }

    // Если это моё первое предложение, то забираю всё
    if (!this.my_history.length) {
      this.my_history.push(this.counts.slice())
      return this.counts.slice()
    }

    // выкидываем из предыдущего предложения самую дешёвую шмотку
    let last_offer = this.my_history[this.my_history.length - 1].slice()
    let my_offer = this.pop_cheap(last_offer.slice())

    // но мы не должны продешевить, если сделка для нас слишком дешевая возвращаем предыдущую сделку
    let offer_sum_minimal = Math.ceil(this.total * (0.8 + this.rounds * (0.2 / this.max_rounds)))
    // Если это последнее предложение, согласимся и на 50%
    if ((this.rounds == 1 && this.me == 1) || (this.rounds == 0 && this.me == 0)) {
      offer_sum_minimal = Math.ceil(this.total * 0.5)
    }
    // если это последнее предложение и предложение всё равно больше 50%,
    // попробуем предложить среднюю сделку
    if ((this.rounds == 1 && this.me == 1) || (this.rounds == 0 && this.me == 0)) {
      if (this.o_sum(my_offer) < offer_sum_minimal) {
        my_offer = this.leave_avg()
      }
    }

    // иначе отдавай последнее
    if (this.o_sum(my_offer) < offer_sum_minimal) {
      this.my_history.push(last_offer.slice())
      return last_offer.slice()
    }

    // возвращаем предложение
    this.my_history.push(my_offer.slice())
    return my_offer.slice()
  }

  leave_avg() {
    let offer = this.counts.slice()
    offer[this.values.indexOf(Math.max(...this.values))] -= 1
    offer.slice().forEach((c, i) => {
      if (this.values[i] == 0) {
        offer[i] = 0
      }
    })
    return offer
  }

  pop_cheap(o) {
    o = o.slice()
    let min_price = Infinity
    let min_price_index
    o.forEach((c, i) => {
      if (c != 0) {
        if (this.values[i] < min_price) {
          min_price = this.values[i]
          min_price_index = i
        }
      }
    })
    o[min_price_index] -= 1
    return o.slice()
  }
};
