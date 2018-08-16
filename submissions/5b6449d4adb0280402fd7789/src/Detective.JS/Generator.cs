using System;

namespace Haggle
{
    #if !DEBUG_RIG
    [Bridge.Namespace(false)]
    #endif
    /// <summary>
    /// Generator class translated from generator.js
    /// </summary>
    public class Generator
    {
        public readonly CustomList<Tuple<int[], int[][]>> Combinations;
        private readonly int m_types;
        private readonly int m_minObj;
        private readonly int m_maxObj;
        private readonly int m_total;
        
        private void InitSets(int[] counts, int i, int total_count)
        {
            int min = Utils.Max(1, this.m_minObj - total_count - this.m_types + i + 1);
            int max = this.m_maxObj - total_count - this.m_types + i + 1;
            for (int j = min; j <= max; j++)
            {
                counts[i] = j;
                if (i < this.m_types - 1)
                    this.InitSets(counts, i + 1, total_count + j);
                else
                {
                    var obj_set = new Tuple<int[], CustomList<int[]>>(counts, new CustomList<int[]>());

                    this.InitValues(obj_set, Utils.ArrayCreate(m_types), 0, 0);
                    if (obj_set.Item2.Count >= 2)
                        this.Combinations.Add(new Tuple<int[], int[][]>(Utils.ArrayClone(counts), obj_set.Item2.ToArray()));
                }
            }
        }

        private void InitValues(Tuple<int[], CustomList<int[]>> obj_set, int[] values, int i, int total_value)
        {
            int count = obj_set.Item1[i];
            int max = (this.m_total - total_value) / count | 0;
            if (i == this.m_types - 1)
            {
                if (total_value + max * count == this.m_total)
                {
                    values[i] = max;
                    obj_set.Item2.Add(Utils.ArrayClone(values));
                }
                return;
            }
            for (int j = 0; j <= max; j++)
            {
                values[i] = j;
                this.InitValues(obj_set, values, i + 1, total_value + j * count);
            }
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="T:Haggle.Generator"/> class with all possible data sets
        /// </summary>
        /// <param name="types">Types.</param>
        /// <param name="min_obj">Minimum object.</param>
        /// <param name="max_obj">Max object.</param>
        /// <param name="total">Total.</param>
        public Generator(int types, int min_obj, int max_obj, int total)
        {
            this.m_types = types;
            this.m_minObj = min_obj;
            this.m_maxObj = max_obj;
            this.m_total = total;
            this.Combinations = new CustomList<Tuple<int[], int[][]>>();
            this.InitSets(Utils.ArrayCreate(types), 0, 0);
            
            if (this.Combinations.Count == 0)
                throw new HaggleException("Constraints cannot be satisfied");
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="T:Haggle.Generator"/> class with only one data set
        /// </summary>
        /// <param name="counts">Counts.</param>
        /// <param name="min_obj">Minimum object.</param>
        /// <param name="max_obj">Max object.</param>
        /// <param name="total">Total.</param>
        public Generator(int [] counts, int min_obj, int max_obj, int total)
        {
            this.m_types = counts.Length;
            this.m_minObj = min_obj;
            this.m_maxObj = max_obj;
            this.m_total = total;
            this.Combinations = new CustomList<Tuple<int[], int[][]>>();

            var obj_set = new Tuple<int[], CustomList<int[]>>(counts, new CustomList<int[]>());

            this.InitValues(obj_set, Utils.ArrayCreate(m_types), 0, 0);

            if (obj_set.Item2.Count >= 2)
                this.Combinations.Add(new Tuple<int[], int[][]>(Utils.ArrayClone(counts), obj_set.Item2.ToArray()));

            if (this.Combinations.Count == 0)
                throw new HaggleException("Constraints cannot be satisfied");
        }
    }
}
