'use strict'; /*jslint node:true*/

const k=0.75;

function shuffle(a)
{
	for(let i=0;i<a.length;++i)
	{
		let j=Math.floor(Math.random()*(i+1));
		[a[i],a[j]]=[a[j],a[i]];
	}
	return a;
}

function sum(a,values)
{
	return a.reduce((a,v,i)=>a+v*values[i],0);
}

module.exports=class {
	constructor(me,counts,values,max_rounds,log)
	{
		this.counts=counts;
		this.values=values;
		this.max_rounds=this.rounds=max_rounds;
		this.log=log;
		log('me');
		this.total=sum(counts,values);
		this.successtotal=this.total*k;
		this.rnd=counts.reduce((a,v,i)=>{
			for(let j=0;j<v;++j)
				a.push(i);
			return a;
		},[]);
	}
	offer(o){
		this.log(`${this.rounds} rounds left`);
		let firststep=this.rounds--===this.max_rounds;
		if(o)
		{
			let s=sum(o,this.values);
			if(s===this.total || (!firststep && s>=this.successtotal))
				return;
		}
		else
			return this.counts.slice();
		shuffle(this.rnd);
		o=Array.from({length:this.counts.length},_=>0);
		let s=0;
		for(let i=0;i<this.rnd.length;++i)
		{
			let j=this.rnd[i];
			s+=this.values[j];
			++o[j];
			if(s>=this.successtotal && i>1)
				break;
		}
		return o;
	}
};