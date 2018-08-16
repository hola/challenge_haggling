'use strict';module.exports=class Agent{constructor(me,counts,values,max_rounds,log){this.c=counts;this.v=values;this.r=max_rounds;this.f=!0;this.i=[]
this.log=log;this.t=0;this.d=1.5;this.n=0;for(let i=0;i<counts.length;i++){this.t+=counts[i]*values[i];if(values[i]!==0){this.n+=values[i]*counts[i]}}
for(let i=0;i<counts.length;i++){if(values[i]!==0){this.i[i]=values[i]*counts[i]/this.n}
else{this.i[i]=0}}
this.m=this.t/2;this.b=this.t/2*(1.3+this.r/10)}
offer(o){this.r--;this.b=this.t/2*(1.3+this.r/10);if(o)
{for(let i=0;i<o.length;i++){if(o[i]==0)
this.i[i]/=this.d}
this.n=0;for(let i=0;i<this.c.length;i++){this.n+=this.i[i]}
for(let i=0;i<this.c.length;i++){this.i[i]/=this.n}
let sum=0;for(let i=0;i<o.length;i++)
sum+=this.v[i]*o[i];if((sum==this.t)||((sum>=this.b)&&!this.f)||((this.r==0)&&(sum>this.m)))
return}
this.f=!1;o=this.c.slice();let sum=this.t;for(let i=0;i<o.length;i++)
{if(this.i[i]!==0){for(let j=0;j<this.c[i];j++){let rnd=Math.random();if(this.i[i]/this.c[i]<rnd){if(sum-this.v[i]<this.b)
break;o[i]-=1;sum-=this.v[i]}
if(sum<this.b)
break}}
else{o[i]-=Math.round(o[i]*Math.random())}}
return o}}