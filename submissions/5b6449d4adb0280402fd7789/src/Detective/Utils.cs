namespace Haggle
{
#if !DEBUG_RIG
    [Bridge.External]
#endif
    public static class Utils// avoid using System namespace
    {
#if !DEBUG_RIG
        [Bridge.Template("Math.min({x}, {y})")]
#endif
        public static int Min(int x, int y)
        {
            return x > y ? y : x;
        }

#if !DEBUG_RIG
        [Bridge.Template("Math.max({x}, {y})")]
#endif
        public static int Max(int x, int y)
        {
            return x > y ? x : y;
        }

#if !DEBUG_RIG
        [Bridge.Template("{x}.join(',') === {y}.join(',')")]
#endif
        public static bool ArrayEquals(int[] x, int[] y)
        {
            if (x.Length != y.Length)
                return false;

            for (int i = 0; i < x.Length; i++)
                if (x[i] != y[i])
                    return false;

            return true;
        }

#if !DEBUG_RIG
        [Bridge.Template("new Array({length})")]
#endif
        public static int[] ArrayCreate(int length)
        {
            return new int[length];
        }

#if !DEBUG_RIG
        [Bridge.Template("new Array({length})")]
#endif
        public static float[] ArrayCreateFloat(int length)
        {
            return new float[length];
        }

#if !DEBUG_RIG
        [Bridge.Template("Array.from({x})")]
#endif
        public static int[] ArrayClone(int[] x)
        {
            int[] result = ArrayCreate(x.Length);

            for (int i = 0; i < x.Length; i++)
                result[i] = x[i];

            return result;
        }

#if !DEBUG_RIG
        [Bridge.Template("{x}.indexOf({value}) !== -1")]
#endif
        public static bool ArrayContains(int[] x, int value)
        {
            return System.Array.IndexOf(x, value) != -1;
        }

#if !DEBUG_RIG
        [Bridge.Template("{values}.join({separator})")]
#endif
        public static string StringJoin<T>(string separator, T[] values)
        {
            return string.Join(separator, values);
        }

#if !DEBUG_RIG
        [Bridge.Template("`${JSON.stringify({1})}, ${JSON.stringify({2})}`")]
#endif
        public static string Format(string format, object p1, object p2)
        {
#if DEBUG
            return format;
#else
            return string.Format(format, p1, p2);
#endif
        }
        
#if !DEBUG_RIG
        [Bridge.Template("`${JSON.stringify({1})}`")]
#endif
        public static string Format(string format, object p1)
        {
            return string.Format(format, p1);
        }
    }


#if !DEBUG_RIG
    [Bridge.External]
#endif
    public class CheckList<T>
    {
        private readonly System.Collections.Generic.Dictionary<T, bool> m_dictionary;

#if !DEBUG_RIG
        [Bridge.Template("[]")]
#endif
        public CheckList()
        {
            m_dictionary = new System.Collections.Generic.Dictionary<T, bool>();
        }

#if !DEBUG_RIG
        [Bridge.Template("{this}.push({value})")]
#endif
        public void Add(T value)
        {
            m_dictionary[value] = true;
        }

#if !DEBUG_RIG
        [Bridge.Template("{this}.indexOf({value}) !== -1")]
#endif
        public bool Contains(T value)
        {
            return m_dictionary.ContainsKey(value);
        }
    }

#if !DEBUG_RIG
    [Bridge.External]
#endif
    public class CustomList<T>
    {
        private readonly System.Collections.Generic.List<T> m_list;
        
#if !DEBUG_RIG
        [Bridge.Name("length")]
#endif
        public int Count
        {
            get { return m_list.Count; }
        }
        
        public T this[int index]
        {
            get { return m_list[index]; }
            set { m_list[index] = value; }
        }
        
#if !DEBUG_RIG
        [Bridge.Template("[]")]
#endif
        public CustomList()
        {
            m_list = new System.Collections.Generic.List<T>();   
        }
        
#if !DEBUG_RIG
        [Bridge.Template("{this}.push({value})")]
#endif
        public void Add(T value)
        {
            m_list.Add(value);
        }
        
#if !DEBUG_RIG
        [Bridge.Template("{this}.sort({sorter})")]
#endif
        public void Sort(System.Comparison<T> sorter)
        {
            m_list.Sort(sorter);
        }
        
#if !DEBUG_RIG
        [Bridge.Template("{this}")]
#endif
        public T[] ToArray()
        {
            return m_list.ToArray();
        }
        
#if !DEBUG_RIG
        [Bridge.Template("{this}.indexOf({value}) !== -1")]
#endif
        public bool Contains(T value)
        {
            return m_list.Contains(value);
        }
    }
    
#if !DEBUG_RIG
    [Bridge.External]
#endif
    public class HaggleException : System.ApplicationException
    {
#if !DEBUG_RIG
        [Bridge.Template("new Error({message})")]
#endif
        public HaggleException(string message)
            : base(message)
        {
            
        }
    }
}

