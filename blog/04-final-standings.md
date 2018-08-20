*[Previous post](03-round1-results.md)*

# Final Standings

After a lot of testing, we are now releasing the final standings, as well as publishing the names or pseudonyms of each solution's author.

Thanks to all who participated, and congratulations to the winners!

The **400 USD special prize** goes to someone under the pseudonym **indutny** for developing an alternative online testing arena that allowed for faster testing of different solutions against each other than the one we provided. Thank you for your involvement!

## Statistics

We tested the 50 finalists on 500 [additional seeds](../seeds/finals.txt). We also took into account all the sessions that the finalists already had among themselves during the first round (on 500 [seeds](../seeds/round1.txt)), but not the sessions finalists had with solutions that didn't make it into the finals. In total, the ranking of the finalists was determined by 1000 sessions for every ordered pair of distinct solutions. For 50 finalists, 2,450 sessions per seed were run, for a total of 2,450,000 sessions. Each solution was tested in 98,000 sessions.

2,358,913 sessions (96.28%) resulted in an agreement. The average payout was 7.0275 per session, or 7.2989 per agreement. It is, in fact, impressive how the top 50 solutions are really good at using almost every opportunity to make a deal.

1,272 sessions (0.05%) were aborted for various reasons (invalid offers, exceptions).

## Raw logs

The full logs of all 2,450,000 sessions of the finals are [published as an archive](https://cdn4.hola.org/static/finals.tar.bz2) (322 MB). A session's log is stored in the archive as `S/A-B.json`, where `S` is the seed, `A` is the solution ID of the first participant, and `B` is the solution ID of the second participant.

You can use `haggle.js --replay=LOG.json` to “replay” a session log as human-readable text.

It will be interesting to see some creative analysis of the raw logs for the finals and for [round 1](https://cdn4.hola.org/static/round1.tar.bz2) by the community.

## Scores

Legend:

* **S**: Total score (this is what the competition is about)
* **S/N**: Average score per session
* **A**: Number of sessions where an agreement has been reached
* **A/N**: Number of agreements as a percentage of the number of sessions
* **S/A**: Average score per session where an agreement has been reached
* **X**: Number of sessions aborted by the solution (exceptions, incorrect output)

|   # |                              ID                                        |       S |    S/N |       A |    A/N |   S/A |       X |
| ---:| ---------------------------------------------------------------------- | -------:| ------:| -------:| ------:| -----:| -------:|
|   1 |                        [Asta](../submissions/5b6061cdadb0280402fd773e) |  744277 | 7.5947 |   94775 | 96.71% |  7.85 |       0 |
|   2 |                  [Silent Bob](../submissions/5b5f34a0adb0280402fd7704) |  741761 | 7.5690 |   95064 | 97.00% |  7.80 |       0 |
|   3 |                [Robert Speed](../submissions/5b63b9efadb0280402fd7779) |  728167 | 7.4303 |   93764 | 95.68% |  7.77 |       0 |
|   4 |                [freewayrider](../submissions/5b62eddaadb0280402fd7766) |  723938 | 7.3871 |   95729 | 97.68% |  7.56 |       0 |
|   5 |             [Alexander Bykov](../submissions/5b64cb2dadb0280402fd77d8) |  718609 | 7.3327 |   93189 | 95.09% |  7.71 |       0 |
|   6 |           [Sergey Garkavenko](../submissions/5b5f3ddaadb0280402fd770d) |  711331 | 7.2585 |   92582 | 94.47% |  7.68 |       0 |
|   7 |                       [Serzh](../submissions/5b632514adb0280402fd776f) |  710151 | 7.2464 |   95936 | 97.89% |  7.40 |       0 |
|   8 |                       [Wagok](../submissions/5b64ec4fadb0280402fd77f7) |  709165 | 7.2364 |   92997 | 94.89% |  7.63 |       0 |
|   9 | [Lebedev Andrey Nikolayevich](../submissions/5b64eaabadb0280402fd77f2) |  707909 | 7.2236 |   94363 | 96.29% |  7.50 |       0 |
|  10 |                        [StaP](../submissions/5b64e9c6adb0280402fd77ef) |  707355 | 7.2179 |   93069 | 94.97% |  7.60 |       0 |
|  11 |    [Yuri Sergeevich Cherezov](../submissions/5b64e7baadb0280402fd77e8) |  706741 | 7.2116 |   95029 | 96.97% |  7.44 |       0 |
|  12 |                     [DenAlex](../submissions/5b61aac7adb0280402fd774f) |  706171 | 7.2058 |   93179 | 95.08% |  7.58 |       0 |
|  13 |                        [J.K.](../submissions/5b64575dadb0280402fd7794) |  704943 | 7.1933 |   94475 | 96.40% |  7.46 |       0 |
|  14 |                    [Kazakoff](../submissions/5b64eb06adb0280402fd77f3) |  703183 | 7.1753 |   95189 | 97.13% |  7.39 |       0 |
|  15 |                         [BPC](../submissions/5b64ec01adb0280402fd77f6) |  699526 | 7.1380 |   90812 | 92.67% |  7.70 |       0 |
|  16 |              [Anton Zakharov](../submissions/5b6194a3adb0280402fd774c) |  699031 | 7.1330 |   95966 | 97.92% |  7.28 |       0 |
|  17 |              [Andrey Morozov](../submissions/5b64926eadb0280402fd77b4) |  698189 | 7.1244 |   96142 | 98.10% |  7.26 |       0 |
|  18 |                       [nick0](../submissions/5b64e7f2adb0280402fd77ea) |  698037 | 7.1228 |   95685 | 97.64% |  7.30 |       0 |
|  19 |                      [Nomad1](../submissions/5b6449d4adb0280402fd7789) |  697574 | 7.1181 |   93533 | 95.44% |  7.46 |       0 |
|  20 | [Ustilov Artem Olexandrovych](../submissions/5b61b487adb0280402fd7751) |  695109 | 7.0929 |   94123 | 96.04% |  7.39 |       0 |
|  21 |                         [unk](../submissions/5b64e876adb0280402fd77ed) |  695037 | 7.0922 |   92006 | 93.88% |  7.55 |       0 |
|  22 |                         [RJA](../submissions/5b60c8b3adb0280402fd7746) |  693136 | 7.0728 |   96593 | 98.56% |  7.18 |       0 |
|  23 |           [Victoria Manukyan](../submissions/5b6194d9adb0280402fd774d) |  692160 | 7.0629 |   94359 | 96.28% |  7.34 |       0 |
|  24 |           [Nicolas Letellier](../submissions/5b622468adb0280402fd775c) |  691456 | 7.0557 |   94455 | 96.38% |  7.32 |       0 |
|  25 |      [Chrysanthi Papamichail](../submissions/5b649223adb0280402fd77b3) |  689757 | 7.0383 |   92063 | 93.94% |  7.49 |       0 |
|  26 |     [Koba Bogdan Georgievich](../submissions/5b622c6aadb0280402fd775e) |  688869 | 7.0293 |   92829 | 94.72% |  7.42 |       0 |
|  27 |          [Vladimir Kuriatkov](../submissions/5b6194f3adb0280402fd774e) |  687768 | 7.0180 |   96228 | 98.19% |  7.15 |       0 |
|  28 |           [Mihai Chirculescu](../submissions/5b60e006adb0280402fd7749) |  685800 | 6.9980 |   94685 | 96.62% |  7.24 |       0 |
|  29 |                      [Batman](../submissions/5b646019adb0280402fd779c) |  685357 | 6.9934 |   94568 | 96.50% |  7.25 |       0 |
|  30 |            [Andrew Chuhlomin](../submissions/5b6493acadb0280402fd77b7) |  683142 | 6.9708 |   93799 | 95.71% |  7.28 |       0 |
|  31 |                       [razza](../submissions/5b64acd3adb0280402fd77c4) |  683112 | 6.9705 |   95238 | 97.18% |  7.17 |       0 |
|  32 |                   [Casanunda](../submissions/5b5fb68eadb0280402fd772a) |  680881 | 6.9478 |   96165 | 98.13% |  7.08 |    1101 |
|  33 |                         [aid](../submissions/5b64909cadb0280402fd77b0) |  677736 | 6.9157 |   92245 | 94.13% |  7.35 |       0 |
|  34 |           [Dmitriy Nalivaiko](../submissions/5b59906f28c8422305e8e9c8) |  677696 | 6.9153 |   92211 | 94.09% |  7.35 |       0 |
|  35 |              [Davide Baldini](../submissions/5b5f31dbadb0280402fd7700) |  676475 | 6.9028 |   94482 | 96.41% |  7.16 |       0 |
|  36 |           [DRY team variantB](../submissions/5b64ba5badb0280402fd77cd) |  676052 | 6.8985 |   90351 | 92.19% |  7.48 |       0 |
|  37 |               [Sergey Avilov](../submissions/5b5f7b9dadb0280402fd7725) |  674698 | 6.8847 |   93881 | 95.80% |  7.19 |       0 |
|  38 |                     [avmfree](../submissions/5b605be4adb0280402fd773b) |  670108 | 6.8378 |   90146 | 91.99% |  7.43 |       0 |
|  39 |                       [sav31](../submissions/5b61f95fadb0280402fd7754) |  669993 | 6.8367 |   93811 | 95.73% |  7.14 |       0 |
|  40 |           [Georgi Olentsenko](../submissions/5b5f56d9adb0280402fd771b) |  667556 | 6.8118 |   96381 | 98.35% |  6.93 |       0 |
|  41 |                      [Viktor](../submissions/5b644603adb0280402fd7781) |  665611 | 6.7919 |   96861 | 98.84% |  6.87 |       0 |
|  42 |            [Andrew Ivannikov](../submissions/5b64ebedadb0280402fd77f5) |  664778 | 6.7834 |   96970 | 98.95% |  6.86 |       0 |
|  43 |         [Konstantin Barkalov](../submissions/5b64e225adb0280402fd77e6) |  664552 | 6.7811 |   92833 | 94.73% |  7.16 |       0 |
|  44 |              [Evgeny Morozov](../submissions/5b64e9e0adb0280402fd77f0) |  663730 | 6.7728 |   95898 | 97.86% |  6.92 |       0 |
|  45 |            [Eugene Churmanov](../submissions/5b646257adb0280402fd779e) |  663318 | 6.7686 |   96871 | 98.85% |  6.85 |       0 |
|  46 |            [Chechushkov Yuri](../submissions/5b640864adb0280402fd777d) |  661625 | 6.7513 |   96969 | 98.95% |  6.82 |       0 |
|  47 |                   [WWWWWWWWW](../submissions/5b606e98adb0280402fd7740) |  654058 | 6.6741 |   96362 | 98.33% |  6.79 |     171 |
|  48 |               [dfgdfgjdfkjgd](../submissions/5b5f61ccadb0280402fd771c) |  651404 | 6.6470 |   93003 | 94.90% |  7.00 |       0 |
|  49 |            [Danylo Yakymenko](../submissions/5b63bb43adb0280402fd777a) |  650366 | 6.6364 |   93531 | 95.44% |  6.95 |       0 |
|  50 |             [Alexey Kolpakov](../submissions/5b62f0c6adb0280402fd7767) |  637580 | 6.5059 |   96431 | 98.40% |  6.61 |       0 |

The standings below the top 50 are as already determined by round 1. We are repeating that part of the table here, this time with the participants' names. The **S** and **A** columns below are not comparable with those in the table above because the number of sessions is different.

|   # |                              ID                                        |       S |    S/N |       A |    A/N |   S/A |       X |
| ---:| ---------------------------------------------------------------------- | -------:| ------:| -------:| ------:| -----:| -------:|
|  51 |                        [Memo](../submissions/5b649339adb0280402fd77b5) | 1177398 | 6.3643 |  152701 | 82.54% |  7.71 |       0 |
|  52 |                     [stopslt](../submissions/5b6205d9adb0280402fd7756) | 1177345 | 6.3640 |  172260 | 93.11% |  6.83 |       0 |
|  53 |                [Sergey Talov](../submissions/5b62f937adb0280402fd776a) | 1175879 | 6.3561 |  156326 | 84.50% |  7.52 |       0 |
|  54 |           [Victor Vashchenko](../submissions/5b635a9eadb0280402fd7774) | 1175500 | 6.3541 |  167153 | 90.35% |  7.03 |       5 |
|  55 |                  [the_random](../submissions/5b620112adb0280402fd7755) | 1174931 | 6.3510 |  165356 | 89.38% |  7.11 |       0 |
|  56 |                   [maurya777](../submissions/5b609808adb0280402fd7743) | 1174282 | 6.3475 |  169619 | 91.69% |  6.92 |       0 |
|  57 |                   [CyberZhuk](../submissions/5b64c121adb0280402fd77d4) | 1173430 | 6.3429 |  161429 | 87.26% |  7.27 |       0 |
|  58 |           [EMMANOUIL VACHLAS](../submissions/5b64b128adb0280402fd77c8) | 1172056 | 6.3354 |  159060 | 85.98% |  7.37 |       0 |
|  59 |     [Kirov Vadim Viktorovich](../submissions/5b64cbc4adb0280402fd77db) | 1172051 | 6.3354 |  169435 | 91.59% |  6.92 |       0 |
|  60 |              [Viktor Morozov](../submissions/5b645fcfadb0280402fd779b) | 1171860 | 6.3344 |  169417 | 91.58% |  6.92 |       0 |
|  61 |                    [elgogouv](../submissions/5b5f36f6adb0280402fd7707) | 1171148 | 6.3305 |  158764 | 85.82% |  7.38 |       0 |
|  62 |                    [delkappa](../submissions/5b5f368eadb0280402fd7705) | 1171071 | 6.3301 |  151128 | 81.69% |  7.75 |       0 |
|  63 |                        [Mad@](../submissions/5b648f06adb0280402fd77af) | 1169587 | 6.3221 |  159406 | 86.17% |  7.34 |       0 |
|  64 |           [Andrey Generalyuk](../submissions/5b64d6a6adb0280402fd77df) | 1168919 | 6.3185 |  159294 | 86.10% |  7.34 |       0 |
|  65 |                        [alph](../submissions/5b5f3334adb0280402fd7701) | 1168882 | 6.3183 |  153660 | 83.06% |  7.61 |      17 |
|  66 |               [Yellow Horror](../submissions/5b645263adb0280402fd7790) | 1168491 | 6.3162 |  174827 | 94.50% |  6.68 |       0 |
|  67 |             [Leonov Alexandr](../submissions/5b60066badb0280402fd7730) | 1167646 | 6.3116 |  153285 | 82.86% |  7.62 |       0 |
|  68 |               [ORKI_NA_GORKE](../submissions/5b646d65adb0280402fd77a1) | 1167609 | 6.3114 |  158502 | 85.68% |  7.37 |       0 |
|  69 |                [musically_ut](../submissions/5b605f98adb0280402fd773c) | 1165335 | 6.2991 |  153299 | 82.86% |  7.60 |       0 |
|  70 |                     [Dizarab](../submissions/5b644b20adb0280402fd778a) | 1164697 | 6.2957 |  162387 | 87.78% |  7.17 |       0 |
|  71 |                      [PavelK](../submissions/5b64e93badb0280402fd77ee) | 1162737 | 6.2851 |  152222 | 82.28% |  7.64 |       0 |
|  72 |                 [NotThisTime](../submissions/5b64da77adb0280402fd77e1) | 1161902 | 6.2806 |  158772 | 85.82% |  7.32 |       0 |
|  73 |                      [rrr111](../submissions/5b5f535fadb0280402fd771a) | 1161529 | 6.2785 |  167699 | 90.65% |  6.93 |       0 |
|  74 |                    [reaqtorb](../submissions/5b5f783dadb0280402fd7724) | 1160215 | 6.2714 |  161206 | 87.14% |  7.20 |       0 |
|  75 |                     [CR1MS0N](../submissions/5b5f48a3adb0280402fd7714) | 1159033 | 6.2650 |  173637 | 93.86% |  6.68 |       0 |
|  76 |                   [arseniy_t](../submissions/5b64ea06adb0280402fd77f1) | 1158476 | 6.2620 |  174139 | 94.13% |  6.65 |       0 |
|  77 |                   [Zavtramen](../submissions/5b64d77cadb0280402fd77e0) | 1158424 | 6.2618 |  160602 | 86.81% |  7.21 |       0 |
|  78 |                         [CWN](../submissions/5b5f3a75adb0280402fd7708) | 1157288 | 6.2556 |  152569 | 82.47% |  7.59 |       0 |
|  79 |                     [indutny](../submissions/5b64a625adb0280402fd77c1) | 1156074 | 6.2490 |  166383 | 89.94% |  6.95 |       0 |
|  80 |                       [SAGAK](../submissions/5b64466dadb0280402fd7785) | 1156044 | 6.2489 |  168411 | 91.03% |  6.86 |       0 |
|  81 |             [Jacek Mańkowski](../submissions/5b647497adb0280402fd77a5) | 1154194 | 6.2389 |  145050 | 78.41% |  7.96 |       0 |
|  82 |          [Mikhail Commandant](../submissions/5b649b2eadb0280402fd77ba) | 1152820 | 6.2315 |  158599 | 85.73% |  7.27 |       0 |
|  83 |           [Vladislav Zaytsev](../submissions/5b63728aadb0280402fd7777) | 1148881 | 6.2102 |  159210 | 86.06% |  7.22 |       0 |
|  84 |                       [Gromo](../submissions/5b60c2aeadb0280402fd7745) | 1148472 | 6.2080 |  162252 | 87.70% |  7.08 |       0 |
|  85 |                 [tunakilawin](../submissions/5b64828fadb0280402fd77aa) | 1148350 | 6.2073 |  152330 | 82.34% |  7.54 |       0 |
|  86 |                       [alvvi](../submissions/5b5f319badb0280402fd76fd) | 1147845 | 6.2046 |  167767 | 90.68% |  6.84 |       0 |
|  87 |                    [nateebaz](../submissions/5b646e67adb0280402fd77a2) | 1145924 | 6.1942 |  157670 | 85.23% |  7.27 |       0 |
|  88 |           [Alex Molas Martin](../submissions/5b60d89dadb0280402fd7748) | 1144334 | 6.1856 |  160030 | 86.50% |  7.15 |       0 |
|  89 |                      [gnilly](../submissions/5b644963adb0280402fd7788) | 1144157 | 6.1846 |  146680 | 79.29% |  7.80 |      16 |
|  90 |                 [Andrew Ilin](../submissions/5b648504adb0280402fd77ab) | 1143273 | 6.1799 |  170092 | 91.94% |  6.72 |       0 |
|  91 |        [noCoCu_TbI_mou_guBaH](../submissions/5b6495abadb0280402fd77b9) | 1139958 | 6.1619 |  160199 | 86.59% |  7.12 |       0 |
|  92 |                [Ivan Gladkov](../submissions/5b649b72adb0280402fd77bb) | 1139859 | 6.1614 |  154886 | 83.72% |  7.36 |       0 |
|  93 |            [Lod Lawson-betum](../submissions/5b647889adb0280402fd77a7) | 1136690 | 6.1443 |  142316 | 76.93% |  7.99 |       0 |
|  94 |         [Aggelos Papamichail](../submissions/5b6493ebadb0280402fd77b8) | 1136008 | 6.1406 |  152490 | 82.43% |  7.45 |     122 |
|  95 |                     [Jakub M](../submissions/5b5f7000adb0280402fd7721) | 1135678 | 6.1388 |  138134 | 74.67% |  8.22 |       0 |
|  96 |                  [vsevolod86](../submissions/5b64800cadb0280402fd77a9) | 1134302 | 6.1314 |  157296 | 85.02% |  7.21 |       0 |
|  97 |                  [Oleg Nosov](../submissions/5b61b994adb0280402fd7752) | 1133800 | 6.1286 |  169210 | 91.46% |  6.70 |       0 |
|  98 |              [Artem Reshetov](../submissions/5b64582fadb0280402fd7795) | 1132839 | 6.1235 |  160600 | 86.81% |  7.05 |       0 |
|  99 |              [Valerii Petlia](../submissions/5b602781adb0280402fd7738) | 1131947 | 6.1186 |  138402 | 74.81% |  8.18 |       0 |
| 100 |              [Vladimir Valov](../submissions/5b6312cfadb0280402fd776d) | 1130084 | 6.1086 |  141971 | 76.74% |  7.96 |       0 |
| 101 |               [Pavel Goltsev](../submissions/5b64eb6dadb0280402fd77f4) | 1129117 | 6.1033 |  143072 | 77.34% |  7.89 |       0 |
| 102 |                    [Wertolet](../submissions/5b5f31b6adb0280402fd76fe) | 1128923 | 6.1023 |  138257 | 74.73% |  8.17 |       0 |
| 103 |               [Aksana Mashyr](../submissions/5b64935badb0280402fd77b6) | 1125786 | 6.0853 |  153657 | 83.06% |  7.33 |       0 |
| 104 |                    [sirgeika](../submissions/5b5f2d45adb0280402fd76f7) | 1125722 | 6.0850 |  144804 | 78.27% |  7.77 |       0 |
| 105 |                   [steve3003](../submissions/5b5f7d33adb0280402fd7726) | 1125451 | 6.0835 |  153232 | 82.83% |  7.34 |       0 |
| 106 |              [Andres Kovalev](../submissions/5b5f6de7adb0280402fd7720) | 1125027 | 6.0812 |  176607 | 95.46% |  6.37 |       0 |
| 107 |               [Oleg Vorobyov](../submissions/5b5f4f0cadb0280402fd7716) | 1124888 | 6.0805 |  176175 | 95.23% |  6.39 |       0 |
| 108 |            [Mikhail Stepanov](../submissions/5b615af3adb0280402fd774a) | 1124228 | 6.0769 |  148565 | 80.31% |  7.57 |       0 |
| 109 |                  [ShadowMach](../submissions/5b60aa52adb0280402fd7744) | 1124011 | 6.0757 |  149386 | 80.75% |  7.52 |       0 |
| 110 |          [Anzo Zhao Yang Teh](../submissions/5b645609adb0280402fd7792) | 1122985 | 6.0702 |  181532 | 98.13% |  6.19 |       0 |
| 111 |                       [YKYWY](../submissions/5b61f2c2adb0280402fd7753) | 1122402 | 6.0670 |  143796 | 77.73% |  7.81 |       0 |
| 112 |            [Oliver Holmström](../submissions/5b64a2e3adb0280402fd77c0) | 1120801 | 6.0584 |  162029 | 87.58% |  6.92 |       0 |
| 113 |              [Alexey Novikov](../submissions/5b64bddfadb0280402fd77cf) | 1119910 | 6.0536 |  144932 | 78.34% |  7.73 |       0 |
| 114 |                   [Eiskalter](../submissions/5b5f36b1adb0280402fd7706) | 1119589 | 6.0518 |  160207 | 86.60% |  6.99 |       0 |
| 115 |               [jan.thphysics](../submissions/5b637fdfadb0280402fd7778) | 1115764 | 6.0312 |  150246 | 81.21% |  7.43 |       0 |
| 116 |                         [IFG](../submissions/5b607d5eadb0280402fd7741) | 1115717 | 6.0309 |  147281 | 79.61% |  7.58 |       0 |
| 117 |         [Aleksandr Madzhugin](../submissions/5b648891adb0280402fd77ad) | 1115071 | 6.0274 |  174592 | 94.37% |  6.39 |       0 |
| 118 |                  [max powers](../submissions/5b5f4185adb0280402fd770f) | 1113934 | 6.0213 |  146593 | 79.24% |  7.60 |       0 |
| 119 |                       [pynur](../submissions/5b5f2dd5adb0280402fd76f9) | 1112158 | 6.0117 |  136831 | 73.96% |  8.13 |       0 |
| 120 |              [Anton Solovyov](../submissions/5b5fcebaadb0280402fd772c) | 1112061 | 6.0111 |  136434 | 73.75% |  8.15 |       0 |
| 121 |                 [piggy peppa](../submissions/5b64c0f5adb0280402fd77d3) | 1111146 | 6.0062 |  170454 | 92.14% |  6.52 |       0 |
| 122 |           [Alexander Levakov](../submissions/5b6016a7adb0280402fd7737) | 1108742 | 5.9932 |  155886 | 84.26% |  7.11 |       0 |
| 123 |                    [andydspl](../submissions/5b64ec78adb0280402fd77f8) | 1107358 | 5.9857 |  155870 | 84.25% |  7.10 |    1446 |
| 124 |                     [JohnDoe](../submissions/5b6214c7adb0280402fd7757) | 1106655 | 5.9819 |  152046 | 82.19% |  7.28 |       0 |
| 125 |       [Alexandros Kontarinis](../submissions/5b648ef2adb0280402fd77ae) | 1102864 | 5.9614 |  141448 | 76.46% |  7.80 |       0 |
| 126 |          [Andrey Mikhaylenko](../submissions/5b644656adb0280402fd7782) | 1101407 | 5.9536 |  154763 | 83.66% |  7.12 |      34 |
| 127 |                [Linih Rimira](../submissions/5b64ba6aadb0280402fd77ce) | 1098566 | 5.9382 |  149625 | 80.88% |  7.34 |       0 |
| 128 |                         [Kat](../submissions/5b630ae9adb0280402fd776c) | 1097870 | 5.9344 |  137883 | 74.53% |  7.96 |       0 |
| 129 |  [Bykov Vladislav Andreevich](../submissions/5b605fe8adb0280402fd773d) | 1095701 | 5.9227 |  153262 | 82.84% |  7.15 |       0 |
| 130 |           [Alexey Nesterenko](../submissions/5b5f5017adb0280402fd7717) | 1093110 | 5.9087 |  173814 | 93.95% |  6.29 |       0 |
| 131 |                       [IvajG](../submissions/5b60d05dadb0280402fd7747) | 1091374 | 5.8993 |  126675 | 68.47% |  8.62 |       0 |
| 132 |              [Lightkeeper217](../submissions/5b5f2d3eadb0280402fd76f6) | 1085887 | 5.8697 |  152689 | 82.53% |  7.11 |    8488 |
| 133 |                      [taluks](../submissions/5b64b9a8adb0280402fd77cc) | 1084489 | 5.8621 |  178883 | 96.69% |  6.06 |       0 |
| 134 |               [Patrik Segedy](../submissions/5b64b8cfadb0280402fd77cb) | 1082286 | 5.8502 |  140595 | 76.00% |  7.70 |       0 |
| 135 |                         [F_S](../submissions/5b6368e3adb0280402fd7776) | 1079983 | 5.8377 |  164047 | 88.67% |  6.58 |       0 |
| 136 |                     [Torrion](../submissions/5b5f86acadb0280402fd7729) | 1078046 | 5.8273 |  139978 | 75.66% |  7.70 |       0 |
| 137 |                  [TonyBoyc87](../submissions/5b64910fadb0280402fd77b1) | 1074088 | 5.8059 |  137436 | 74.29% |  7.82 |       0 |
| 138 |                          [ds](../submissions/5b64c086adb0280402fd77d2) | 1073602 | 5.8033 |  132592 | 71.67% |  8.10 |       0 |
| 139 |                        [anna](../submissions/5b634809adb0280402fd7771) | 1071717 | 5.7931 |  144122 | 77.90% |  7.44 |       0 |
| 140 |        [Dionysios Kontarinis](../submissions/5b649190adb0280402fd77b2) | 1068352 | 5.7749 |  135775 | 73.39% |  7.87 |       0 |
| 141 |               [Stephen Young](../submissions/5b6459b7adb0280402fd7798) | 1067409 | 5.7698 |  141710 | 76.60% |  7.53 |       0 |
| 142 |                [Denis Olshin](../submissions/5b647a53adb0280402fd77a8) | 1063341 | 5.7478 |  140598 | 76.00% |  7.56 |       0 |
| 143 |                       [SBars](../submissions/5b6456e6adb0280402fd7793) | 1062601 | 5.7438 |  129435 | 69.96% |  8.21 |       0 |
| 144 |            [Alexander Volkov](../submissions/5b645d41adb0280402fd779a) | 1054358 | 5.6992 |  129245 | 69.86% |  8.16 |       0 |
| 145 |         [Volodymyr Synytskyi](../submissions/5b645b9cadb0280402fd7799) | 1045647 | 5.6521 |  138340 | 74.78% |  7.56 |       0 |
| 146 |                   [poisonbox](../submissions/5b634872adb0280402fd7772) | 1045429 | 5.6510 |  132729 | 71.75% |  7.88 |       0 |
| 147 |       [i_really_like_cookies](../submissions/5b64aab6adb0280402fd77c3) | 1045086 | 5.6491 |  148990 | 80.54% |  7.01 |       0 |
| 148 |                        [Todo](../submissions/5b6458adadb0280402fd7797) | 1044890 | 5.6481 |  124719 | 67.42% |  8.38 |       0 |
| 149 |           [Oleksandr Ustilov](../submissions/5b64cbc2adb0280402fd77da) | 1044541 | 5.6462 |  137603 | 74.38% |  7.59 |       0 |
| 150 |                       [V-Big](../submissions/5b6038abadb0280402fd773a) | 1043975 | 5.6431 |  172455 | 93.22% |  6.05 |       0 |
| 151 |               [Ivan Zakharov](../submissions/5b644660adb0280402fd7784) | 1043214 | 5.6390 |  125105 | 67.62% |  8.34 |       0 |
| 152 |                [Ildar Gaziev](../submissions/5b64e05aadb0280402fd77e5) | 1040107 | 5.6222 |  172006 | 92.98% |  6.05 |       0 |
| 153 |                       [bazil](../submissions/5b64588eadb0280402fd7796) | 1039128 | 5.6169 |  132073 | 71.39% |  7.87 |       0 |
| 154 |                        [ns5d](../submissions/5b5f3c6eadb0280402fd7709) | 1035270 | 5.5961 |  136774 | 73.93% |  7.57 |       0 |
| 155 |                [Ofir Zeitoun](../submissions/5b645609adb0280402fd7791) | 1018337 | 5.5045 |  181812 | 98.28% |  5.60 |       0 |
| 156 |                   [vinchik91](../submissions/5b6061dbadb0280402fd773f) | 1006254 | 5.4392 |  119932 | 64.83% |  8.39 |       0 |
| 157 |                 [Pablo Green](../submissions/5b644737adb0280402fd7787) |  990692 | 5.3551 |  163090 | 88.16% |  6.07 |       0 |
| 158 |              [ivan sedletzki](../submissions/5b64505cadb0280402fd778d) |  985762 | 5.3284 |  139369 | 75.33% |  7.07 |       0 |
| 159 |                    [Guardian](../submissions/5b64465fadb0280402fd7783) |  984195 | 5.3200 |  181472 | 98.09% |  5.42 |       0 |
| 160 |           [Sergey Okhrymenko](../submissions/5b621541adb0280402fd7758) |  981510 | 5.3055 |  129531 | 70.02% |  7.58 |       0 |
| 161 |             [Moldovan Andrei](../submissions/5b5ba4dd28c8422305e8ea44) |  977419 | 5.2833 |  122326 | 66.12% |  7.99 |       0 |
| 162 |               [Blake Allison](../submissions/5b64c75aadb0280402fd77d6) |  959900 | 5.1886 |  116630 | 63.04% |  8.23 |       0 |
| 163 |                         [fo0](../submissions/5b644bd0adb0280402fd778b) |  959515 | 5.1866 |  106831 | 57.75% |  8.98 |     364 |
| 164 |                       [anton](../submissions/5b64a253adb0280402fd77bf) |  953917 | 5.1563 |  153238 | 82.83% |  6.23 |       8 |
| 165 |                    [vanntile](../submissions/5b6010ccadb0280402fd7735) |  953713 | 5.1552 |  176549 | 95.43% |  5.40 |       0 |
| 166 |                         [fzv](../submissions/5b6356daadb0280402fd7773) |  948100 | 5.1249 |  165353 | 89.38% |  5.73 |       0 |
| 167 |                       [fox73](../submissions/5b62ec7badb0280402fd7765) |  939662 | 5.0793 |  108042 | 58.40% |  8.70 |       0 |
| 168 |               [VariableVasas](../submissions/5b64a04eadb0280402fd77bc) |  930869 | 5.0317 |  137444 | 74.29% |  6.77 |    2462 |
| 169 |    [Carlos Abraham Hernandez](../submissions/5b64afbbadb0280402fd77c7) |  921645 | 4.9819 |  158768 | 85.82% |  5.80 |       0 |
| 170 |                      [Tyiler](../submissions/5b5fd9dfadb0280402fd772d) |  920335 | 4.9748 |  160984 | 87.02% |  5.72 |    6033 |
| 171 |                        [jack](../submissions/5b642a80adb0280402fd777e) |  905546 | 4.8948 |  102427 | 55.37% |  8.84 |       0 |
| 172 |             [CatWithoutBoots](../submissions/5b64aebbadb0280402fd77c6) |  901665 | 4.8739 |   99526 | 53.80% |  9.06 |       0 |
| 173 |                        [74nk](../submissions/5b64767cadb0280402fd77a6) |  848228 | 4.5850 |   93249 | 50.40% |  9.10 |       0 |
| 174 |              [Kalievskiy Yan](../submissions/5b64c00badb0280402fd77d0) |  840401 | 4.5427 |  127536 | 68.94% |  6.59 |    8321 |
| 175 |                     [zero0x0](../submissions/5b64a95cadb0280402fd77c2) |  836861 | 4.5236 |   94376 | 51.01% |  8.87 |       0 |
| 176 |              [Jonathan Share](../submissions/5b5f4a5badb0280402fd7715) |  833259 | 4.5041 |   86866 | 46.95% |  9.59 |       0 |
| 177 |               [Yuri Homyakov](../submissions/5b5f2f46adb0280402fd76fb) |  818451 | 4.4241 |  129428 | 69.96% |  6.32 |       0 |
| 178 |               [Kyler A Berry](../submissions/5b5f5315adb0280402fd7719) |  791037 | 4.2759 |   82345 | 44.51% |  9.61 |       0 |
| 179 |              [Vladimir Zaiko](../submissions/5b646255adb0280402fd779d) |  746529 | 4.0353 |  100860 | 54.52% |  7.40 |   59432 |
| 180 |                [James Wright](../submissions/5b6446adadb0280402fd7786) |  720138 | 3.8926 |  153560 | 83.01% |  4.69 |       0 |
| 181 |               [Pavel Sokolov](../submissions/5b5f722fadb0280402fd7722) |  639048 | 3.4543 |  139696 | 75.51% |  4.57 |       0 |
| 182 |               [CyberGorynych](../submissions/5b633aeaadb0280402fd7770) |  503494 | 2.7216 |   56723 | 30.66% |  8.88 |       0 |
| 183 |                        [VOLK](../submissions/5b618a29adb0280402fd774b) |  326159 | 1.7630 |   38342 | 20.73% |  8.51 |       0 |
| 184 |                        [l4hg](../submissions/5b645177adb0280402fd778f) |  113192 | 0.6118 |   13185 |  7.13% |  8.58 |  170626 |
| 185 |          [Arthur Reshetnikov](../submissions/5b647124adb0280402fd77a3) |   35169 | 0.1901 |    3612 |  1.95% |  9.74 |  180128 |
| 186 |                    [k0nagaya](../submissions/5b64722eadb0280402fd77a4) |       0 | 0.0000 |       0 |  0.00% |   n/a |  184374 |
