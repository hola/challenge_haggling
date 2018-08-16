'use strict'; /*jslint node:true*/
//while true; do node haggle.js --log=$(date +%s).json --id madzhugin@:0 app.js wss://hola.org/challenges/haggling/arena/standard; done

module.exports = class Agent {
    
    constructor (
            me,// — 0, если ваша очередь первая, или 1, если вторая.
            counts,// — массив целых чисел, содержащий количество объектов каждого типа. Он содержит от 2 до 10 элементов.
            values,// — массив целых чисел такой же длины, что и counts, описывающий ценность объекта каждого из типов для вас.
            max_rounds,// — число раундов переговоров (каждый раунд состоит из двух реплик).
            log// — функция, которую можно вызывать для отладочного вывода (console.log работать не будет).
        )
    {
        
        this.config = {
            nul: 0, // порог принятия последнего шанса
            accept: 5, // порог принятия оффера в регрессию
            generosity: true, // если true - не требуем себе бессмысленные предметы
            speedAvg: 4
        }
				
        // начальная иницаилазация
        this.args = {
            counts: counts,
            values: values,
            rounds: max_rounds
        }
        this.data = {}
        this.total = {
            cnt: 0,
            val: 0,
            avg: 0
        }
        this.state = {
            reassessmentCnt: 0
        }
        for (let i = 0; i < counts.length; i++) {
            this.data[i] = {
                cnt: counts[i],
                val: values[i],
                aval: 0
            }
            this.total.cnt += counts[i];
            this.total.val += counts[i]*values[i];
        }
        
        this.rounds = max_rounds;
        this.log = log;
				
        // расчет стоимостей противника
        this.total.avg = this.total.val/this.total.cnt;
        for (var sku in this.data) {
            this.data[sku].aval = this.total.avg;
        }
		
        
        this.initOffers(); // инициализируется начальные предложения
    }
    
    initOffers ()
    {
        this.offers = {
                regres: [], regressNext: [], // регрессия собственных оффeров
                hisBestO: {o:[],a:{v:0,av:10}}
            };
            
        // просто набьем все варианты
        var tres = [[]];
				
		for (let sku in this.data) {
            var cnt = this.data[sku].cnt;
            var tres_ = [];
            for (let c = 0; c<=cnt; c++) {
                for (let i = 0; i<tres.length; i++) {
                    var t = tres[i].slice();
                    t.push(c);
                    tres_.push(t);
                }
            }
            tres = tres_.slice();
        }
        
        // добаввим офферсы в регрессию оферов
        for (let i = 0; i<tres.length; i++) {
          this.addOinCollect(tres[i]);
        }
        this.state.reassessmentCnt = 0; // первая переоценка вывполнена
                                        // количество переоценок необходим для расчета
                                        // предполагаемых альтернативных стоимостей
                                        // скользящим средним
        
        // сортируем коллекцию
        this.sortCollect();
        this.offers.myO = this.offers.regres[0];
        

    }
		
		
    reassessmentCollect ()
    {
        // перебираем коллекцию и расчитываем новые стоимости
        for (let i = 0; i<this.offers.regres.length; i++) this.offers.regres[i].a = this.valO(this.offers.regres[i].o);
        // сортируем коллекцию
        this.sortCollect();
    }
    
    // Идущий навстречу - консервативная щедрая сортировка - чем больше для нас - тем лучше
    // при прочих равных, чем больше для него, тем лучше
    sortCollect ()
    {
        var dems = this.rounds;
        this.offers.regres.sort(function(a, b){
            
            
            if (dems > 4) dems=4;
            if (dems < 1) dems=1
            
            if (a.a.v+a.a.av/dems > b.a.v+b.a.av/dems) return 1;
            if (a.a.v+a.a.av/dems < b.a.v+b.a.av/dems) return -1;
            // чем больше наша ценность
            if (a.a.v > b.a.v) return 1;
            if (a.a.v < b.a.v) return -1;
            // чем больше его ценность, тем лушче
            if (a.a.av > b.a.av) return 1;
            if (a.a.av < b.a.av) return -1;
            
            return 0;
        }).reverse();
        
    }
    
    
    addOinCollect (o) // добавляет оффер в коллекцию
    {
        var a = this.valO(o); // Вычисляем стоимость оффера
        if (a.v > this.config.accept) {
            // коллекцию достаточно просто перебрать
            var sign = o.join('_');
            // может мы хотим забрать всё
            if (sign == this.args.counts.join('_')) return;
            
            // пропустим офферы с нулевыми предметами
            if (this.config.generosity)
                    for (let sku = 0; sku<o.length; sku++)
                            if (this.data[sku].val == 0 && o[sku]>0) return;
            
            for (let i = 0; i<this.offers.regres.length; i++) {
                var offer = this.offers.regres[i];
                if (offer.a.v == a.v // цена совпаадает - возможно совпадают и офферы
                        && offer.o.join('_') == sign
                    ) return;
            }
            
            this.offers.regres.push({o:o,a:a});
        }
    }
    
    valO (o) // возвращает цену o
    {
        var a = {v:0, av:0};
        for (let sku = 0; sku<o.length; sku++) {
            a.v=a.v+this.data[sku].val*o[sku];
            a.av=a.av+this.data[sku].aval*(this.data[sku].cnt-o[sku]);
        }
        return a;
    }
    
    // перевычисляет альтернативную стоимость
    recallcAVal (o) {

        var sku0 = []; // список sku со стоимостью 0
        var sku1 = []; // список sku со стоимостью 1
        var sku2 = []; // список sku со взвешенной стоимостью
        
        var sku0cnt = 0; // количество предметов
        var sku1cnt = 0;
        var sku2cnt = 0;
        
        var sku0prc = 0; // цены предметов
        var sku1prc = 1;
        var sku2prc = 10;
        
        for (let sku = 0; sku<o.length; sku++) {
            if (o[sku] == 0) { // эти предметы он требует себе
                sku2.push(sku);
                sku2cnt = sku2cnt+this.data[sku].cnt;
            } else if (o[sku] == this.data[sku].cnt) { // эти предметы он отдает мне
                sku0.push(sku); // будем считать что для него они 0
                sku0cnt = sku0cnt+this.data[sku].cnt;
            } else { // эти предметы он делит между нами - будем считать что у них минимальная стоимость
                sku1.push(sku);
                sku1cnt = sku1cnt+this.data[sku].cnt;
            }
        }
        
        sku2prc = (10-sku1cnt*sku1prc)/sku2cnt;

        // теперь мы можем переопределить стоимости в data
        for (let i = 0; i<sku0.length; i++) {
            var sku = sku0[i];
            this.data[sku].aval = (this.data[sku].aval*this.state.reassessmentCnt+sku0prc*this.config.speedAvg)/(this.state.reassessmentCnt+this.config.speedAvg);
        }
        for (let i = 0; i<sku1.length; i++) {
            var sku = sku1[i];
            this.data[sku].aval = (this.data[sku].aval*this.state.reassessmentCnt+sku1prc*this.config.speedAvg)/(this.state.reassessmentCnt+this.config.speedAvg);
        }
        for (let i = 0; i<sku2.length; i++) {
            var sku = sku2[i];
            this.data[sku].aval = (this.data[sku].aval*this.state.reassessmentCnt+sku2prc*this.config.speedAvg)/(this.state.reassessmentCnt+this.config.speedAvg);
        }
        
        if (this.config.speedAvg > 1) this.config.speedAvg = this.config.speedAvg-1;
    }
    
    offer (o)
    {
        this.rounds--;
        
        if (this.offers.regres.length == 0) {
            this.offers.regres = this.offers.regressNext.slice();
            this.offers.regressNext = [];
        }
        if (o) { // поступило предложение
            // тут надо обновить наше текущее предложение
            // сначала обновим представление о ценности
            this.recallcAVal(o);
            /// переоценим регрессию
            this.reassessmentCollect();
            
            //
            //
            //
            this.offers.hisO = {
                o: o.slice(),
                a: this.valO(o)
            };
            //

            this.offers.myO = this.offers.regres.shift();
            this.offers.regressNext.push(this.offers.myO);

            if (this.offers.hisO.a.v >= this.offers.hisBestO.a.v) { // но может оно лучшее,
                                                                   // из того что он предлагал
                this.offers.hisBestO = {
                        o: o.slice(),
                        a: this.valO(o)
                    };
            }
        }
        // подготовим наше текущее предложение
        o = this.offers.myO.o.slice();
        if (this.rounds == 0) { // роундов больше не осталось
            if (this.offers.hisO.a.v > this.config.nul) return; // а его предложение лучше 0 - примем его
        } else if (this.rounds == 1) { // последний раунд
            if (this.offers.hisBestO.a.v > this.config.nul) { // и лучшее из того что он предлагал больше условного нуля
                o = this.offers.hisBestO.o.slice(); // вернемся к его лучшем предложения
            }
        }
        return o;
    }
    
    
};
