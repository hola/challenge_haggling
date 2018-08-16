namespace Haggle
{
#if !DEBUG_RIG
    [Bridge.Namespace(false)]
    [Bridge.ObjectLiteral]
#endif
    public sealed class OfferHolder
    {
        public int MyIncome;
        public float EnemyAverage;
        public float EnemyMedian;
        public int EnemyMin;
        public int EnemyMax;
        public int[] Offer;
        public string OfferCode;

        public float Score;
        public int Options;

#if DEBUG_RIG
        public override string ToString()
        {
            return string.Format("Offer [{5}]: my income {0}, enemy average {1}, enemy median {2}, range [{3}, {4}], score {6}, exact {7}, options {8}", MyIncome, EnemyAverage, EnemyMedian, EnemyMin, EnemyMax, OfferCode, Score, EnemyMin == EnemyMax, Options);
        }
#endif
    }

#if !DEBUG_RIG
    [Bridge.Namespace(false)]
#endif
    public static class AnalyzerEngine
    {
#if DEBUG_RIG
        public static System.Tuple<int, float>[][] CalculateAveragePrices(int[] counts, int[][] values, CheckList<int> exceptValues)
        {
            var valueArray = new System.Collections.Generic.SortedDictionary<int, int>[counts.Length];

            for (int i = 0; i < counts.Length; i++)
                valueArray[i] = new System.Collections.Generic.SortedDictionary<int, int>();

            int ncount = 0;

            for (int j = 0; j < values.Length; j++)
            {
                if (exceptValues.Contains(j))
                    continue;

                for (int i = 0; i < valueArray.Length; i++)
                {
                    int value = values[j][i];
                    int count = 0;

                    valueArray[i].TryGetValue(value, out count);

                    valueArray[i][value] = count + 1;
                }
                ncount++;
            }

            System.Tuple<int, float>[][] result = new System.Tuple<int, float>[counts.Length][];

            for (int i = 0; i < counts.Length; i++)
            {
                result[i] = new System.Tuple<int, float>[valueArray[i].Count];

                int count = 0;
                foreach (var pair in valueArray[i])
                {
                    result[i][count] = new System.Tuple<int, float>(pair.Key, pair.Value / (float)ncount);
                    count++;
                }
            }

            return result;
        }
#endif

        public static OfferHolder TestOffer(int[] counts, int[][] values, CheckList<int> exceptValues, int myValues, int[] offer)
        {
            float enemyAvr = 0;
            int count = 0;
            int enemyMax = 0;
            int enemyMin = int.MaxValue;
            int nonZeroCount = 0;
            int[] valueArray = Utils.ArrayCreate(values.Length);

            for (int j = 0; j < values.Length; j++)
            {
                if (exceptValues.Contains(j))
                    continue;

                int value = CalculateIncomeForOffer(counts, values[j], offer, true);

                if (value > 0)
                    nonZeroCount++;

                enemyAvr += value;
                valueArray[count++] = value;

                if (value > enemyMax)
                    enemyMax = value;

                if (value < enemyMin)
                    enemyMin = value;
            }

            if (enemyMin == int.MaxValue) // no valid offers at all
                enemyMin = 0;

            enemyAvr /= count;

            float enemyMedian = count % 2 == 1 ? valueArray[count >> 1] : (valueArray[count >> 1] + valueArray[(count >> 1) + 1]) * 0.5f;

            int myIncome = CalculateIncomeForOffer(counts, values[myValues], offer, false);

            float score = myIncome - enemyAvr;

            string offerCode = "";
            for (int i = 0; i < offer.Length; i++)
                offerCode += offer[i];

            return new OfferHolder
            {
                MyIncome = myIncome,
                EnemyAverage = enemyAvr,
                EnemyMedian = enemyMedian,
                EnemyMin = enemyMin,
                EnemyMax = enemyMax,
                Offer = Utils.ArrayClone(offer),
                OfferCode = offerCode,
                Options = nonZeroCount,
                Score = score
            };
        }

        public static int CalculateIncomeForOffer(int[] counts, int[] values, int[] offer, bool invert)
        {
            int value = 0;

            if (invert)
            {
                for (int i = 0; i < offer.Length; i++)
                    value += (counts[i] - offer[i]) * values[i];
            }
            else
                for (int i = 0; i < offer.Length; i++)
                    value += (offer[i]) * values[i];

            return value;
        }

        public static OfferHolder[] FindBestOffers(int[] counts, int[][] values, CheckList<int> exceptValues, int myValues)
        {
            CustomList<OfferHolder> results = new CustomList<OfferHolder>();
            RecursiveFind(counts, values, exceptValues, myValues, Utils.ArrayCreate(counts.Length), 0, results);


            //results.Sort((x, y) => x.Score == y.Score ? 0 : x.Score > y.Score ? -1 : 1); - that was ok for greed idea, but gives lower overall result

            // my priority is maximum for me and still good values for my enemy
            results.Sort((x, y) => x.MyIncome + x.EnemyAverage * 0.1f > y.MyIncome + y.EnemyAverage * 0.1f ? -1 : 1);

            return results.ToArray();
        }

        public static void RecursiveFind(int[] counts, int[][] values, CheckList<int> exceptValues, int myValues, int[] offer, int i, CustomList<OfferHolder> results)
        {
            for (int j = 0; j <= counts[i]; j++)
            {
                offer[i] = j;

                if (i != offer.Length - 1)
                {
                    RecursiveFind(counts, values, exceptValues, myValues, offer, i + 1, results);
                    continue;
                }

                results.Add(TestOffer(counts, values, exceptValues, myValues, offer));
            }
        }
    }
}
