#define _ONE

using System;
using System.Collections.Generic;

namespace Haggle
{
    class MainClass
    {
        private class PlayerHolder
        {
            public readonly IPlayer Player;
            public int Win;
            public int Loss;
            public int Rounds;
            public float Average;
            public int NonZeroRounds;

            public PlayerHolder(IPlayer player)
            {
                Player = player;
            }
            
            public void SubmitResult(int win, int loss)
            {
                Average = (Average * Rounds + win) / ++Rounds;
                
                Win += win;
                Loss += loss;
                if (win != 0 && loss != 0)
                    NonZeroRounds++;
            }

            public override string ToString()
            {
                return string.Format("Player {0}: win {1}, loss {2}, rounds: {3}({7}) {8}, aver: {4}, aver loss: {9}, ratio: {5}, non-zero avr {6}, aratio {10}", Player, Win, Loss, Rounds, Win/(float)Rounds, Win/(float)(Win+Loss), Win/(float)NonZeroRounds, NonZeroRounds, NonZeroRounds/(float)Rounds, Loss/(float)Rounds,  Win * NonZeroRounds/(float)(Rounds * (Win+Loss)));
            }
        }

        public static void Main(string[] args)
        {
            // 0.85, 0.75, 0.35, 0.25, 0.15
            int seed = 1;
            int games = 50;
            float[][] coefs =
            {
                new float[]{0.75f, 0.85f, 0.05f}, // acceptThreshold
                new float[]{0.75f, 0.85f, 0.05f}, // rejectThreshold
                new float[]{0.2f, 0.3f, 0.05f}, // minEnemyIncomeThreshold
                new float[]{0.2f, 0.3f, 0.05f}, // lastOfferThreshold
                new float[]{0.15f, 0.2f, 0.05f}, // minOfferThreshold
            };

            float[] ncoefs = new float[coefs.Length];

            for (int i = 0; i < coefs.Length; i++)
            {
                ncoefs[i] = coefs[i][0];
            }

            bool done = false;

            int maxResult = 0;
            float[] bestCoefs = new float[coefs.Length];

            while(!done)
            {
                Console.WriteLine("Testing with coefs [{0}]", String.Join(",", ncoefs));

                int result = DoTest(seed, games, ncoefs);

                Console.WriteLine("Result = " + result);

                if (result > maxResult)
                {
                    maxResult = result;
                    Array.Copy(ncoefs, bestCoefs, ncoefs.Length);
                }

                for (int i = 0; i < coefs.Length; i++)
                {
                    ncoefs[i] += coefs[i][2];
                    if (ncoefs[i] > coefs[i][1])
                    {
                        if (i == coefs.Length - 1)
                        {
                            done = true;
                            break;
                        }
                        ncoefs[i] = coefs[i][0];
                    }
                    else
                        break;
                }
               // break;
            }

            Console.WriteLine("Best result {0}, coefs {1}",  maxResult, String.Join(",", bestCoefs));
            Console.ReadLine();
        }

        private static int DoTest(int nseed, int games, float [] coefs)
        {
            List<PlayerHolder> players = new List<PlayerHolder>();

            PlayerHolder targetPlayer = new PlayerHolder(new AnalyzerPlayer(false, coefs[0], coefs[1], coefs[2], coefs[3], coefs[4]));

            players.Add(targetPlayer);

            players.Add(new PlayerHolder(new TelepatePlayer(TelepateType.Greed, 2.0f, 0.4f)));
            players.Add(new PlayerHolder(new TelepatePlayer(TelepateType.Greed, 1.0f, 0.3f)));
            players.Add(new PlayerHolder(new TelepatePlayer(TelepateType.Greed, 0.9f, 0.2f)));
            players.Add(new PlayerHolder(new TelepatePlayer(TelepateType.Normal, 2.0f, 0.5f)));
            players.Add(new PlayerHolder(new TelepatePlayer(TelepateType.Normal, 1.0f, 0.4f)));
            players.Add(new PlayerHolder(new TelepatePlayer(TelepateType.Normal, 0.9f, 0.3f)));
            players.Add(new PlayerHolder(new TelepatePlayer(TelepateType.Normal, 0.75f, 0.3f)));
            players.Add(new PlayerHolder(new TelepatePlayer(TelepateType.Benevolent, 0.9f, 0.3f)));
            players.Add(new PlayerHolder(new TelepatePlayer(TelepateType.Benevolent, 2.0f, 0.5f)));

            players.Add(new PlayerHolder(new AnalyzerPlayer(false, 0.9f, 0.9f)));
            players.Add(new PlayerHolder(new AnalyzerPlayer(false, 1.0f, 0.9f)));
            players.Add(new PlayerHolder(new AnalyzerPlayer(true, 0.9f, 0.9f)));
            players.Add(new PlayerHolder(new AnalyzerPlayer(true, 2.0f, 0.85f)));
            players.Add(new PlayerHolder(new AnalyzerPlayer(true, 0.5f, 0.5f)));
            //players.Add(new PlayerHolder(new AnalyzerPlayer(false, 0.9f, 0.9f)));
            //players.Add(new PlayerHolder(new AnalyzerPlayer(true, 0.8f, 0.6f)));
            //players.Add(new PlayerHolder(new AnalyzerPlayer(true, 0.75f, 0.75f)));
            players.Add(new PlayerHolder(new AnalyzerPlayer(false, 2.0f, 0.9f)));
            //players.Add(new PlayerHolder(new AnalyzerPlayer(true, 2.0f, 0.9f)));

//            players.Add(new PlayerHolder(new AnalyzerPlayer(true, 2.0f, 2.0f)));
//            players.Add(new PlayerHolder(new AnalyzerPlayer(true, 1.0f, 1.0f)));
            
            players.Add(new PlayerHolder(new ExamplePlayer()));
            players.Add(new PlayerHolder(new ExamplePlayer()));
            players.Add(new PlayerHolder(new ExamplePlayer()));

            players.Add(new PlayerHolder(new ExamplePlayer()));
            players.Add(new PlayerHolder(new ExamplePlayer()));
            players.Add(new PlayerHolder(new ExamplePlayer()));
//
            players.Add(new PlayerHolder(new RandomPlayer(1)));
            players.Add(new PlayerHolder(new RandomPlayer(2)));
            players.Add(new PlayerHolder(new RandomPlayer(3)));
            players.Add(new PlayerHolder(new RandomPlayer(4)));
            players.Add(new PlayerHolder(new RandomPlayer(5)));
            //            players.Add(new PlayerHolder(new SemiExamplePlayer()));
            //
            //            
            // players.Add(new PlayerHolder(new ExamplePlayer()));
            //players.Add(new PlayerHolder(new ExamplePlayer()));
            //players.Add(new PlayerHolder(new ExamplePlayer()));
            //
            //players.Add(new PlayerHolder(new RandomPlayer()));
            //players.Add(new PlayerHolder(new RandomPlayer()));
            //players.Add(new PlayerHolder(new RandomPlayer()));
            //
            //            
            //            players.Add(new PlayerHolder(new ExamplePlayer()));
            //            players.Add(new PlayerHolder(new ExamplePlayer()));
            //            players.Add(new PlayerHolder(new ExamplePlayer()));
            //
            //players.Add(new PlayerHolder(new RandomPlayer()));
            //players.Add(new PlayerHolder(new RandomPlayer()));
            //players.Add(new PlayerHolder(new RandomPlayer()));
            //
            //            players.Add(new PlayerHolder(new ExamplePlayer()));
            //            players.Add(new PlayerHolder(new ExamplePlayer()));
            //            players.Add(new PlayerHolder(new ExamplePlayer()));
            //
            //players.Add(new PlayerHolder(new SemiExamplePlayer()));
            //players.Add(new PlayerHolder(new SemiExamplePlayer()));
            //            players.Add(new PlayerHolder(new SemiExamplePlayer()));
            //
            //
            //            players.Add(new PlayerHolder(new ExamplePlayer()));
            //            players.Add(new PlayerHolder(new ExamplePlayer()));
            //            players.Add(new PlayerHolder(new ExamplePlayer()));
            //
            //            players.Add(new PlayerHolder(new SemiExamplePlayer()));
            //            players.Add(new PlayerHolder(new SemiExamplePlayer()));
            //            players.Add(new PlayerHolder(new SemiExamplePlayer()));
            //
            //
            //            players.Add(new PlayerHolder(new ExamplePlayer()));
            //            players.Add(new PlayerHolder(new ExamplePlayer()));
            //            players.Add(new PlayerHolder(new ExamplePlayer()));
            //
            //players.Add(new PlayerHolder(new SemiExamplePlayer()));
            //players.Add(new PlayerHolder(new SemiExamplePlayer()));
            //            players.Add(new PlayerHolder(new SemiExamplePlayer()));
            players.Add(new PlayerHolder(new GreedPlayer()));
            players.Add(new PlayerHolder(new GreedPlayer()));
            players.Add(new PlayerHolder(new GreedPlayer()));

            players.Add(new PlayerHolder(new CooperativePlayer()));
            players.Add(new PlayerHolder(new CooperativePlayer()));
            players.Add(new PlayerHolder(new CooperativePlayer()));
            players.Add(new PlayerHolder(new AnalyzerPlayer(false, 0.9f, 0.9f)));
            
            Generator generator = new Generator(3, 1, 6, 10);
            Random random = new Random(nseed);


#if !ONE
            List<int> seeds = new List<int>();
            
            for (int i = 0; i < games; i++)
                seeds.Add(random.Next());
                
                
            foreach(PlayerHolder playerOne in players)
                foreach(PlayerHolder playerTwo in players)
                    if (playerOne != playerTwo)
                    {
                        foreach(int seed in seeds)
                        {
                            Random newRandom = new Random(seed);
                            Tuple<int, int> result = Simulation(generator, 10, 5, playerOne.Player, playerTwo.Player, Logger, newRandom);
        
                            playerOne.SubmitResult(result.Item1, result.Item2);
                            playerTwo.SubmitResult(result.Item2, result.Item1);
                        }
                    }

#else
            {
                Generator tempGenerator = new Generator(3, 1, 6, 10);
                int[] counts = new int[]{ 3, 1, 1 };
                int[] values1 = new int[] { 0, 1, 9 };
                int[] values2 = new int[] { 0, 3, 7 };


                int currentSet = -1;
                int currentValues1 = -1;
                int currentValues2 = -1;

                for (int i = 0; i < tempGenerator.Combinations.Count; i++)
                {
                    if (Utils.ArrayEquals(counts, tempGenerator.Combinations[i].Item1))
                    {
                        currentSet = i;

                        for (int j = 0; j < tempGenerator.Combinations[i].Item2.Length; j++)
                        {
                            if (Utils.ArrayEquals(tempGenerator.Combinations[i].Item2[j], values1))
                            {
                                currentValues1 = j;
                            }
                            
                            if (Utils.ArrayEquals(tempGenerator.Combinations[i].Item2[j], values2))
                            {
                                currentValues2 = j;
                                
                            }
                            
                            if (currentValues1 != -1 && currentValues2 != -1)
                                break;
                        }

                        break;
                    }
                }
                
                PlayerHolder playerOne = players[0];
                PlayerHolder playerTwo = players[1];

                Tuple<int, int> result = Simulation(generator, 10, 5, playerOne.Player, playerTwo.Player, Logger, random, currentSet, currentValues1, currentValues2);

                playerOne.SubmitResult(result.Item1, result.Item2);
                playerTwo.SubmitResult(result.Item2, result.Item1);
            }
#endif

            players.Sort((x, y) => Comparer<int>.Default.Compare(x.Win, y.Win));

            for(int i=0;i<players.Count;i++)
                Console.WriteLine("{0}: {1}", i, players[i]);

            return targetPlayer.Win + (players.IndexOf(targetPlayer) * 1000000);
        }

        private static void Logger(string format, params object[] parameters)
        {
            #if ONE
            Console.WriteLine(format, parameters);
            #endif
        }

        public static Tuple<int,int> Simulation(Generator generator, int maxIncome, int totalRounds, IPlayer playerOne, IPlayer playerTwo, LogDelegate log, Random random, int forcedSet = -1, int forcedP1 = -1, int forcedP2 = -1)
        {
            int randomSet = forcedSet == -1 ? random.Next() % generator.Combinations.Count : forcedSet;
            int[] counts = generator.Combinations[randomSet].Item1;

            log("Counts: {{{0}}}", string.Join(",", counts));

            int randomValues1 = forcedP1 == -1 ? random.Next() % generator.Combinations[randomSet].Item2.Length : forcedP1;
            int randomValues2 = forcedP2 == -1 ? randomValues1 : forcedP2;

            while(randomValues2 == randomValues1)
                randomValues2 = random.Next() % generator.Combinations[randomSet].Item2.Length;

            int[] playerOneValues = generator.Combinations[randomSet].Item2[randomValues1];
            int[] playerTwoValues = generator.Combinations[randomSet].Item2[randomValues2];

            log("Player one: {0} with values {{{1}}}", playerOne, string.Join(",", playerOneValues));

            playerOne.Init(null, counts, playerOneValues, totalRounds, log);

            log("Player two: {0} with values {{{1}}}", playerTwo, string.Join(",", playerTwoValues));

            playerTwo.Init(null, counts, playerTwoValues, totalRounds, log);

            if (playerOne is TelepatePlayer)
                ((TelepatePlayer)playerOne).SetEnemyData(playerTwoValues);

            if (playerTwo is TelepatePlayer)
                ((TelepatePlayer)playerTwo).SetEnemyData(playerOneValues);

            IPlayer[] players = new[] { playerOne, playerTwo };

            int[] offer = null;
            IPlayer agreedPlayer = null;

            for (int i = 0; i < totalRounds; i++)
            {
                foreach (IPlayer player in players)
                {
                    if (offer != null)
                    {
                        for (int j = 0; j < offer.Length; j++)
                            offer[j] = counts[j] - offer[j];
                        
                        log("Player {0} checking offer {{{1}}}", player == playerOne ? "one" : "two", offer == null ? "null" : string.Join(",", offer));
                    }

                    int[] newOffer = player.CheckOffer(offer);

                    if (offer != null)
                    {
                        if (newOffer == null)
                        {
                            agreedPlayer = player;

                            log("Player {0} agreed", player == playerOne ? "one" : "two");
                            break;
                        }
                        else
                            log("Player {0} declines", player == playerOne ? "one" : "two");
                    }

                    offer = newOffer;
                }

                if (agreedPlayer != null)
                    break;
            }

            if (agreedPlayer == null)
            {
                log("Result is draw. Player one score 0, player two score 0");
                return new Tuple<int, int>(0, 0);
            }

            if (playerOne is AnalyzerPlayer)
                ((AnalyzerPlayer)playerOne).PrintStats();

            if (playerTwo is AnalyzerPlayer)
                ((AnalyzerPlayer)playerTwo).PrintStats();
            
            int oneValue = 0;
            int twoValue = 0;

            for (int j = 0; j < offer.Length; j++)
            {
                oneValue += playerOneValues[j] * (playerOne == agreedPlayer ? offer[j] : (counts[j] - offer[j]));
                twoValue += playerTwoValues[j] * (playerTwo == agreedPlayer ? offer[j] : (counts[j] - offer[j]));
            }

            log("Player one result: {0}, player two result {1}, agreed value {{{2}}} (for player {3})", oneValue, twoValue, string.Join(",", offer), agreedPlayer == playerOne ? "one" : "two");

            return new Tuple<int, int>(oneValue, twoValue);
            /*//Console.WriteLine("Generated {0} object sets", generator.Combinations.Count);

            Analyzer analyzer = new Analyzer(generator, currentSet, currentValues, maxIncome, totalRounds);

            int[][] enemyOffers = 
            {
                new []{1,0,2},
                new []{1,0,1},
                new []{1,1,1},
                new []{0,1,1},
                new []{1,2,1},
            };

            for (int turn = 0; turn < totalRounds; turn ++)
            {
                int[] myOffer = analyzer.MakeOffer(turn);

                Console.WriteLine("My offer for turn {0}: {{{1}}}, my money {2}", turn, string.Join(",", myOffer), Analyzer.CalculateMyIncomeForOffer(generator.Combinations[currentSet], currentValues, myOffer, true));

                int[] enemyOffer = enemyOffers[turn];

                bool accept = analyzer.CheckOffer(enemyOffer, turn);

                Console.WriteLine("Checking enemy offer {{{0}}}: {1}, my money {2}", string.Join(",", enemyOffer), accept, Analyzer.CalculateMyIncomeForOffer(generator.Combinations[currentSet], currentValues, enemyOffer, false));

                //if (accept)
                //  break;
            }*/
        }
    }
}
