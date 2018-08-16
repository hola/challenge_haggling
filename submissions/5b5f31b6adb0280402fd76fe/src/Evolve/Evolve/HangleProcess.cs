using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Threading;
using System.Diagnostics;
using System.IO;

namespace Evolve
{
    class HangleProcess : IComparable<HangleProcess>
    {
        private static int MAX_ID = 0;
        private const int MAX_ITERATIONS = 250;

        private Thread _hangleThread = null;
        private Boolean _isCompleted = false;
        private Gen _gen = null;
        private ScoreData _result = null;
        private int _id = 0;
        private int _waitIterations = 0;

        public HangleProcess(Gen gen)
        {
            _gen = gen;
            _id = MAX_ID++;
            _hangleThread = new Thread(Process);
            _hangleThread.Start();
        }

        public ScoreData Result
        {
            get
            {
                return _result;
            }
        }

        public Boolean IsCompleted
        {
            get
            {
                return _isCompleted;
            }
        }

        public int CompareTo(HangleProcess other)
        {
            return _result.CompareTo(other.Result);
        }

        private void Process()
        {
            String evoName = String.Format(Program.evoTemplate, _gen.Tag);
            String logName = String.Format(Program.logTemplate, _gen.Tag + "_" + _id);
            String runCmd = String.Format(Program.runTemplate, Program.path, evoName, logName);
            String evoPath = Path.Combine(Program.path, evoName);
            String logPath = Path.Combine(Program.path, logName);

            Process p = new Process();
            p.StartInfo.FileName = "CMD.exe";
            p.StartInfo.Arguments = runCmd;
            p.StartInfo.WindowStyle = ProcessWindowStyle.Hidden;
            p.Start();

            //p.WaitForExit();
            while (!p.HasExited && _waitIterations++ < MAX_ITERATIONS)
            {
                Thread.Sleep(40);
            }

            if (_waitIterations >= MAX_ITERATIONS)
            {
                _isCompleted = true;
                return;
            }

            String log = "";
            if (!File.Exists(logPath))
            {
                _isCompleted = true;
                return;
            }
            using (StreamReader reader = new StreamReader(logPath))
            {
                log = reader.ReadToEnd();
            }
            try
            {
                if (log.IndexOf("abort") > -1 || log.Length < 100 || log.IndexOf("valuation") == -1)
                {
                    if (File.Exists(logPath))
                    {
                        File.Delete(logPath);
                    }
                    _isCompleted = true;
                    return;
                }
                int scriptFirstAppear = log.IndexOf("script");
                int remoteFirstAppear = log.IndexOf("remote");
                int ourIndex = scriptFirstAppear < remoteFirstAppear ? 0 : 1;
                int score2Index = log.LastIndexOf("score");
                int score1Index = log.LastIndexOf("score", score2Index - 1);
                int score1EndIndex = 0;
                int score2EndIndex = 0;
                score1Index = log.IndexOf("\n", score1Index + 1);
                score1Index = log.IndexOf("\n", score1Index + 1);
                score1EndIndex = log.IndexOf("\n", score1Index + 1);

                score2Index = log.IndexOf("\n", score2Index + 1);
                score2Index = log.IndexOf("\n", score2Index + 1);
                score2EndIndex = log.IndexOf("\n", score2Index + 1);

                String score1String = log.Substring(score1Index, score1EndIndex - score1Index);
                String score2String = log.Substring(score2Index, score2EndIndex - score2Index);

                int score1 = Int32.Parse(score1String);
                int score2 = Int32.Parse(score2String);// Int32.Parse(log.Substring(startIndex, endIndex - startIndex));
                int ourScore = ourIndex == 0 ? score1 : score2;
                int oppScore = ourIndex == 0 ? score2 : score1;
                ScoreData score = new ScoreData
                {
                    myScore = ourScore,
                    oppScore = oppScore
                };
                _result = score;
                if (File.Exists(logPath))
                {
                    File.Delete(logPath);
                }
            }
            catch (Exception exp)
            {
                Console.WriteLine(exp.Message);
            }
            _isCompleted = true;
        }
    }
}
