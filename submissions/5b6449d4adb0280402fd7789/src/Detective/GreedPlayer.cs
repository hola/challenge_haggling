namespace Haggle
{
    public class GreedPlayer : IPlayer
    {
        private int[] m_counts;
        private int[] m_values;

        private int m_rounds;
        private LogDelegate m_log;
        private int m_total;

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

            m_rounds--;

            if (o != null)
            {
                int sum = 0;
                for (int i = 0; i < o.Length; i++)
                    sum += m_values[i] * o[i];

                if (sum >= m_total * 0.75f)
                    return null;
            }

            return (int[])m_counts.Clone();
        }

        public override string ToString()
        {
            return "Greed [" + GetHashCode() + "]";
        }
    }
}
