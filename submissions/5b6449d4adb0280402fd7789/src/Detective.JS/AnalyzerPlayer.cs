//#define LOG_OFFERS

namespace Haggle
{
#if !DEBUG_RIG
     public delegate void LogDelegate(string format, params object[] parameters);
    
    [Bridge.Namespace(false)]
#endif


    public class AnalyzerPlayer
#if DEBUG_RIG
        : IPlayer
#endif
    {
        private readonly bool m_greed = false;
        private readonly float AcceptThreshold = 0.85f;
        private readonly float RejectThreshold = 0.85f;
        private readonly float MinEnemyIncomeThreshold = 0.25f;

        private readonly float MinOfferThreshold = 0.2f;
        private readonly float LastOfferThreshold = 0.25f;

        private int[] m_counts;
        private int[] m_values;

        private int m_rounds;
        private LogDelegate m_log;
        private int m_maxIncome;

        private int[][] m_allValues;
        private int m_myValuesIndex;
        private OfferHolder[] m_offers;
        private CheckList<string> m_rejectedOffers;
        private OfferHolder m_lastOffer;
        private CheckList<int> m_excludedValues;


#if DEBUG_RIG
        public AnalyzerPlayer(bool noOffer, float acceptThreshold, float rejectThreshold, float minEnemyIncomeThreshold = 0.3f, float lastOfferThreshold = 0.3f, float minOfferThreshold = 0.3f)
        {
            m_greed = noOffer;
            RejectThreshold = rejectThreshold;
            AcceptThreshold = acceptThreshold;
            MinEnemyIncomeThreshold = minEnemyIncomeThreshold;
            LastOfferThreshold = lastOfferThreshold;
            MinOfferThreshold = minOfferThreshold;
        }
#endif

#if !DEBUG_RIG
        [Bridge.Name("constructor")]
#endif
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

                    for (int j = 0; j < generator.Combinations[i].Item2.Length; j++)
                    {
                        if (Utils.ArrayEquals(generator.Combinations[i].Item2[j], m_values))
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

            m_allValues = generator.Combinations[currentSet].Item2;
            m_myValuesIndex = currentValues;

            m_rejectedOffers = new CheckList<string>();
            m_excludedValues = new CheckList<int>();
            m_excludedValues.Add(currentValues);

            m_offers = AnalyzerEngine.FindBestOffers(m_counts, m_allValues, m_excludedValues, m_myValuesIndex);

            m_log(Utils.Format("I'm analyzer player {0}, {1}", AcceptThreshold, RejectThreshold));

#if LOG_OFFERS
            m_log("Initial list of offers");

            for (int i = 0; i < m_offers.Length; i++)
                m_log(Utils.Format("{0}: valid: {1}", m_offers[i], ValidOffer(m_offers[i], false)));
#endif

#if DEBUG_RIG
            PrintStats();
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

            // don't forget to clone at this point, otherwise local offer could be garbled!
            return Utils.ArrayClone(offer.Offer);
        }

        private bool ValidOffer(OfferHolder offer, bool enemyOffers)
        {
            if (offer.MyIncome == 0 || offer.EnemyAverage <= 0 || offer.EnemyMedian <= 0)
                return false;

            if (!enemyOffers)
            {
                if (offer.EnemyAverage < this.m_maxIncome * MinOfferThreshold)
                    return false;

                if (m_rejectedOffers.Contains(offer.OfferCode))
                    return false;
            }

            return offer.MyIncome > 0;
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

            if (m_greed) // greed guy does not want to make last offer
            {
                if (selectedOffer == null) // no offers left, stick with last one
                    selectedOffer = m_lastOffer;
            }
            else
            {
                if (turnsLeft <= 2)
                {
                    this.m_log("Making last offer!");

                    selectedOffer = null;

                    for (var i = 0; i < this.m_offers.Length; i++)
                    {
                        if (this.m_offers[i].EnemyMedian > 0 && this.m_offers[i].EnemyAverage >= this.m_maxIncome * LastOfferThreshold && this.m_offers[i].MyIncome > 0)
                        {
                            return this.m_offers[i];
                        }
                    }
                }

                if (selectedOffer == null) // no offers left, try relaxed list
                {
                    m_log("No meaninful offers left!");

                    for (int i = 0; i < m_offers.Length; i++)
                        if (this.m_offers[i].EnemyMedian > 0 && m_offers[i].EnemyAverage >= MinOfferThreshold * m_maxIncome && m_offers[i].MyIncome > 0 && !m_rejectedOffers.Contains(m_offers[i].OfferCode)) // relaxed check: not fairest option, but still good
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

            // if enemy rejected my offer, that means that his total for this offer never reached 9 or 10
            bool changed = false;
            for (int i = 0; i < m_allValues.Length; i++)
            {
                if (m_excludedValues.Contains(i))
                    continue;

                int income = AnalyzerEngine.CalculateIncomeForOffer(m_counts, m_allValues[i], m_lastOffer.Offer, true);

                if (income >= m_maxIncome * RejectThreshold)
                {
                    m_excludedValues.Add(i);
                    changed = true;
                }
            }

            if (changed)
            {
                m_offers = AnalyzerEngine.FindBestOffers(m_counts, m_allValues, m_excludedValues, m_myValuesIndex);

#if DEBUG_RIG
                PrintStats();
#endif
#if LOG_OFFERS
                m_log("Revised list of offers (for next move)");

                for (int i = 0; i < m_offers.Length; i++)
                    m_log(Utils.Format("{0}: valid: {1}", m_offers[i], ValidOffer(m_offers[i], false)));
#endif
            }

            return selectedOffer;
        }


        public bool CheckOffer(int[] offer, int turnsLeft)
        {
            // enemy would not offer me the items that could give him 9+ score, so let's remove them from the offer table
            {
                bool changed = false;
                for (int i = 0; i < m_allValues.Length; i++)
                {
                    if (m_excludedValues.Contains(i))
                        continue;

                    // enemy income for his offer (inverted counts)
                    int income = AnalyzerEngine.CalculateIncomeForOffer(m_counts, m_allValues[i], offer, false);

                    if (income >= m_maxIncome * RejectThreshold) // items enemy offered me would cost him 9-10, that is very unlikely
                    {
                        m_excludedValues.Add(i);
                        changed = true;
                    }

                    // enemy income for items left to enemy
                    int invIncome = AnalyzerEngine.CalculateIncomeForOffer(m_counts, m_allValues[i], offer, true);

                    if (invIncome < m_maxIncome * MinEnemyIncomeThreshold) // items left to enemy would cost less then 2-3, that is definitelly not possible
                    {
                        m_excludedValues.Add(i);
                        changed = true;
                    }

                }

                if (changed)
                {
                    m_offers = AnalyzerEngine.FindBestOffers(m_counts, m_allValues, m_excludedValues, m_myValuesIndex);

#if DEBUG_RIG
                    PrintStats();
#endif
#if LOG_OFFERS
                    m_log("Revised list of offers (according to enemy move)");

                    for (int i = 0; i < m_offers.Length; i++)
                        m_log(Utils.Format("{0}: valid: {1}", m_offers[i], ValidOffer(m_offers[i], false)));
#endif
                }
            }

            OfferHolder holder = AnalyzerEngine.TestOffer(m_counts, m_allValues, m_excludedValues, m_myValuesIndex, offer);

            if (holder == null) // should never happen now
            {
                m_log("!!!!Empty offer!!!!");
                return false;
            }

            m_log(Utils.Format("[{0}] Checking offer {1}", turnsLeft, holder));

            if (holder.MyIncome >= m_maxIncome * AcceptThreshold) // always accept if we're given good option
                return true;

            if (turnsLeft <= 1 && holder.MyIncome > 0) // French move ;)
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
        public void PrintStats()
        {
            var prices = AnalyzerEngine.CalculateAveragePrices(m_counts, m_allValues, m_excludedValues);

            for (int i = 0; i < prices.Length; i++)
            {
                foreach(var pair in prices[i])
                    m_log("Item {0}, price {1} chance {2}", i, pair.Item1, pair.Item2);
            }
        }

        public override string ToString()
        {
            return string.Format("{1} [{0}, {2}, {3}]", GetHashCode(), m_greed ? "AnalyzerGreed" : "Analyzer", AcceptThreshold, RejectThreshold);
        }
#endif
    }
}