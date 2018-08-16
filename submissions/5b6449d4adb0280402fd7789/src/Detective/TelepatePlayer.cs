#define LOG_OFFERS

using System;

namespace Haggle
{
    public enum TelepateType
    {
        Normal,
        Greed,
        Benevolent
    }

    public class TelepatePlayer
        : IPlayer    
    {
        private readonly TelepateType m_greed = TelepateType.Normal;
        private readonly float AcceptThreshold = 0.9f;
        private readonly float MinEnemyIncomeThreshold = 0.3f;

        private int[] m_counts;
        private int[] m_values;

        private int m_rounds;
        private LogDelegate m_log;
        private int m_maxIncome;

        private int [][] m_allValues;
        private int m_myValuesIndex;
        private OfferHolder [] m_offers;
        private CheckList<string> m_rejectedOffers;
        private OfferHolder m_lastOffer = null;
        private CheckList<int> m_excludedValues;
        

        public TelepatePlayer(TelepateType greed, float acceptThreshold, float minEnemyIncomeThreshold)
        {
            m_greed = greed;
            AcceptThreshold = acceptThreshold;
            MinEnemyIncomeThreshold = minEnemyIncomeThreshold;
        }

        public void Init(object me, int[] counts, int[] values, int max_rounds, LogDelegate log)
        {
            m_counts = counts;
            m_values = values;
            m_rounds = max_rounds * 2;
            m_log = log;

            m_maxIncome = 0;
            int count = 0;

            for (int i = 0; i < counts.Length; i++)
            {
                m_maxIncome += m_counts[i] * values[i];
                count += m_counts[i];
            }

            Generator generator = new Generator(m_counts, 1, count, m_maxIncome);

            int currentSet = -1;
            int currentValues = -1;

            for (int i = 0; i < generator.Combinations.Count; i++)
            {
                if (Utils.ArrayEquals(m_counts, generator.Combinations[i].Item1))
                {
                    currentSet = i;
                    m_allValues = generator.Combinations[currentSet].Item2;

                    for (int j = 0; j < m_allValues.Length; j++)
                    {
                        if (Utils.ArrayEquals(m_allValues[j], m_values))
                        {
                            currentValues = j;
                            break;
                        }
                    }

                    break;
                }
            }

            if (currentSet == -1 || currentValues == -1)
                throw new HaggleException("Data and values not found in generated sets!");

            m_myValuesIndex = currentValues;

            m_rejectedOffers = new CheckList<string>();
            m_excludedValues = new CheckList<int>();
            m_excludedValues.Add(currentValues);

            m_log("I'm telepate player, greed " + m_greed);
        }
         
        public void SetEnemyData(int [] values)
        {
            m_log("Enemy items: " + String.Join(",", values));

            for (int j = 0; j < m_allValues.Length; j++)
            {
                if (!Utils.ArrayEquals(m_allValues[j], values))
                    m_excludedValues.Add(j);
            }

            m_offers = AnalyzerEngine.FindBestOffers(m_counts, m_allValues, m_excludedValues, m_myValuesIndex);

            if (m_greed == TelepateType.Greed)
                Array.Sort(m_offers, (x, y) => x.MyIncome - x.EnemyAverage * 0.1f > y.MyIncome - y.EnemyAverage * 0.1f ? -1 : 1);
            else
                if (m_greed == TelepateType.Benevolent)
                Array.Sort(m_offers, (x, y) => x.MyIncome * 1.1f + x.EnemyAverage > y.MyIncome * 1.1f + y.EnemyAverage ? -1 : 1);
            //else            
                //Array.Sort(m_offers, (x, y) => x.MyIncome + x.EnemyAverage * 0.1f > y.MyIncome + y.EnemyAverage * 0.1f ? -1 : 1);

#if LOG_OFFERS
            m_log("Initial list of offers");

            for (int i = 0; i < m_offers.Length; i++)
                m_log(Utils.Format("{0}: valid: {1}", m_offers[i], ValidOffer(m_offers[i], false)));
#endif

        }

        #if !DEBUG_RIG
        [Bridge.Name("offer")]
        #endif
        public int[] CheckOffer(int[] o)
        {
            if (o != null)
            {
                m_rounds--;

                bool accept = CheckOffer(o, m_rounds);

                if (accept)
                {
                    m_log(Utils.Format("Accepting offer {0}", Utils.StringJoin(",", o)));

                    return null;
                }
            }

            m_rounds--;

            if (m_rounds == 0)
                return m_counts;

            OfferHolder offer = MakeOffer(m_rounds);

            m_log(Utils.Format("[{0}] Sending offer {1}", m_rounds, offer));

            return Utils.ArrayClone(offer.Offer);
        }
        
        private bool ValidOffer(OfferHolder offer, bool enemyOffers)
        {
            if (offer.MyIncome == 0 || offer.EnemyAverage <= 0 || offer.EnemyMedian <= 0)
                return false;
            
            if (!enemyOffers)
            {
                if (m_greed != TelepateType.Greed)
                {
                    if (offer.EnemyAverage < this.m_maxIncome * MinEnemyIncomeThreshold)
                        return false;
                }

                if (m_rejectedOffers.Contains(offer.OfferCode))
                    return false;
            }

            return true;
        }
        
        public OfferHolder MakeOffer(int turnsLeft)
        {
            OfferHolder selectedOffer = null;

            for (int i = 0; i < m_offers.Length; i++)
                if (ValidOffer(m_offers[i], false))
                {
                    selectedOffer = m_offers[i];
                    break;
                }

            if (selectedOffer != null)
            {
                this.m_log("Selected offer " + selectedOffer);
            }

            if (m_greed == TelepateType.Greed)
            {
                if (selectedOffer == null) // no offers left, stick with last one
                    selectedOffer = m_lastOffer;
            }
            else
            {
                if (turnsLeft <= 2)
                {
                    this.m_log("======== Making final offer! ========");

                    selectedOffer = null;

                    for (var i = 0; i < this.m_offers.Length; i++)
                    {
                        if (this.m_offers[i].EnemyAverage > this.m_maxIncome * MinEnemyIncomeThreshold && this.m_offers[i].MyIncome > 0)
                        {
                            return this.m_offers[i];
                        }
                    }
                }

                if (selectedOffer == null) // no offers left, try relaxed list
                {
                    m_log("!!!!!!!!!!!! No meaninful offers left!");

                    for (int i = 0; i < m_offers.Length; i++)
                        if (m_offers[i].EnemyAverage > 0 && m_offers[i].MyIncome > 0 && !m_rejectedOffers.Contains(m_offers[i].OfferCode)) // relaxed check: not fairest option, but still good
                        {
                            selectedOffer = m_offers[i];
                            break;
                        }

                    if (selectedOffer == null) // no offers left, stick with last one
                    {
                        m_log("No offers left and no relaxed found!");
                        selectedOffer = m_lastOffer;
                    }
                }
            }
            m_rejectedOffers.Add(selectedOffer.OfferCode);

            m_lastOffer = selectedOffer;

            return selectedOffer;
        }
        

        public bool CheckOffer(int[] offer, int turnsLeft)
        {
            OfferHolder holder = AnalyzerEngine.TestOffer(m_counts, m_allValues, m_excludedValues, m_myValuesIndex, offer);

            if (holder == null) // should never happen now
            {
                m_log("!!!!Empty offer!!!!");
                return false;
            }

            m_log(Utils.Format("[{0}] Checking offer {1}", turnsLeft, holder));

            if (holder.MyIncome >= m_maxIncome * AcceptThreshold) // always accept 
                return true;

            if (turnsLeft <= 1 && holder.MyIncome > 0) // all telepates are French
            {   
                m_log("I surrender! Give me at least " + holder.MyIncome);
                return true;
            }
        
            if (!ValidOffer(holder, true))
                return false;

            if (m_lastOffer != null && holder.MyIncome >= m_lastOffer.MyIncome) // better than my current offer
                return true;

            return false;
        }

#if DEBUG_RIG

        public override string ToString()
        {
            return string.Format("Telepate{1} [{0}, {2}]", GetHashCode(), m_greed, AcceptThreshold);
        }
        #endif
    }
}