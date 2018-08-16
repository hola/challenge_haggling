'use strict'; /*jslint node:true*/

module.exports = class Agent {
    constructor(me, counts, values, max_rounds, log){
        
       
        this.counts = counts;
        this.values = values;
        this.rounds = max_rounds;
        this.log = log;
        this.total = 0;
        this.totalbest = 0;
        this.ceny=0;
        this.dobrota=2.5;
        this.jadnost=1.5;
        this.sumpred=0;
        this.iii=0;
        this.colvo=0;
        
        
        for (let i = 0; i<this.counts.length; i++)
        {this.colvo=this.colvo+this.counts[i];}

        for (let i = 0; i<this.counts.length; i++)//
        this.total = this.total+ this.counts[i]*this.values[i];
        
        var values21 = this.values.slice();

       var ceny21 = new Array(this.counts.length);
       
       for (let i =0 ; i<this.counts.length; i++)

        {
        
        var max = values21[0];
        for (let ii = 1; ii < values21.length; ++ii) {
            if (values21[ii] > max) {max = values21[ii];}
    
        }
        for ( let ii = 0; ii < values21.length; ++ii) {
            if (values21[ii] == max) {values21[ii]=-1;
                ceny21 [i]=ii;
            break; }
    
        }


        }


        this.collection=new Array(this.rounds);
         this.collection12= this.counts.slice();
      
       
           for (let i = 0; i<this.collection12.length; i++)
           {
               if (this.values[i]==0)//
               this.collection12[i] = 0;
           }
           this.collection[0] = this.collection12.slice();
        
           ceny21.reverse();
          
           for (let i = 0; i<ceny21.length; i++)
           {
               if (this.values[ceny21[i]]==0)
              {ceny21=ceny21.slice(1);
                  i=i-1;
              }
          }
   
          this.values = values;
          var stop=0;
          var control=10;
          var ii=1;
          var i3 =0;
          for (let i3 =0 ; ii< this.rounds +3 && i3< this.rounds +3; i3++)
            {
                try{
   
         for (let i =0 ; i<ceny21.length; i++)
         {stop=0;
            this.collection12 = this.collection[i3].slice();
            control=0;
       var a =this.collection12[ceny21[i]];
         while (a>0 && stop==0 && ii< this.rounds +3)
         { 
             if (control!=0)
             {
            this.collection12 = this.collection[ii-1].slice();}

            this.collection12[ceny21[i]]=this.collection12[ceny21[i]]-1;
            a =this.collection12[ceny21[i]]; 
           control=0;
            for (let i2 = 0; i2<this.collection12.length; i2++)
            { control=control+ this.collection12[i2]*this.values[i2];}


             if (control>=this.total/this.dobrota && ii< this.rounds +3)
             {
                 
             this.collection[ii] = this.collection12.slice();
             
             ii=ii+1;}
             else {stop=1;}
          }
         
        }}
        catch (e) {}
     
  
          }
  
          for (let i2 = 0; i2<this.collection12.length; i2++)
          this.collection12[i2]=0;
      
          this.collection[ii] = this.collection12.slice();
              this.best=0;//
      
          if (ceny21.length>1)
         {
      
   var umn =1;
    for (let i = 0; i<this.values.length; i++)//
        umn = umn*this.values[i];
    if (  umn!=0)//
    this.collection=this.collection.slice(1);
          }

   
   this.posledniishans = 0;

   this.predposledniishans = 1;


    }
    
    offer(o)
    {
        this.log(`${this.rounds} rounds left`);
        this.rounds--;
        if (o) // 
        {
            if (this.rounds==0)
            {this.predposledniishans = 0; }

            let sum = 0;  
            for (let i = 0; i<o.length; i++)   //
                sum += this.values[i]*o[i];
            if (sum>=this.total/this.dobrota && sum>this.totalbest)  //
            {  //
                this.best=o.slice();
                this.totalbest=sum;
            }

            this.sumpred=0;
            this.collection1 = this.collection[this.iii].slice();
            for (let i = 0; i<this.collection1.length; i++)//
            this.sumpred += this.collection1[i]*this.values[i];
            if (this.sumpred<this.totalbest ||  this.sumpred<this.total/this.dobrota)
            {
                this.iii=0;
            }
           
           
            
            this.sumpred=0;
            this.collection1 = this.collection[this.iii].slice();
            for (let i = 0; i<this.collection1.length; i++)//
            this.sumpred += this.collection1[i]*this.values[i];

            var sumpred21=this.sumpred;
            if (this.iii>0)
            {
            sumpred21=0;
            this.collection1 = this.collection[this.iii-1].slice();
            for (let i = 0; i<this.collection1.length; i++)
            sumpred21 += this.collection1[i]*this.values[i];
            }
            if (this.rounds==0 && this.totalbest!=0)
        {this.sumpred=0;
            this.collection1 = this.best.slice();
            for (let i = 0; i<this.collection1.length; i++)//
            this.sumpred += this.collection1[i]*this.values[i];
        } 

            if (sum>=this.sumpred || sum>= this.total/this.jadnost || sum>=sumpred21 || (this.posledniishans == 1 && sum!=0)) 
            {  //
                
                 return; 
            }
               
        }
        
        if (this.rounds)
        {
            o = this.collection[this.iii].slice();
            this.iii+=1;
            return o;//
        }
        else //
        {    this.posledniishans = 1;

            if (this.predposledniishans ==1)
            {
                if (this.totalbest) 
               {
                   o= this.best.slice();
                   return o;
               }
               else
               {o = this.collection[this.iii].slice();
                   
                           return o;
                   
                   
               }

            }

            else
            {
                o = this.collection[0].slice();
                
                return o;
        

            }
             
            
    
        }
    }
};
