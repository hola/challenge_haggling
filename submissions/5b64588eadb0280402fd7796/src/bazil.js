'use strict'; /*jslint node:true*/

module.exports = class Agent {
    
    constructor(me, counts, values, max_rounds, log){
        // Число предметов
        this.counts = counts;
        // Наши ценности предметов
        this.values = values;
        // Число оставшихся раундов
        this.rounds = max_rounds;
        // Функция вывода
        this.log = log;
        // Граница принятия предложения и шаг её сдвига
        this.edge = 0.95;
        this.edge_step = 0.4/max_rounds;
        // Значимость наших "ненужностей"
        this.coeff_me = 5;
        // Значимость предполагаемых "нужностей" оппонента
        this.coeff_op = 2;
        
        // Подсчёт суммарной стоимости и суммарного количества
        this.total = 0;
        this.total_cnt = 0;
        for (let i = 0; i<counts.length; i++) {
            this.total += counts[i]*values[i];
            this.total_cnt += counts[i];
        }
        
        // Коэффициенты "ненужности" для нас
        this.unnecessary = new Array();
        for (let i = 0; i<counts.length; i++) {
            this.unnecessary.push(1 - this.values[i]*this.counts[i]/this.total);
        }
        
        // Получаем массив возможных ценностей для оппонента (probably_values)
        this.probably_values = new Array();
        var tmp = new Array();
        var lims = new Array();
        for (let i=0;i<counts.length;i++) {
            let tmp_val = Math.floor(this.total/counts[i])
            tmp.push(i == 0 ? tmp_val : 0);
            lims.push(tmp_val);
        }
        
        while (true) {
            let t = 0;
            let res = new Array();
            for (let i=0;i<counts.length;i++) {
                t += counts[i]*tmp[i];
                res.push(tmp[i]);
            }
            if (t == this.total)
                this.probably_values.push(res);

            tmp = incA(tmp,lims,0);
            if (tmp == undefined)
                break;
        }
    }
    
    offer(o){
        this.log(`${this.rounds} rounds left`);
        this.rounds--;
        
        if (o) {
            // Анализ предложения оппонента на возможность принятия
            let sum = 0;
            let cnt = 0;
            
            for (let i = 0; i<o.length; i++) {
                sum += this.values[i]*o[i];
                cnt += o[i];
            }
            if (sum>=this.total*this.edge)
                return;
            
            // Ищем наборы ценностей оппонента, дающие минимальную стоимость полученного предложения для него
            let cur_value = this.total;
            let pv_min = new Array();
            for (let i=0;i<this.probably_values.length;i++) {
                if (getTotal(o,this.probably_values[i]) < cur_value) {
                    cur_value = getTotal(o,this.probably_values[i]);
                    pv_min = [this.probably_values[i]];
                } else {
                    pv_min.push(this.probably_values[i]);
                }
            }
            // Теперь это новый массив ценностей оппонента
            this.probably_values = copyArray(pv_min);
            
            // Формируем предложение
            o = new Array();
            
            let necessary = getNecessary(getMeans(this.probably_values), this.counts, this.total);
            if (necessary == undefined) {
                necessary = new Array();
                for (let i=0;i<this.counts.length;i++)
                    necessary.push(0);
            }
            
            let offer_total = 0;
            
            for (let i=0;i<this.counts.length;i++) {
                let tmp_val = this.counts[i]*(this.coeff_me*this.unnecessary[i]+this.coeff_op*necessary[i])/(this.coeff_me+this.coeff_op);
                o.push(this.counts[i] - (tmp_val < 0.55 ? Math.floor(tmp_val) : Math.ceil(tmp_val)));
                
                offer_total += o[i]*this.values[i];
            }
            
            // Пресекаем альтруизм
            if (offer_total < this.total*this.edge) {
                let offer_max = getMax(this.values);
                for (let i = 0; i<o.length; i++) {
                    if (this.values[i] == offer_max && o[i] < this.counts[i])
                        o[i]++;
                }
            }
        } else {
            // Если первое предложение от нас - оставляем себе всё по максимуму
            o = this.counts.slice();
            for (let i = 0; i<o.length; i++) {
                if (!this.values[i])
                    o[i] = 0;
            }
        }
        
        // Заранее полагая, что предложение будет отвергнуто - ищем наборы ценностей оппонента, где стоимость остающихся вещей для него больше некоторой границы (которую будем двигать вместе с нашей)
        let pv_0 = new Array();
        for (let i=0;i<this.probably_values.length;i++) {
            if (getTotal(o,this.probably_values[i]) > this.total*(1-this.edge))
                pv_0.push(this.probably_values[i]);
        }
        // Теперь это новый массив ценностей оппонента
        this.probably_values = copyArray(pv_0);
        
        // Сдвиг границы принятия предложения
        this.edge -= this.edge_step;
        
        // this.log(`my_offer = ${o}`);
        // this.log(`p_len = ${this.probably_values.length}`);
        return o;
    }
};

// Вычисляем коэффициент "нужности" для оппонента для балансировки с нашим коэффициентом "ненужности"
function getNecessary(probably_values, counts, total) {
    if (probably_values == undefined)
        return undefined;
    
    let edge = getMean(probably_values);
    let max = getMax(probably_values);
    
    // for (let i=0;i<probably_values.length;i++) {
        // if (max == 0)
            // probably_values[i] = 0;
        // else
            // probably_values[i] = probably_values[i]*counts[i]/total;
    // }
    
    for (let i=0;i<probably_values.length;i++) {
        if (probably_values[i]<=edge || max-edge<0.000001)
            probably_values[i] = 0;
        else
        {
            probably_values[i] = (probably_values[i]-edge)/(max-edge);
        }
    }
    
    return probably_values;
}

// "Поразрядная" инкрементация i-го элемента массива согласно ограничений
function incA (a, lims, i) {
    if (i<a.length) {
        if (a[i]+1<=lims[i]) {
            a[i]++;
            return a;
        }
        else {
            a[i] = 0;
            return incA(a,lims,i+1);
        }
    }

    return undefined;
}

// Копируем массив
function copyArray(a) {
    let res = new Array();
    for (let i=0;i<a.length;i++) {
        res.push(a[i]);
    }
    return res;
}

// Вычисляем "итого" по двум массивам
function getTotal(a,b) {
    let total = 0
    for (let i=0;i<a.length;i++) {
        total += a[i]*b[i];
    }
    return total;
}

// Средние значения по массиву массивов
function getMeans(a) {
    if (a == undefined || a.length == 0)
        return undefined;

    let res = new Array(a[0].length);
    for (let i=0;i<a.length;i++) {
        for (let j=0;j<a[i].length;j++) {
            if (res[j] == undefined)
                res[j] = 0;
            res[j] += a[i][j];
        }
    }
    for (let i=0;i<res.length;i++)
        res[i] = res[i]/a.length;

    return res;
}

// Среднее
function getMean(a) {
    if (a == undefined)
        return undefined;

    let res = 0;
    for (let i=0;i<a.length;i++) {
        res += a[i];
    }
    return res/a.length;
}

// Максимальный элемент
function getMax(a) {
    if (a == undefined)
        return undefined;

    let res = 0;
    for (let i=0;i<a.length;i++) {
        if (res<a[i])
            res = a[i];
    }
    return res;
}

// Индекс максимального элемента
function getMaxIdx(a) {
    if (a == undefined || a.length <= 1)
        return undefined;

    let res = 0;
    for (let i=1;i<a.length;i++) {
        if (a[res]<a[i])
            res = i;
    }
    return res;
}