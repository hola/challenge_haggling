using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Threading;
using System.Diagnostics;
using System.IO;
using System.Xml.Linq;

namespace Evolve
{
    class Program
    {
        public const String path = "F:\\reps\\hola-hangling\\src\\";
        public const String evoTemplate = "gens\\gen{0}.json";
        public const String logTemplate = "logs\\log{0}.txt";
        public const String runTemplate = "/C node {0}haggle.js --force --quiet --gen-file={0}{1} --log={0}{2} --id wertoleta.net@gmail.com:SomeFuckingAwesomeString {0}example.js wss://hola.org/challenges/haggling/arena/standard";

        private const String LastGensSaveFileName = "last-generation.xml";
        private const int HangleRounds = 100;
        private const int MaxHangleThreads = 1;
        private const int CutSideSize = 0;

        static void Main(string[] args)
        {
            String mainLogName = string.Format("{0:yyyy-MM-dd_hh-mm-ss}log.txt", DateTime.Now);

            StreamWriter mainLogStream = new StreamWriter(mainLogName);

            IList<Gen> _generations = LoadGens();
            if (_generations == null)
            {
                _generations = new List<Gen> {
                    new Gen()
                };
            }

            int generationNumber = 0;
            while (true)
            {
                generationNumber++;
                mainLogStream.WriteLine(String.Format("Поколение №{0}", generationNumber));
                Console.WriteLine("Тестирование поколения №{0}", generationNumber);
                foreach (Gen gen in _generations)
                {
                    gen.Tag = string.Format("{0:yyyy-MM-dd_hh-mm-ss}", DateTime.Now);
                    String evoName = String.Format(evoTemplate, gen.Tag);
                    String logName = String.Format(logTemplate, gen.Tag);
                    String evoPath = Path.Combine(path, evoName);
                    String logPath = Path.Combine(path, logName);
                    String json = gen.ToJSON();
                    using (StreamWriter writer = new StreamWriter(evoPath))
                    {
                        writer.Write(json);
                    }

                    IList<HangleProcess> _runnedProcesses = new List<HangleProcess>();
                    List<HangleProcess> _completedProcesses = new List<HangleProcess>();

                    int prevCompletedProcessesCount = -1;
                    while(_completedProcesses.Count < HangleRounds)
                    {
                        IList<HangleProcess> _thisTurnCompletedProcesses = new List<HangleProcess>();
                        foreach(HangleProcess hProcess in _runnedProcesses)
                        {
                            if (hProcess.IsCompleted)
                            {
                                _thisTurnCompletedProcesses.Add(hProcess);
                            }
                        }
                        foreach(HangleProcess hProcess in _thisTurnCompletedProcesses) {
                            _runnedProcesses.Remove(hProcess);
                            if (hProcess.Result != null)// && (hProcess.Result.oppScore > 3 || (hProcess.Result.myScore == 0 && hProcess.Result.oppScore == 0)))
                            {
                                _completedProcesses.Add(hProcess);
                            }
                        }
                        while (_runnedProcesses.Count < MaxHangleThreads && _runnedProcesses.Count + _completedProcesses.Count < HangleRounds)
                        {
                            _runnedProcesses.Add(new HangleProcess(gen));
                        }
                        if (prevCompletedProcessesCount != _completedProcesses.Count)
                        {
                            Console.Write("\r{0}/{1}", _completedProcesses.Count, HangleRounds);
                            prevCompletedProcessesCount = _completedProcesses.Count;
                        }
                        Thread.Sleep(10);
                    }
                    Console.WriteLine();
                    
                    int summ = 0;
                    int summStable = 0;
                    int summOpp = 0;
                    int summStableOpp = 0;
                    _completedProcesses.Sort();
                    for (int i = 0; i < _completedProcesses.Count; i++)
                    {
                        ScoreData score = _completedProcesses[i].Result;
                        summ += score.myScore;
                        summOpp += score.oppScore;
                        if (i >= CutSideSize && i < _completedProcesses.Count - CutSideSize)
                        {
                            summStable += score.myScore;
                            summStableOpp += score.oppScore;
                        }
                    }
                    gen.Score.myScore = summStable;
                    gen.Score.oppScore = summStableOpp;
                    Console.WriteLine("Score: {0}/{1} : {2}/{3} {4}", summ, summOpp, summStable, summStableOpp, gen.Score.CompareScore);
                }
                IList<Gen> newGenerations = new List<Gen>();
                _generations = _generations.OrderByDescending(x => x.Score).ToList();
                for (int i = 0; i < _generations.Count; i++)
                {
                    Gen entity = _generations[i];
                    mainLogStream.WriteLine(String.Format("{0}/{1} ({2}) очков. Тэг: {3} Данные: {4}", entity.Score.myScore, entity.Score.oppScore, entity.Score.CompareScore, entity.Tag, entity.ToJSON()));
                    if (i == 2 && _generations.Count > 3)
                    {
                        mainLogStream.WriteLine("---Неудачники---");
                    }
                }
                mainLogStream.Flush();
                while (_generations.Count > 3)
                {
                    _generations.RemoveAt(_generations.Count - 1);
                }

                //Сохранение генов-победителей в файл
                SaveGens(_generations);

                foreach (Gen entity in _generations)
                {
                    newGenerations.Add(entity);
                    for (int i = 0; i < 5; i++)
                    {
                        newGenerations.Add(entity.Mutate());
                    }
                }
                _generations = newGenerations;
            }
            //Console.ReadLine();
            /*
            String runCmd = String.Format(formatString);
            Process p =new Process();
            p.StartInfo.UseShellExecute = false;
            p.StartInfo.RedirectStandardOutput = true;
            p.StartInfo.FileName = path;
            p.Start();

            String output = p.StandardOutput.ReadToEnd();
            p.WaitForExit();
            */
        }

        private static IList<Gen> LoadGens()
        {
            try
            {
                XElement xml = XElement.Load(LastGensSaveFileName);
                IList<Gen> _gens = new List<Gen>();
                foreach(XElement element in xml.Elements("gen"))
                {
                    _gens.Add(new Gen(element));
                }
                return _gens;
            }
            catch {
                return null;
            }
        }

        private static void SaveGens(IList<Gen> gens)
        {
            XElement xml = new XElement("gens");
            foreach(Gen gen in gens)
            {
                xml.Add(gen.ToXML());
            }
            xml.Save(LastGensSaveFileName);
        }
    }
}
