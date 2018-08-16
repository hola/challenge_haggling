namespace Haggle
{
    public delegate void LogDelegate(string format, params object[] parameters);

    public interface IPlayer
    {
        void Init(object me, int[] counts, int[] values, int max_rounds, LogDelegate log);
        int[] CheckOffer(int[] o);
    }
}
