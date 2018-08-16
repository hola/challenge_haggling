Detective
=========

Application for Hola haggling challenge

App is written in C# and translated to JS with Bridge.net. To build the app you need to install Bridge and then use 'bridge build' command in Detective.JS directory. After that generated file dist/Detective.JS should be cleaned up from Bridge dependencies and used as Node.JS module.
Prepared file is in the root folder.
Whole idea of the script is to guess enemy prices and give him best possible offer, suiting both sides. Also there is a 'auto-surrender' feature meaning that any positive kind of last move should be accepted. While it gives lower score on 1vs1 battle, for 10+ players it gives higher average score.
 
