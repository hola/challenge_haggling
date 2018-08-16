using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Evolve
{
    class ScoreData : IComparable<ScoreData>
    {
        public int myScore = 0;
        public int oppScore = 0;

        public int CompareTo(ScoreData other)
        {
            if (CompareScore > other.CompareScore)
            {
                return 1;
            }
            if (CompareScore < other.CompareScore)
            {
                return -1;
            }
            return 0;
            //if (myScore > other.myScore)
            //{
            //    return 1;
            //}
            //if (myScore < other.myScore)
            //{
            //    return -1;
            //}
            //if (oppScore > other.oppScore)
            //{
            //    return -1;
            //}
            //if (oppScore < other.oppScore)
            //{
            //    return 1;
            //}
            //return 0;
        }

        public int CompareScore
        {
            get
            {
                if (myScore >= oppScore)
                {
                    return myScore + (int)Math.Floor((myScore - oppScore) / 3.0);
                }
                else 
                {
                    return myScore - (int)Math.Floor((oppScore - myScore) / 2.0);
                }
            }
        }
    }
}
