using System;

namespace Haggle
{
    public class RandomPlayer : IPlayer
    {
        private int[] m_counts;
        private int[] m_values;

        private int m_rounds;
        private LogDelegate m_log;
        private int m_total;

        private Random m_random;

        public RandomPlayer(int seed)
        {
            m_random = new Random(seed);
        }

        public void Init(object me, int[] counts, int[] values, int max_rounds, LogDelegate log)
        {
            m_counts = counts;
            m_values = values;
            m_rounds = max_rounds;
            m_log = log;
            m_total = 0;
            for (int i = 0; i < counts.Length; i++)
                m_total += counts[i] * values[i];

        }

        public int[] CheckOffer(int[] o)
        {
            if (m_log == null)
                throw new System.ApplicationException("Player not inited!");

            //m_log("{0} rounds left", m_rounds);
            m_rounds--;

            if (o != null)
            {
                int sum = 0;
                for (int i = 0; i < o.Length; i++)
                    sum += m_values[i] * o[i];

                if (sum >= m_total * 0.75f)
                    return null;
                
                if (sum > 0 && m_rounds <= 0)
                    return null; // accept anything for last round
            }

            o = (int[])m_counts.Clone();

            for (int i = 0; i < o.Length; i++)
            {
                if (m_values[i] == 0 || m_counts[i] > 1)
                    o[i] = m_random.Next(m_counts[i] + 1);
            }

            return o;
        }

        public override string ToString()
        {
            return "RandomPlayer [" + GetHashCode() + "]";
        }

    }
}
