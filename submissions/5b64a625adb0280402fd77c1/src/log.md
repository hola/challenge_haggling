# Log of various configurations

## downsize.js

Real:

Position 5/35, entry { hash: '53b762f59543e78bd02132ce5c49dac6',
  date: '2018-07-05',
  mean: 6.740509370494954,
  meanAccepted: 7.841888595242936,
  acceptance: 0.8595517889126731,
  sessions: 22891 }

## example.js

Baseline

    66.01% acceptance
    7.36 per accepted
    4.86 per deal

    "all": {
      "sessions": 762,
      "agreements": 503,
      "score": 3704
    },

## no-cons = -0.1 self, 0.0 remote (10 epoch)

PPO with all policies

    65.61% acceptance
    6.86 per accepted
    4.50 per deal

    "all": {
      "sessions": 887,
      "agreements": 582,
      "score": 3992
    },

## no-cons = -0.15 self, -0.15 remote

PPO with all policies, but lower self

## half-ppo, -0.15 no consensus

Trained on half-or-all policy.

### 3 epochs

    75.61% acceptance
    7.14 per accepted
    5.40 per deal

    "all": {
      "sessions": 652,
      "agreements": 493,
      "score": 3521
    },

### 18 epochs

    81.96% acceptance
    8.37 per accepted
    6.86 per deal

    "all": {
      "sessions": 887,
      "agreements": 727,
      "score": 6087
    },

### 22 epochs

    83.09% acceptance
    8.13 per accepted
    6.76 per deal

    "all": {
      "sessions": 887,
      "agreements": 737,
      "score": 5994
    },

### 25 epochs

    82.19% acceptance
    8.52 per accepted
    7.00 per deal

    "all": {
      "sessions": 887,
      "agreements": 729,
      "score": 6214
    },

## downsize-ppo

Trained against just downsize.

### 3 epochs

    71.22% acceptance
    7.70 per accepted
    5.48 per deal

    "all": {
      "sessions": 476,
      "agreements": 339,
      "score": 2609
    },

### 7 epochs

    77.90% acceptance
    8.33 per accepted
    6.49 per deal

    "all": {
      "sessions": 887,
      "agreements": 691,
      "score": 5757
    },

## downsize with single adv and flat reward

### 10 epochs

    75.53% acceptance
    7.91 per accepted
    5.97 per deal

    "all": {
      "sessions": 887,
      "agreements": 670,
      "score": 5303
    },

## anneal

### 5 epochs

    "all": {
      "sessions": 909,
      "agreements": 595,
      "score": 4161
    },


## masked

### 3 epochs

    "all": {
      "sessions": 1509,
      "agreements": 1062,
      "score": 8068
    },

### 6 epochs

    "all": {
      "sessions": 1699,
      "agreements": 1126,
      "score": 9071
    },

### 10 epochs

    "all": {
      "sessions": 4285,
      "agreements": 2723,
      "score": 22414
    },

### 24 epochs

    "all": {
      "sessions": 2066,
      "agreements": 1195,
      "score": 10031
    },

# Self-play

## Relative, concurrency=8

### 10 epochs

    [ { name: 'neural',
        rounds: '1.5286',
        mean: '3.7750',
        meanAccepted: '5.0842',
        acceptance: '0.7425' },
      { name: 'half-or-all',
        rounds: '1.4309',
        mean: '5.9375',
        meanAccepted: '7.7236',
        acceptance: '0.7688' },
      { name: 'downsize',
        rounds: '1.5409',
        mean: '5.9600',
        meanAccepted: '8.2922',
        acceptance: '0.7188' } ]

### 20 epochs

    [ { name: 'neural',
        rounds: '1.8548',
        mean: '3.9463',
        meanAccepted: '5.2096',
        acceptance: '0.7575' },
      { name: 'half-or-all',
        rounds: '1.6534',
        mean: '6.2325',
        meanAccepted: '7.6472',
        acceptance: '0.8150' },
      { name: 'downsize',
        rounds: '1.8562',
        mean: '6.1437',
        meanAccepted: '8.0310',
        acceptance: '0.7650' } ]

### 30 epochs

    [ { name: 'neural',
        rounds: '1.6615',
        mean: '4.4350',
        meanAccepted: '5.5093',
        acceptance: '0.8050' },
      { name: 'half-or-all',
        rounds: '1.5856',
        mean: '6.1050',
        meanAccepted: '7.4679',
        acceptance: '0.8175' },
      { name: 'downsize',
        rounds: '1.7484',
        mean: '6.3037',
        meanAccepted: '8.0817',
        acceptance: '0.7800' } ]

### 40 epochs

    [ { name: 'neural',
        rounds: '1.6686',
        mean: '4.9813',
        meanAccepted: '5.8175',
        acceptance: '0.8562' },
      { name: 'half-or-all',
        rounds: '1.4605',
        mean: '5.9912',
        meanAccepted: '7.4310',
        acceptance: '0.8063' },
      { name: 'downsize',
        rounds: '1.7786',
        mean: '6.5338',
        meanAccepted: '8.0913',
        acceptance: '0.8075' } ]

### 50 epochs

    [ { name: 'neural',
        rounds: '1.6498',
        mean: '5.2363',
        meanAccepted: '6.2429',
        acceptance: '0.8387' },
      { name: 'half-or-all',
        rounds: '1.5202',
        mean: '5.9450',
        meanAccepted: '7.4081',
        acceptance: '0.8025' },
      { name: 'downsize',
        rounds: '1.7685',
        mean: '6.3575',
        meanAccepted: '8.0094',
        acceptance: '0.7937' } ]

### 60 epochs

    [ { name: 'neural',
        rounds: '1.6826',
        mean: '5.3487',
        meanAccepted: '6.4057',
        acceptance: '0.8350' },
      { name: 'half-or-all',
        rounds: '1.5842',
        mean: '5.9413',
        meanAccepted: '7.3462',
        acceptance: '0.8087' },
      { name: 'downsize',
        rounds: '1.8253',
        mean: '6.4538',
        meanAccepted: '7.9799',
        acceptance: '0.8087' } ]

### 70 epochs

    [ { name: 'neural',
        rounds: '1.7112',
        mean: '5.1338',
        meanAccepted: '6.3088',
        acceptance: '0.8137' },
      { name: 'half-or-all',
        rounds: '1.4509',
        mean: '5.8750',
        meanAccepted: '7.4367',
        acceptance: '0.7900' },
      { name: 'downsize',
        rounds: '1.8331',
        mean: '6.2763',
        meanAccepted: '7.9825',
        acceptance: '0.7863' } ]

### 80 rounds

    [ { name: 'neural',
        rounds: '1.6646',
        mean: '5.1350',
        meanAccepted: '6.4693',
        acceptance: '0.7937' },
      { name: 'half-or-all',
        rounds: '1.5039',
        mean: '5.9387',
        meanAccepted: '7.4119',
        acceptance: '0.8013' },
      { name: 'downsize',
        rounds: '1.8003',
        mean: '6.3137',
        meanAccepted: '7.9418',
        acceptance: '0.7950' } ]

### 90 rounds

    [ { name: 'neural',
        rounds: '1.6609',
        mean: '5.3150',
        meanAccepted: '6.7066',
        acceptance: '0.7925' },
      { name: 'half-or-all',
        rounds: '1.4547',
        mean: '5.8037',
        meanAccepted: '7.3816',
        acceptance: '0.7863' },
      { name: 'downsize',
        rounds: '1.7860',
        mean: '6.4775',
        meanAccepted: '8.0341',
        acceptance: '0.8063' } ]

### 100 rounds

    [ { name: 'neural',
        rounds: '1.7013',
        mean: '5.4188',
        meanAccepted: '7.0373',
        acceptance: '0.7700' },
      { name: 'half-or-all',
        rounds: '1.5183',
        mean: '5.4313',
        meanAccepted: '7.2417',
        acceptance: '0.7500' },
      { name: 'downsize',
        rounds: '1.8957',
        mean: '5.9363',
        meanAccepted: '7.8626',
        acceptance: '0.7550' } ]

### 110 rounds

    [ { name: 'neural',
        rounds: '1.6783',
        mean: '5.2100',
        meanAccepted: '7.2867',
        acceptance: '0.7150' },
      { name: 'half-or-all',
        rounds: '1.5034',
        mean: '5.2950',
        meanAccepted: '7.1554',
        acceptance: '0.7400' },
      { name: 'downsize',
        rounds: '1.7993',
        mean: '5.8987',
        meanAccepted: '7.8913',
        acceptance: '0.7475' } ]

### 120 rounds

    [ { name: 'neural',
        rounds: '1.6914',
        mean: '5.1842',
        meanAccepted: '7.2558',
        acceptance: '0.7145' },
      { name: 'half-or-all',
        rounds: '1.5167',
        mean: '5.4047',
        meanAccepted: '7.2304',
        acceptance: '0.7475' },
      { name: 'downsize',
        rounds: '1.8455',
        mean: '5.8483',
        meanAccepted: '7.8764',
        acceptance: '0.7425' } ]

### 130 rounds

    [ { name: 'neural',
        rounds: '1.5674',
        mean: '5.6128',
        meanAccepted: '7.1160',
        acceptance: '0.7887' },
      { name: 'half-or-all',
        rounds: '1.4502',
        mean: '5.7748',
        meanAccepted: '7.2524',
        acceptance: '0.7963' },
      { name: 'downsize',
        rounds: '1.7892',
        mean: '6.2092',
        meanAccepted: '7.9555',
        acceptance: '0.7805' } ]

### 140 rounds

    [ { name: 'neural',
        rounds: '1.5805',
        mean: '5.7477',
        meanAccepted: '7.2299',
        acceptance: '0.7950' },
      { name: 'half-or-all',
        rounds: '1.4072',
        mean: '5.6798',
        meanAccepted: '7.1714',
        acceptance: '0.7920' },
      { name: 'downsize',
        rounds: '1.7793',
        mean: '6.2092',
        meanAccepted: '7.9453',
        acceptance: '0.7815' } ]

### 150 rounds

    [ { name: 'neural',
        rounds: '1.4715',
        mean: '5.8513',
        meanAccepted: '6.9021',
        acceptance: '0.8478' },
      { name: 'half-or-all',
        rounds: '1.3565',
        mean: '5.9588',
        meanAccepted: '7.3069',
        acceptance: '0.8155' },
      { name: 'downsize',
        rounds: '1.7409',
        mean: '6.3957',
        meanAccepted: '7.9972',
        acceptance: '0.7997' } ]

### 160 rounds

    [ { name: 'neural',
        rounds: '1.4460',
        mean: '5.7780',
        meanAccepted: '6.8177',
        acceptance: '0.8475' },
      { name: 'half-or-all',
        rounds: '1.3632',
        mean: '5.9495',
        meanAccepted: '7.3135',
        acceptance: '0.8135' },
      { name: 'downsize',
        rounds: '1.7401',
        mean: '6.5105',
        meanAccepted: '7.9639',
        acceptance: '0.8175' } ]

### 170 rounds

    [ { name: 'neural',
        rounds: '1.6060',
        mean: '5.5280',
        meanAccepted: '7.4905',
        acceptance: '0.7380' },
      { name: 'half-or-all',
        rounds: '1.4608',
        mean: '5.4298',
        meanAccepted: '7.1798',
        acceptance: '0.7562' },
      { name: 'downsize',
        rounds: '1.8079',
        mean: '5.9443',
        meanAccepted: '7.9020',
        acceptance: '0.7522' } ]

### 180 rounds

    [ { name: 'neural',
        rounds: '1.5790',
        mean: '5.5555',
        meanAccepted: '7.5024',
        acceptance: '0.7405' },
      { name: 'half-or-all',
        rounds: '1.4335',
        mean: '5.5818',
        meanAccepted: '7.2116',
        acceptance: '0.7740' },
      { name: 'downsize',
        rounds: '1.7816',
        mean: '5.9633',
        meanAccepted: '7.9036',
        acceptance: '0.7545' } ]

### 190 rounds

    [ { name: 'neural',
        rounds: '1.5333',
        mean: '5.4490',
        meanAccepted: '7.6024',
        acceptance: '0.7167' },
      { name: 'half-or-all',
        rounds: '1.4192',
        mean: '5.4618',
        meanAccepted: '7.2461',
        acceptance: '0.7538' },
      { name: 'downsize',
        rounds: '1.7370',
        mean: '5.8025',
        meanAccepted: '7.9378',
        acceptance: '0.7310' } ]

### 200 rounds

    [ { name: 'neural',
        rounds: '1.6132',
        mean: '5.2332',
        meanAccepted: '7.6537',
        acceptance: '0.6837' },
      { name: 'half-or-all',
        rounds: '1.4481',
        mean: '5.3030',
        meanAccepted: '7.1421',
        acceptance: '0.7425' },
      { name: 'downsize',
        rounds: '1.8540',
        mean: '5.6292',
        meanAccepted: '7.8484',
        acceptance: '0.7173' } ]

### 220 rounds

    [ { name: 'neural',
        rounds: '1.5526',
        mean: '5.5210',
        meanAccepted: '7.4282',
        acceptance: '0.7432' },
      { name: 'half-or-all',
        rounds: '1.4372',
        mean: '5.4820',
        meanAccepted: '7.1497',
        acceptance: '0.7668' },
      { name: 'downsize',
        rounds: '1.7963',
        mean: '5.9050',
        meanAccepted: '7.8891',
        acceptance: '0.7485' } ]

## Relative, steps incentive

### 40 rounds

    [ { name: 'neural',
        rounds: '1.6335',
        mean: '4.7450',
        meanAccepted: '5.7446',
        acceptance: '0.8260' },
      { name: 'half-or-all',
        rounds: '1.4873',
        mean: '6.0652',
        meanAccepted: '7.4489',
        acceptance: '0.8143' },
      { name: 'downsize',
        rounds: '1.7772',
        mean: '6.3155',
        meanAccepted: '8.0735',
        acceptance: '0.7823' } ]

## Incentive runs (half-or-all and downsize)

### 10 rounds

    [ { name: 'neural',
        rounds: '1.6067',
        mean: '3.7942',
        meanAccepted: '4.7637',
        acceptance: '0.7965' },
      { name: 'half-or-all',
        rounds: '1.5371',
        mean: '6.2780',
        meanAccepted: '7.6772',
        acceptance: '0.8177' },
      { name: 'downsize',
        rounds: '1.7016',
        mean: '6.2260',
        meanAccepted: '8.1572',
        acceptance: '0.7632' } ]

### 20 rounds

    [ { name: 'neural',
        rounds: '1.8146',
        mean: '4.5440',
        meanAccepted: '6.3464',
        acceptance: '0.7160' },
      { name: 'half-or-all',
        rounds: '1.6313',
        mean: '5.8465',
        meanAccepted: '7.4596',
        acceptance: '0.7837' },
      { name: 'downsize',
        rounds: '1.8474',
        mean: '5.7542',
        meanAccepted: '7.9671',
        acceptance: '0.7222' } ]

### 30 rounds

    [ { name: 'neural',
        rounds: '1.7936',
        mean: '4.8303',
        meanAccepted: '6.8056',
        acceptance: '0.7097' },
      { name: 'half-or-all',
        rounds: '1.5350',
        mean: '5.7752',
        meanAccepted: '7.4137',
        acceptance: '0.7790' },
      { name: 'downsize',
        rounds: '1.8205',
        mean: '5.7195',
        meanAccepted: '7.9742',
        acceptance: '0.7173' } ]

### 40 rounds

    [ { name: 'neural',
        rounds: '1.8012',
        mean: '5.2257',
        meanAccepted: '6.8805',
        acceptance: '0.7595' },
      { name: 'half-or-all',
        rounds: '1.5735',
        mean: '5.7497',
        meanAccepted: '7.3315',
        acceptance: '0.7843' },
      { name: 'downsize',
        rounds: '1.8526',
        mean: '5.9915',
        meanAccepted: '7.9542',
        acceptance: '0.7532' } ]

### 50 rounds

    [ { name: 'neural',
        rounds: '1.8809',
        mean: '5.0853',
        meanAccepted: '7.1023',
        acceptance: '0.7160' },
      { name: 'half-or-all',
        rounds: '1.6228',
        mean: '5.6262',
        meanAccepted: '7.3116',
        acceptance: '0.7695' },
      { name: 'downsize',
        rounds: '1.9468',
        mean: '5.7317',
        meanAccepted: '7.8196',
        acceptance: '0.7330' } ]

### 60 rounds

    [ { name: 'neural',
        rounds: '1.7742',
        mean: '5.4230',
        meanAccepted: '7.2670',
        acceptance: '0.7462' },
      { name: 'half-or-all',
        rounds: '1.5205',
        mean: '5.6528',
        meanAccepted: '7.2564',
        acceptance: '0.7790' },
      { name: 'downsize',
        rounds: '1.8588',
        mean: '5.8715',
        meanAccepted: '7.8945',
        acceptance: '0.7438' } ]

### 70 rounds

    [ { name: 'neural',
        rounds: '1.9310',
        mean: '5.5172',
        meanAccepted: '7.3222',
        acceptance: '0.7535' },
      { name: 'half-or-all',
        rounds: '1.6050',
        mean: '5.6890',
        meanAccepted: '7.2195',
        acceptance: '0.7880' },
      { name: 'downsize',
        rounds: '1.9613',
        mean: '5.8063',
        meanAccepted: '7.8146',
        acceptance: '0.7430' } ]

### 80 rounds

    [ { name: 'neural',
        rounds: '1.9046',
        mean: '5.5323',
        meanAccepted: '7.3837',
        acceptance: '0.7492' },
      { name: 'half-or-all',
        rounds: '1.5762',
        mean: '5.5522',
        meanAccepted: '7.1967',
        acceptance: '0.7715' },
      { name: 'downsize',
        rounds: '1.9703',
        mean: '5.7975',
        meanAccepted: '7.8160',
        acceptance: '0.7418' } ]

### 90 rounds

    [ { name: 'neural',
        rounds: '1.9714',
        mean: '5.7732',
        meanAccepted: '7.4929',
        acceptance: '0.7705' },
      { name: 'half-or-all',
        rounds: '1.5857',
        mean: '5.6400',
        meanAccepted: '7.1779',
        acceptance: '0.7857' },
      { name: 'downsize',
        rounds: '1.9781',
        mean: '6.0652',
        meanAccepted: '7.8186',
        acceptance: '0.7758' } ]

### 120 rounds

    [ { name: 'neural',
        rounds: '2.0027',
        mean: '5.7320',
        meanAccepted: '7.6811',
        acceptance: '0.7462' },
      { name: 'half-or-all',
        rounds: '1.6305',
        mean: '5.4875',
        meanAccepted: '7.1082',
        acceptance: '0.7720' },
      { name: 'downsize',
        rounds: '2.0288',
        mean: '5.8110',
        meanAccepted: '7.7043',
        acceptance: '0.7542' } ]

### 150 rounds

    [ { name: 'neural',
        rounds: '1.9726',
        mean: '5.9523',
        meanAccepted: '7.5801',
        acceptance: '0.7853' },
      { name: 'half-or-all',
        rounds: '1.5903',
        mean: '5.5617',
        meanAccepted: '7.0828',
        acceptance: '0.7853' },
      { name: 'downsize',
        rounds: '2.0391',
        mean: '5.8370',
        meanAccepted: '7.6702',
        acceptance: '0.7610' } ]

### 200 rounds

    [ { name: 'neural',
        rounds: '2.0153',
        mean: '6.1730',
        meanAccepted: '7.7283',
        acceptance: '0.7987' },
      { name: 'half-or-all',
        rounds: '1.5904',
        mean: '5.5207',
        meanAccepted: '7.0508',
        acceptance: '0.7830' },
      { name: 'downsize',
        rounds: '2.0963',
        mean: '5.9328',
        meanAccepted: '7.6183',
        acceptance: '0.7788' } ]

### 270 rounds

    [ { name: 'neural',
        rounds: '2.0412',
        mean: '6.1430',
        meanAccepted: '7.7932',
        acceptance: '0.7883' },
      { name: 'half-or-all',
        rounds: '1.5581',
        mean: '5.5533',
        meanAccepted: '7.0006',
        acceptance: '0.7933' },
      { name: 'downsize',
        rounds: '2.1188',
        mean: '5.9200',
        meanAccepted: '7.6044',
        acceptance: '0.7785' } ]

### 310 rounds

    [ { name: 'neural',
        rounds: '1.9821',
        mean: '6.3063',
        meanAccepted: '7.7975',
        acceptance: '0.8087' },
      { name: 'half-or-all',
        rounds: '1.5480',
        mean: '5.6345',
        meanAccepted: '6.9864',
        acceptance: '0.8065' },
      { name: 'downsize',
        rounds: '2.1153',
        mean: '5.9372',
        meanAccepted: '7.5658',
        acceptance: '0.7847' } ]

### 370 rounds

    [ { name: 'neural',
        rounds: '1.9802',
        mean: '6.2705',
        meanAccepted: '7.7677',
        acceptance: '0.8073' },
      { name: 'half-or-all',
        rounds: '1.5054',
        mean: '5.6505',
        meanAccepted: '7.0171',
        acceptance: '0.8053' },
      { name: 'downsize',
        rounds: '2.1274',
        mean: '5.8545',
        meanAccepted: '7.5542',
        acceptance: '0.7750' } ]

### 400 rounds

    [ { name: 'neural',
        rounds: '2.0311',
        mean: '6.1075',
        meanAccepted: '7.8276',
        acceptance: '0.7802' },
      { name: 'half-or-all',
        rounds: '1.5676',
        mean: '5.3948',
        meanAccepted: '6.9009',
        acceptance: '0.7817' },
      { name: 'downsize',
        rounds: '2.1899',
        mean: '5.7038',
        meanAccepted: '7.5099',
        acceptance: '0.7595' } ]

### 430 rounds

    [ { name: 'neural',
        rounds: '2.0363',
        mean: '6.4055',
        meanAccepted: '7.6943',
        acceptance: '0.8325' },
      { name: 'half-or-all',
        rounds: '1.5757',
        mean: '5.6273',
        meanAccepted: '6.8856',
        acceptance: '0.8173' },
      { name: 'downsize',
        rounds: '2.1827',
        mean: '5.9640',
        meanAccepted: '7.5137',
        acceptance: '0.7937' } ]

### 490 rounds

    [ { name: 'neural',
        rounds: '2.0473',
        mean: '6.2625',
        meanAccepted: '7.6395',
        acceptance: '0.8197' },
      { name: 'half-or-all',
        rounds: '1.5142',
        mean: '5.6123',
        meanAccepted: '6.9330',
        acceptance: '0.8095' },
      { name: 'downsize',
        rounds: '2.1166',
        mean: '5.9880',
        meanAccepted: '7.5918',
        acceptance: '0.7887' } ]

## antagonist on 20

### 2 epochs

    [ { name: 'neural',
        rounds: '1.6399',
        mean: '3.4407',
        meanAccepted: '5.5631',
        acceptance: '0.6185' },
      { name: 'half-or-all',
        rounds: '1.5227',
        mean: '5.4120',
        meanAccepted: '7.5141',
        acceptance: '0.7202' },
      { name: 'downsize',
        rounds: '1.7510',
        mean: '5.4250',
        meanAccepted: '8.0163',
        acceptance: '0.6767' } ]

### 4 epochs

    [ { name: 'neural',
        rounds: '1.7791',
        mean: '4.8208',
        meanAccepted: '6.9841',
        acceptance: '0.6903' },
      { name: 'half-or-all',
        rounds: '1.5733',
        mean: '5.5693',
        meanAccepted: '7.3183',
        acceptance: '0.7610' },
      { name: 'downsize',
        rounds: '1.8859',
        mean: '5.5432',
        meanAccepted: '7.8823',
        acceptance: '0.7033' } ]

### 8 epochs

    [ { name: 'neural',
        rounds: '1.8871',
        mean: '4.8208',
        meanAccepted: '8.0012',
        acceptance: '0.6025' },
      { name: 'half-or-all',
        rounds: '1.5749',
        mean: '5.0400',
        meanAccepted: '7.1718',
        acceptance: '0.7027' },
      { name: 'downsize',
        rounds: '1.8878',
        mean: '5.2555',
        meanAccepted: '7.8353',
        acceptance: '0.6707' } ]

### 12 epochs

    [ { name: 'neural',
        rounds: '1.9151',
        mean: '5.4885',
        meanAccepted: '7.9285',
        acceptance: '0.6923' },
      { name: 'half-or-all',
        rounds: '1.5977',
        mean: '5.3380',
        meanAccepted: '7.1173',
        acceptance: '0.7500' },
      { name: 'downsize',
        rounds: '1.9721',
        mean: '5.6798',
        meanAccepted: '7.7354',
        acceptance: '0.7342' } ]

### 16 epochs

    [ { name: 'neural',
        rounds: '1.8103',
        mean: '5.7027',
        meanAccepted: '7.8254',
        acceptance: '0.7288' },
      { name: 'half-or-all',
        rounds: '1.4953',
        mean: '5.4650',
        meanAccepted: '7.0905',
        acceptance: '0.7708' },
      { name: 'downsize',
        rounds: '1.9390',
        mean: '5.7675',
        meanAccepted: '7.7782',
        acceptance: '0.7415' } ]

### 19 epochs (last without antagonists)

    [ { name: 'neural',
        rounds: '1.8317',
        mean: '5.8330',
        meanAccepted: '7.7592',
        acceptance: '0.7518' },
      { name: 'half-or-all',
        rounds: '1.5065',
        mean: '5.4555',
        meanAccepted: '7.0439',
        acceptance: '0.7745' },
      { name: 'downsize',
        rounds: '1.9749',
        mean: '5.9095',
        meanAccepted: '7.7173',
        acceptance: '0.7658' } ]

### 22 epochs (antagonists)

    [ { name: 'neural',
        rounds: '1.8274',
        mean: '5.8025',
        meanAccepted: '7.9979',
        acceptance: '0.7255' },
      { name: 'half-or-all',
        rounds: '1.5107',
        mean: '5.4257',
        meanAccepted: '7.1556',
        acceptance: '0.7582' },
      { name: 'downsize',
        rounds: '1.9372',
        mean: '5.7815',
        meanAccepted: '7.7630',
        acceptance: '0.7448' } ]

### 24 epochs (antagonists)

    [ { name: 'neural',
        rounds: '1.8395',
        mean: '5.6185',
        meanAccepted: '8.1428',
        acceptance: '0.6900' },
      { name: 'half-or-all',
        rounds: '1.5220',
        mean: '5.3355',
        meanAccepted: '7.1140',
        acceptance: '0.7500' },
      { name: 'downsize',
        rounds: '1.9156',
        mean: '5.6563',
        meanAccepted: '7.7963',
        acceptance: '0.7255' } ]

## Stable (propagating state)

### 31 epochs

    [ { name: 'neural',
        rounds: '1.8788',
        mean: '5.5773',
        meanAccepted: '8.0018',
        acceptance: '0.6970' },
      { name: 'half-or-all',
        rounds: '1.5156',
        mean: '5.2265',
        meanAccepted: '7.0772',
        acceptance: '0.7385' },
      { name: 'downsize',
        rounds: '1.9777',
        mean: '5.6178',
        meanAccepted: '7.7008',
        acceptance: '0.7295' } ]

### 33 epochs

    [ { name: 'neural',
        rounds: '1.6523',
        mean: '5.8952',
        meanAccepted: '7.8238',
        acceptance: '0.7535' },
      { name: 'half-or-all',
        rounds: '1.3750',
        mean: '5.4355',
        meanAccepted: '7.0890',
        acceptance: '0.7668' },
      { name: 'downsize',
        rounds: '1.9248',
        mean: '5.8872',
        meanAccepted: '7.7286',
        acceptance: '0.7618' } ]

### 34 epochs

    [ { name: 'neural',
        rounds: '1.5123',
        mean: '6.0810',
        meanAccepted: '7.5611',
        acceptance: '0.8043' },
      { name: 'half-or-all',
        rounds: '1.3335',
        mean: '5.7572',
        meanAccepted: '7.1652',
        acceptance: '0.8035' },
      { name: 'downsize',
        rounds: '1.8595',
        mean: '6.2130',
        meanAccepted: '7.8126',
        acceptance: '0.7953' } ]

### 46 epochs

    [ { name: 'neural',
        rounds: '1.7203',
        mean: '5.7393',
        meanAccepted: '7.7089',
        acceptance: '0.7445' },
      { name: 'half-or-all',
        rounds: '1.4186',
        mean: '5.4445',
        meanAccepted: '7.0892',
        acceptance: '0.7680' },
      { name: 'downsize',
        rounds: '1.9366',
        mean: '5.9322',
        meanAccepted: '7.7092',
        acceptance: '0.7695' } ]

### 51 epochs

    [ { name: 'neural',
        rounds: '1.6295',
        mean: '5.6333',
        meanAccepted: '7.8540',
        acceptance: '0.7173' },
      { name: 'half-or-all',
        rounds: '1.3553',
        mean: '5.3818',
        meanAccepted: '7.0627',
        acceptance: '0.7620' },
      { name: 'downsize',
        rounds: '1.9511',
        mean: '5.6585',
        meanAccepted: '7.6856',
        acceptance: '0.7362' } ]

## non-consensus=0.5

### 7 epochs

    [ { name: 'neural',
        rounds: '1.6972',
        mean: '5.7100',
        meanAccepted: '7.1509',
        acceptance: '0.7985' },
      { name: 'half-or-all',
        rounds: '1.4504',
        mean: '5.8210',
        meanAccepted: '7.2831',
        acceptance: '0.7993' },
      { name: 'downsize',
        rounds: '1.8531',
        mean: '6.1900',
        meanAccepted: '7.8728',
        acceptance: '0.7863' } ]

### 13 epochs

    [ { name: 'neural',
        rounds: '2.0182',
        mean: '5.8965',
        meanAccepted: '7.4193',
        acceptance: '0.7947' },
      { name: 'half-or-all',
        rounds: '1.6335',
        mean: '5.5367',
        meanAccepted: '7.1075',
        acceptance: '0.7790' },
      { name: 'downsize',
        rounds: '2.0301',
        mean: '5.9980',
        meanAccepted: '7.6873',
        acceptance: '0.7802' } ]

### 19 epochs

    [ { name: 'neural',
        rounds: '1.8964',
        mean: '6.3412',
        meanAccepted: '7.1031',
        acceptance: '0.8928' },
      { name: 'half-or-all',
        rounds: '1.5676',
        mean: '5.9170',
        meanAccepted: '7.1311',
        acceptance: '0.8297' },
      { name: 'downsize',
        rounds: '2.0169',
        mean: '6.5062',
        meanAccepted: '7.7363',
        acceptance: '0.8410' } ]

### 22 epochs

    [ { name: 'neural',
        rounds: '1.6303',
        mean: '6.2588',
        meanAccepted: '7.1406',
        acceptance: '0.8765' },
      { name: 'half-or-all',
        rounds: '1.4079',
        mean: '5.9562',
        meanAccepted: '7.2263',
        acceptance: '0.8243' },
      { name: 'downsize',
        rounds: '1.8824',
        mean: '6.5595',
        meanAccepted: '7.8346',
        acceptance: '0.8373' } ]

### 29 epochs

    [ { name: 'neural',
        rounds: '1.7405',
        mean: '6.1735',
        meanAccepted: '7.6666',
        acceptance: '0.8053' },
      { name: 'half-or-all',
        rounds: '1.4608',
        mean: '5.6632',
        meanAccepted: '7.1303',
        acceptance: '0.7943' },
      { name: 'downsize',
        rounds: '1.9878',
        mean: '6.1160',
        meanAccepted: '7.6834',
        acceptance: '0.7960' } ]

### 203 epochs

    [ { name: 'neural',
        rounds: '1.9005',
        mean: '6.1443',
        meanAccepted: '7.4793',
        acceptance: '0.8215' },
      { name: 'half-or-all',
        rounds: '1.4372',
        mean: '5.5702',
        meanAccepted: '7.0088',
        acceptance: '0.7947' },
      { name: 'downsize',
        rounds: '2.1199',
        mean: '6.0780',
        meanAccepted: '7.5153',
        acceptance: '0.8087' } ]

## Full-blown (all policy agents)

### 10 epochs

    [ { name: 'neural',
        rounds: '1.7324',
        mean: '4.3045',
        meanAccepted: '5.8704',
        acceptance: '0.7332' },
      { name: 'half-or-all',
        rounds: '1.5656',
        mean: '5.9310',
        meanAccepted: '7.5171',
        acceptance: '0.7890' },
      { name: 'downsize',
        rounds: '1.7915',
        mean: '5.7607',
        meanAccepted: '8.0598',
        acceptance: '0.7147' } ]

### 20 epochs

    [ { name: 'neural',
        rounds: '1.4957',
        mean: '4.5658',
        meanAccepted: '5.8367',
        acceptance: '0.7823' },
      { name: 'half-or-all',
        rounds: '1.4326',
        mean: '6.0388',
        meanAccepted: '7.5343',
        acceptance: '0.8015' },
      { name: 'downsize',
        rounds: '1.7335',
        mean: '6.1297',
        meanAccepted: '8.0575',
        acceptance: '0.7608' } ]

### 30 epochs

    [ { name: 'neural',
        rounds: '1.6543',
        mean: '5.0535',
        meanAccepted: '6.4892',
        acceptance: '0.7788' },
      { name: 'half-or-all',
        rounds: '1.5127',
        mean: '5.8945',
        meanAccepted: '7.4661',
        acceptance: '0.7895' },
      { name: 'downsize',
        rounds: '1.7557',
        mean: '6.2508',
        meanAccepted: '8.0370',
        acceptance: '0.7778' } ]

### 40 epochs

    [ { name: 'neural',
        rounds: '1.3613',
        mean: '5.1353',
        meanAccepted: '6.3164',
        acceptance: '0.8130' },
      { name: 'half-or-all',
        rounds: '1.3663',
        mean: '5.9060',
        meanAccepted: '7.4783',
        acceptance: '0.7897' },
      { name: 'downsize',
        rounds: '1.6439',
        mean: '6.4962',
        meanAccepted: '8.0824',
        acceptance: '0.8037' } ]

### 70 epochs

    [ { name: 'neural',
        rounds: '1.8240',
        mean: '5.4990',
        meanAccepted: '6.7328',
        acceptance: '0.8167' },
      { name: 'half-or-all',
        rounds: '1.5897',
        mean: '5.7058',
        meanAccepted: '7.3104',
        acceptance: '0.7805' },
      { name: 'downsize',
        rounds: '1.8835',
        mean: '6.4437',
        meanAccepted: '7.8992',
        acceptance: '0.8157' } ]

### 100 epochs

    [ { name: 'neural',
        rounds: '1.9857',
        mean: '5.8460',
        meanAccepted: '7.1249',
        acceptance: '0.8205' },
      { name: 'half-or-all',
        rounds: '1.6319',
        mean: '5.6288',
        meanAccepted: '7.1750',
        acceptance: '0.7845' },
      { name: 'downsize',
        rounds: '1.9826',
        mean: '6.2237',
        meanAccepted: '7.7555',
        acceptance: '0.8025' } ]

### 130 epochs

    [ { name: 'neural',
        rounds: '2.2474',
        mean: '6.0987',
        meanAccepted: '7.3790',
        acceptance: '0.8265' },
      { name: 'half-or-all',
        rounds: '1.7856',
        mean: '5.6182',
        meanAccepted: '7.1366',
        acceptance: '0.7873' },
      { name: 'downsize',
        rounds: '2.1021',
        mean: '6.2838',
        meanAccepted: '7.7078',
        acceptance: '0.8153' } ]

### 160 epochs

    [ { name: 'neural',
        rounds: '2.2009',
        mean: '6.0815',
        meanAccepted: '7.4826',
        acceptance: '0.8127' },
      { name: 'half-or-all',
        rounds: '1.7594',
        mean: '5.5600',
        meanAccepted: '7.0873',
        acceptance: '0.7845' },
      { name: 'downsize',
        rounds: '2.1159',
        mean: '6.1835',
        meanAccepted: '7.6647',
        acceptance: '0.8067' } ]

### 190 epochs

    [ { name: 'neural',
        rounds: '2.0305',
        mean: '6.3145',
        meanAccepted: '7.1350',
        acceptance: '0.8850' },
      { name: 'half-or-all',
        rounds: '1.6694',
        mean: '5.7805',
        meanAccepted: '7.1364',
        acceptance: '0.8100' },
      { name: 'downsize',
        rounds: '2.0688',
        mean: '6.3930',
        meanAccepted: '7.6793',
        acceptance: '0.8325' } ]

### 220 epochs

    [ { name: 'neural',
        rounds: '1.7633',
        mean: '6.1980',
        meanAccepted: '7.3918',
        acceptance: '0.8385' },
      { name: 'half-or-all',
        rounds: '1.4064',
        mean: '5.8550',
        meanAccepted: '7.2553',
        acceptance: '0.8070' },
      { name: 'downsize',
        rounds: '1.9034',
        mean: '6.2817',
        meanAccepted: '7.7793',
        acceptance: '0.8075' } ]

### 250 epochs

    [ { name: 'neural',
        rounds: '1.7412',
        mean: '6.2648',
        meanAccepted: '7.3768',
        acceptance: '0.8492' },
      { name: 'half-or-all',
        rounds: '1.4343',
        mean: '5.8125',
        meanAccepted: '7.2588',
        acceptance: '0.8007' },
      { name: 'downsize',
        rounds: '1.9647',
        mean: '6.3235',
        meanAccepted: '7.7637',
        acceptance: '0.8145' } ]

### 280 epochs

    [ { name: 'neural',
        rounds: '1.7055',
        mean: '6.2272',
        meanAccepted: '7.0404',
        acceptance: '0.8845' },
      { name: 'half-or-all',
        rounds: '1.4105',
        mean: '5.9615',
        meanAccepted: '7.2086',
        acceptance: '0.8270' },
      { name: 'downsize',
        rounds: '1.9102',
        mean: '6.6105',
        meanAccepted: '7.8138',
        acceptance: '0.8460' } ]

### 310 epochs

    [ { name: 'neural',
        rounds: '1.7421',
        mean: '6.1670',
        meanAccepted: '7.3989',
        acceptance: '0.8335' },
      { name: 'half-or-all',
        rounds: '1.4175',
        mean: '5.8445',
        meanAccepted: '7.2738',
        acceptance: '0.8035' },
      { name: 'downsize',
        rounds: '1.9841',
        mean: '6.3567',
        meanAccepted: '7.7521',
        acceptance: '0.8200' } ]

### 340 epochs

    [ { name: 'neural',
        rounds: '1.8837',
        mean: '5.9463',
        meanAccepted: '7.5364',
        acceptance: '0.7890' },
      { name: 'half-or-all',
        rounds: '1.4889',
        mean: '5.5883',
        meanAccepted: '7.0782',
        acceptance: '0.7895' },
      { name: 'downsize',
        rounds: '2.0451',
        mean: '5.9905',
        meanAccepted: '7.6654',
        acceptance: '0.7815' } ]

### 390 epochs

    [ { name: 'neural',
        rounds: '1.9508',
        mean: '6.1300',
        meanAccepted: '7.6339',
        acceptance: '0.8030' },
      { name: 'half-or-all',
        rounds: '1.4757',
        mean: '5.5578',
        meanAccepted: '7.1116',
        acceptance: '0.7815' },
      { name: 'downsize',
        rounds: '2.0855',
        mean: '6.1190',
        meanAccepted: '7.6679',
        acceptance: '0.7980' } ]

### 430 epochs

    [ { name: 'neural',
        rounds: '1.5559',
        mean: '6.1260',
        meanAccepted: '7.0800',
        acceptance: '0.8652' },
      { name: 'half-or-all',
        rounds: '1.3285',
        mean: '5.8963',
        meanAccepted: '7.3019',
        acceptance: '0.8075' },
      { name: 'downsize',
        rounds: '1.8796',
        mean: '6.5175',
        meanAccepted: '7.8077',
        acceptance: '0.8347' } ]

### 460 epochs

    [ { name: 'neural',
        rounds: '1.8271',
        mean: '6.2090',
        meanAccepted: '7.5720',
        acceptance: '0.8200' },
      { name: 'half-or-all',
        rounds: '1.4083',
        mean: '5.6265',
        meanAccepted: '7.1131',
        acceptance: '0.7910' },
      { name: 'downsize',
        rounds: '2.0437',
        mean: '6.2043',
        meanAccepted: '7.6928',
        acceptance: '0.8065' } ]

### 500 epochs

    [ { name: 'neural',
        rounds: '1.7773',
        mean: '6.1048',
        meanAccepted: '7.3975',
        acceptance: '0.8253' },
      { name: 'half-or-all',
        rounds: '1.4471',
        mean: '5.8318',
        meanAccepted: '7.2377',
        acceptance: '0.8057' },
      { name: 'downsize',
        rounds: '1.9631',
        mean: '6.2625',
        meanAccepted: '7.7602',
        acceptance: '0.8070' } ]

### 550 epochs

    [ { name: 'neural',
        rounds: '1.9963',
        mean: '6.1235',
        meanAccepted: '7.6068',
        acceptance: '0.8050' },
      { name: 'half-or-all',
        rounds: '1.4787',
        mean: '5.5565',
        meanAccepted: '7.1123',
        acceptance: '0.7813' },
      { name: 'downsize',
        rounds: '2.0931',
        mean: '6.1238',
        meanAccepted: '7.6763',
        acceptance: '0.7977' } ]

### 580 epochs

    [ { name: 'neural',
        rounds: '1.9157',
        mean: '5.8830',
        meanAccepted: '7.6627',
        acceptance: '0.7678' },
      { name: 'half-or-all',
        rounds: '1.4865',
        mean: '5.4930',
        meanAccepted: '7.1454',
        acceptance: '0.7688' },
      { name: 'downsize',
        rounds: '2.0509',
        mean: '6.0418',
        meanAccepted: '7.6867',
        acceptance: '0.7860' } ]

### 670 epochs

    [ { name: 'neural',
        rounds: '1.9594',
        mean: '5.7090',
        meanAccepted: '7.7885',
        acceptance: '0.7330' },
      { name: 'half-or-all',
        rounds: '1.5094',
        mean: '5.3790',
        meanAccepted: '7.2153',
        acceptance: '0.7455' },
      { name: 'downsize',
        rounds: '2.0605',
        mean: '5.9595',
        meanAccepted: '7.6748',
        acceptance: '0.7765' } ]

## no-cons 0.75

### 110

    [ { name: 'neural',
        rounds: '2.0899',
        mean: '6.2428',
        meanAccepted: '7.2150',
        acceptance: '0.8652' },
      { name: 'half-or-all',
        rounds: '1.6706',
        mean: '5.8285',
        meanAccepted: '7.1581',
        acceptance: '0.8143' },
      { name: 'downsize',
        rounds: '2.0802',
        mean: '6.4173',
        meanAccepted: '7.6853',
        acceptance: '0.8350' } ]

### 170

    [ { name: 'neural',
        rounds: '2.0505',
        mean: '6.4440',
        meanAccepted: '6.9179',
        acceptance: '0.9315' },
      { name: 'half-or-all',
        rounds: '1.6326',
        mean: '6.1005',
        meanAccepted: '7.2067',
        acceptance: '0.8465' },
      { name: 'downsize',
        rounds: '2.1293',
        mean: '6.5977',
        meanAccepted: '7.6186',
        acceptance: '0.8660' } ]

### 220

    [ { name: 'neural',
        rounds: '2.0509',
        mean: '6.5697',
        meanAccepted: '6.8956',
        acceptance: '0.9527' },
      { name: 'half-or-all',
        rounds: '1.6358',
        mean: '6.1130',
        meanAccepted: '7.1247',
        acceptance: '0.8580' },
      { name: 'downsize',
        rounds: '2.0795',
        mean: '6.7032',
        meanAccepted: '7.6718',
        acceptance: '0.8738' } ]

### 260

    [ { name: 'neural',
        rounds: '1.9549',
        mean: '6.5775',
        meanAccepted: '6.9346',
        acceptance: '0.9485' },
      { name: 'half-or-all',
        rounds: '1.5333',
        mean: '6.1185',
        meanAccepted: '7.1561',
        acceptance: '0.8550' },
      { name: 'downsize',
        rounds: '2.0660',
        mean: '6.6365',
        meanAccepted: '7.6546',
        acceptance: '0.8670' } ]

### 290

    [ { name: 'neural',
        rounds: '2.3933',
        mean: '6.5907',
        meanAccepted: '7.2907',
        acceptance: '0.9040' },
      { name: 'half-or-all',
        rounds: '1.8115',
        mean: '5.8342',
        meanAccepted: '6.9955',
        acceptance: '0.8340' },
      { name: 'downsize',
        rounds: '2.3207',
        mean: '6.3480',
        meanAccepted: '7.4376',
        acceptance: '0.8535' } ]

### 330

    [ { name: 'neural',
        rounds: '2.3071',
        mean: '6.4852',
        meanAccepted: '7.1779',
        acceptance: '0.9035' },
      { name: 'half-or-all',
        rounds: '1.7134',
        mean: '5.8957',
        meanAccepted: '7.0250',
        acceptance: '0.8393' },
      { name: 'downsize',
        rounds: '2.2585',
        mean: '6.3158',
        meanAccepted: '7.5076',
        acceptance: '0.8413' } ]

### 360

    [ { name: 'neural',
        rounds: '2.3916',
        mean: '6.5810',
        meanAccepted: '7.1845',
        acceptance: '0.9160' },
      { name: 'half-or-all',
        rounds: '1.8095',
        mean: '5.8120',
        meanAccepted: '6.9542',
        acceptance: '0.8357' },
      { name: 'downsize',
        rounds: '2.3125',
        mean: '6.3197',
        meanAccepted: '7.4945',
        acceptance: '0.8433' } ]

### 400

    [ { name: 'neural',
        rounds: '1.9859',
        mean: '6.5500',
        meanAccepted: '6.9811',
        acceptance: '0.9383' },
      { name: 'half-or-all',
        rounds: '1.5364',
        mean: '5.9535',
        meanAccepted: '7.0000',
        acceptance: '0.8505' },
      { name: 'downsize',
        rounds: '2.1293',
        mean: '6.5343',
        meanAccepted: '7.6090',
        acceptance: '0.8588' } ]

## Pairing (training two nets against each other)

### 640

    [ { name: 'neural',
        rounds: '2.0523',
        mean: '5.7713',
        meanAccepted: '7.2299',
        acceptance: '0.7983' },
      { name: 'half-or-all',
        rounds: '1.5624',
        mean: '5.3445',
        meanAccepted: '7.1141',
        acceptance: '0.7512' },
      { name: 'downsize',
        rounds: '2.1026',
        mean: '6.3265',
        meanAccepted: '7.5948',
        acceptance: '0.8330' } ]

## True self-play

### 10

    [ { name: 'neural',
        rounds: '2.1067',
        mean: '2.2003',
        meanAccepted: '5.9789',
        acceptance: '0.3680' },
      { name: 'half-or-all',
        rounds: '1.7587',
        mean: '4.4212',
        meanAccepted: '7.3200',
        acceptance: '0.6040' },
      { name: 'downsize',
        rounds: '1.8214',
        mean: '4.3143',
        meanAccepted: '8.0265',
        acceptance: '0.5375' } ]

### 30

    [ { name: 'neural',
        rounds: '1.8021',
        mean: '3.8167',
        meanAccepted: '5.3568',
        acceptance: '0.7125' },
      { name: 'half-or-all',
        rounds: '1.5921',
        mean: '5.8020',
        meanAccepted: '7.4889',
        acceptance: '0.7748' },
      { name: 'downsize',
        rounds: '1.8251',
        mean: '5.7140',
        meanAccepted: '8.0906',
        acceptance: '0.7063' } ]

### 40

    [ { name: 'neural',
        rounds: '1.8804',
        mean: '4.0578',
        meanAccepted: '5.7782',
        acceptance: '0.7023' },
      { name: 'half-or-all',
        rounds: '1.6418',
        mean: '5.8385',
        meanAccepted: '7.5021',
        acceptance: '0.7782' },
      { name: 'downsize',
        rounds: '1.8359',
        mean: '5.6920',
        meanAccepted: '8.0339',
        acceptance: '0.7085' } ]

### 50

    [ { name: 'neural',
        rounds: '1.7107',
        mean: '4.3535',
        meanAccepted: '5.9555',
        acceptance: '0.7310' },
      { name: 'half-or-all',
        rounds: '1.5375',
        mean: '5.8665',
        meanAccepted: '7.4899',
        acceptance: '0.7833' },
      { name: 'downsize',
        rounds: '1.7885',
        mean: '5.7648',
        meanAccepted: '8.0598',
        acceptance: '0.7153' } ]

### 60

    [ { name: 'neural',
        rounds: '1.7520',
        mean: '4.5670',
        meanAccepted: '6.2221',
        acceptance: '0.7340' },
      { name: 'half-or-all',
        rounds: '1.6033',
        mean: '5.8060',
        meanAccepted: '7.4964',
        acceptance: '0.7745' },
      { name: 'downsize',
        rounds: '1.8085',
        mean: '5.7947',
        meanAccepted: '8.0260',
        acceptance: '0.7220' } ]

### 70

    [ { name: 'neural',
        rounds: '1.6275',
        mean: '4.6290',
        meanAccepted: '6.3695',
        acceptance: '0.7268' },
      { name: 'half-or-all',
        rounds: '1.5160',
        mean: '5.7717',
        meanAccepted: '7.5596',
        acceptance: '0.7635' },
      { name: 'downsize',
        rounds: '1.7690',
        mean: '5.9463',
        meanAccepted: '8.0436',
        acceptance: '0.7392' } ]

### 90

    [ { name: 'neural',
        rounds: '1.5501',
        mean: '4.9925',
        meanAccepted: '5.8529',
        acceptance: '0.8530' },
      { name: 'half-or-all',
        rounds: '1.4949',
        mean: '6.1602',
        meanAccepted: '7.6217',
        acceptance: '0.8083' },
      { name: 'downsize',
        rounds: '1.7269',
        mean: '6.6605',
        meanAccepted: '8.1399',
        acceptance: '0.8183' } ]

### 110

    [ { name: 'neural',
        rounds: '1.7642',
        mean: '5.1045',
        meanAccepted: '6.5150',
        acceptance: '0.7835' },
      { name: 'half-or-all',
        rounds: '1.5729',
        mean: '5.7145',
        meanAccepted: '7.4699',
        acceptance: '0.7650' },
      { name: 'downsize',
        rounds: '1.8397',
        mean: '6.4052',
        meanAccepted: '7.9916',
        acceptance: '0.8015' } ]

### 660

    [ { name: 'neural',
        rounds: '1.9087',
        mean: '6.2927',
        meanAccepted: '7.1570',
        acceptance: '0.8792' },
      { name: 'half-or-all',
        rounds: '1.5503',
        mean: '5.8085',
        meanAccepted: '7.2155',
        acceptance: '0.8050' },
      { name: 'downsize',
        rounds: '1.9808',
        mean: '6.6268',
        meanAccepted: '7.8169',
        acceptance: '0.8478' } ]

## True self-play (-1.0 no consensus)

### 270

    [ { name: 'neural',
        rounds: '2.2817',
        mean: '5.7657',
        meanAccepted: '6.8457',
        acceptance: '0.8423' },
      { name: 'half-or-all',
        rounds: '1.8313',
        mean: '5.8208',
        meanAccepted: '7.3704',
        acceptance: '0.7897' },
      { name: 'downsize',
        rounds: '2.0692',
        mean: '6.5395',
        meanAccepted: '7.8037',
        acceptance: '0.8380' } ]

### 310

    [ { name: 'neural',
        rounds: '1.9647',
        mean: '5.9525',
        meanAccepted: '6.7854',
        acceptance: '0.8772' },
      { name: 'half-or-all',
        rounds: '1.6864',
        mean: '5.9348',
        meanAccepted: '7.3861',
        acceptance: '0.8035' },
      { name: 'downsize',
        rounds: '1.9523',
        mean: '6.6775',
        meanAccepted: '7.8582',
        acceptance: '0.8498' } ]

### 330

    [ { name: 'neural',
        rounds: '2.2097',
        mean: '5.7925',
        meanAccepted: '6.8611',
        acceptance: '0.8442' },
      { name: 'half-or-all',
        rounds: '1.7627',
        mean: '5.7737',
        meanAccepted: '7.3574',
        acceptance: '0.7847' },
      { name: 'downsize',
        rounds: '2.0811',
        mean: '6.4525',
        meanAccepted: '7.7835',
        acceptance: '0.8290' } ]

### 420

    [ { name: 'neural',
        rounds: '2.0736',
        mean: '5.9765',
        meanAccepted: '7.0353',
        acceptance: '0.8495' },
      { name: 'half-or-all',
        rounds: '1.6807',
        mean: '5.8063',
        meanAccepted: '7.3058',
        acceptance: '0.7947' },
      { name: 'downsize',
        rounds: '2.0298',
        mean: '6.4703',
        meanAccepted: '7.7978',
        acceptance: '0.8297' } ]

### 480

    [ { name: 'neural',
        rounds: '2.1344',
        mean: '5.8887',
        meanAccepted: '6.9402',
        acceptance: '0.8485' },
      { name: 'half-or-all',
        rounds: '1.7190',
        mean: '5.7947',
        meanAccepted: '7.3514',
        acceptance: '0.7883' },
      { name: 'downsize',
        rounds: '2.0807',
        mean: '6.4452',
        meanAccepted: '7.7584',
        acceptance: '0.8307' } ]

### 510

    [ { name: 'neural',
        rounds: '1.8530',
        mean: '6.1052',
        meanAccepted: '6.6615',
        acceptance: '0.9165' },
      { name: 'half-or-all',
        rounds: '1.5588',
        mean: '6.2123',
        meanAccepted: '7.4176',
        acceptance: '0.8375' },
      { name: 'downsize',
        rounds: '1.9381',
        mean: '6.8550',
        meanAccepted: '7.8975',
        acceptance: '0.8680' } ]

### 550

    [ { name: 'neural',
        rounds: '1.9968',
        mean: '6.0140',
        meanAccepted: '6.9406',
        meanDelta: '-0.5113',
        acceptance: '0.8665' },
      { name: 'half-or-all',
        rounds: '1.5576',
        mean: '5.8280',
        meanAccepted: '7.2736',
        meanDelta: '-0.3916',
        acceptance: '0.8013' },
      { name: 'downsize',
        rounds: '2.0546',
        mean: '6.5942',
        meanAccepted: '7.7877',
        meanDelta: '0.8937',
        acceptance: '0.8468' } ]

### 600

    [ { name: 'neural',
        rounds: '2.0112',
        mean: '5.8907',
        meanAccepted: '7.1620',
        meanDelta: '-0.3395',
        acceptance: '0.8225' },
      { name: 'half-or-all',
        rounds: '1.6155',
        mean: '5.7900',
        meanAccepted: '7.3175',
        meanDelta: '-0.3997',
        acceptance: '0.7913' },
      { name: 'downsize',
        rounds: '2.0262',
        mean: '6.3995',
        meanAccepted: '7.7971',
        meanDelta: '0.7256',
        acceptance: '0.8207' } ]

### 670

    [ { name: 'neural',
        rounds: '2.0215',
        mean: '6.0610',
        meanAccepted: '7.0559',
        meanDelta: '-0.4744',
        acceptance: '0.8590' },
      { name: 'half-or-all',
        rounds: '1.6348',
        mean: '5.8102',
        meanAccepted: '7.3039',
        meanDelta: '-0.3686',
        acceptance: '0.7955' },
      { name: 'downsize',
        rounds: '2.0974',
        mean: '6.4722',
        meanAccepted: '7.7373',
        meanDelta: '0.8377',
        acceptance: '0.8365' } ]

### 720

    [ { name: 'neural',
        rounds: '2.1172',
        mean: '6.1210',
        meanAccepted: '7.0336',
        meanDelta: '-0.4608',
        acceptance: '0.8702' },
      { name: 'half-or-all',
        rounds: '1.6870',
        mean: '5.8720',
        meanAccepted: '7.3308',
        meanDelta: '-0.3052',
        acceptance: '0.8010' },
      { name: 'downsize',
        rounds: '2.1416',
        mean: '6.5083',
        meanAccepted: '7.7272',
        meanDelta: '0.7664',
        acceptance: '0.8423' } ]

### 760

    [ { name: 'neural',
        rounds: '1.9395',
        mean: '6.2500',
        meanAccepted: '6.9969',
        meanDelta: '-0.5757',
        acceptance: '0.8932' },
      { name: 'half-or-all',
        rounds: '1.6064',
        mean: '6.0403',
        meanAccepted: '7.3774',
        meanDelta: '-0.1982',
        acceptance: '0.8187' },
      { name: 'downsize',
        rounds: '2.0097',
        mean: '6.6517',
        meanAccepted: '7.7889',
        meanDelta: '0.7922',
        acceptance: '0.8540' } ]

### 810

    [ { name: 'neural',
        rounds: '2.1070',
        mean: '6.2650',
        meanAccepted: '7.1498',
        meanDelta: '-0.3250',
        acceptance: '0.8762' },
      { name: 'half-or-all',
        rounds: '1.7037',
        mean: '5.9230',
        meanAccepted: '7.3350',
        meanDelta: '-0.2830',
        acceptance: '0.8075' },
      { name: 'downsize',
        rounds: '2.1330',
        mean: '6.5450',
        meanAccepted: '7.7023',
        meanDelta: '0.6040',
        acceptance: '0.8498' } ]

### 870

    [ { name: 'neural',
        rounds: '1.9975',
        mean: '6.1525',
        meanAccepted: '6.8399',
        meanDelta: '-0.7240',
        acceptance: '0.8995' },
      { name: 'half-or-all',
        rounds: '1.6009',
        mean: '5.9592',
        meanAccepted: '7.3232',
        meanDelta: '-0.1318',
        acceptance: '0.8137' },
      { name: 'downsize',
        rounds: '2.0489',
        mean: '6.6930',
        meanAccepted: '7.7939',
        meanDelta: '0.8833',
        acceptance: '0.8588' } ]

### 900

    [ { name: 'neural',
        rounds: '1.9942',
        mean: '6.1325',
        meanAccepted: '7.1683',
        meanDelta: '-0.3673',
        acceptance: '0.8555' },
      { name: 'half-or-all',
        rounds: '1.5932',
        mean: '5.9292',
        meanAccepted: '7.3473',
        meanDelta: '-0.3194',
        acceptance: '0.8070' },
      { name: 'downsize',
        rounds: '2.0763',
        mean: '6.5838',
        meanAccepted: '7.7593',
        meanDelta: '0.6741',
        acceptance: '0.8485' } ]

### 960

    [ { name: 'neural',
        rounds: '2.0699',
        mean: '6.0832',
        meanAccepted: '7.4231',
        meanDelta: '-0.0015',
        acceptance: '0.8195' },
      { name: 'half-or-all',
        rounds: '1.6074',
        mean: '5.7005',
        meanAccepted: '7.3013',
        meanDelta: '-0.5789',
        acceptance: '0.7808' },
      { name: 'downsize',
        rounds: '2.0636',
        mean: '6.4512',
        meanAccepted: '7.7796',
        meanDelta: '0.5466',
        acceptance: '0.8293' } ]

### 1040

    [ { name: 'neural',
        rounds: '2.1053',
        mean: '6.2767',
        meanAccepted: '7.1246',
        meanDelta: '-0.3479',
        acceptance: '0.8810' },
      { name: 'half-or-all',
        rounds: '1.6334',
        mean: '5.8985',
        meanAccepted: '7.3114',
        meanDelta: '-0.3173',
        acceptance: '0.8067' },
      { name: 'downsize',
        rounds: '2.0921',
        mean: '6.5077',
        meanAccepted: '7.7358',
        meanDelta: '0.6686',
        acceptance: '0.8413' } ]

### 1070

    [ { name: 'neural',
        rounds: '2.0818',
        mean: '6.1967',
        meanAccepted: '7.2689',
        meanDelta: '-0.1282',
        acceptance: '0.8525' },
      { name: 'half-or-all',
        rounds: '1.5759',
        mean: '5.8030',
        meanAccepted: '7.2697',
        meanDelta: '-0.4754',
        acceptance: '0.7983' },
      { name: 'downsize',
        rounds: '2.0924',
        mean: '6.4230',
        meanAccepted: '7.7316',
        meanDelta: '0.5883',
        acceptance: '0.8307' } ]

### 1130

    [ { name: 'neural',
        rounds: '2.1275',
        mean: '6.0105',
        meanAccepted: '7.4021',
        meanDelta: '0.0453',
        acceptance: '0.8120' },
      { name: 'half-or-all',
        rounds: '1.6418',
        mean: '5.6020',
        meanAccepted: '7.2447',
        meanDelta: '-0.5794',
        acceptance: '0.7732' },
      { name: 'downsize',
        rounds: '2.1444',
        mean: '6.2910',
        meanAccepted: '7.6978',
        meanDelta: '0.5032',
        acceptance: '0.8173' } ]

### 1430

    [ { name: 'neural',
        rounds: '2.1340',
        mean: '6.1878',
        meanAccepted: '7.3055',
        meanDelta: '-0.0071',
        acceptance: '0.8470' },
      { name: 'half-or-all',
        rounds: '1.6361',
        mean: '5.7343',
        meanAccepted: '7.2084',
        meanDelta: '-0.5226',
        acceptance: '0.7955' },
      { name: 'downsize',
        rounds: '2.1621',
        mean: '6.4370',
        meanAccepted: '7.6722',
        meanDelta: '0.5027',
        acceptance: '0.8390' } ]

### 1540

    [ { name: 'neural',
        rounds: '2.0368',
        mean: '6.1872',
        meanAccepted: '7.0091',
        meanDelta: '-0.3702',
        acceptance: '0.8828' },
      { name: 'half-or-all',
        rounds: '1.5361',
        mean: '5.8925',
        meanAccepted: '7.2367',
        meanDelta: '-0.3823',
        acceptance: '0.8143' },
      { name: 'downsize',
        rounds: '2.1534',
        mean: '6.4688',
        meanAccepted: '7.7055',
        meanDelta: '0.7600',
        acceptance: '0.8395' } ]

### 1660

    [ { name: 'neural',
        rounds: '2.3716',
        mean: '6.1240',
        meanAccepted: '7.0290',
        meanDelta: '-0.3044',
        acceptance: '0.8712' },
      { name: 'half-or-all',
        rounds: '1.7538',
        mean: '5.8975',
        meanAccepted: '7.3238',
        meanDelta: '-0.2269',
        acceptance: '0.8053' },
      { name: 'downsize',
        rounds: '2.2860',
        mean: '6.4250',
        meanAccepted: '7.6081',
        meanDelta: '0.5305',
        acceptance: '0.8445' } ]

### 1730

    [ { name: 'neural',
        rounds: '2.2702',
        mean: '6.0805',
        meanAccepted: '7.2625',
        meanDelta: '-0.0666',
        acceptance: '0.8373' },
      { name: 'half-or-all',
        rounds: '1.7250',
        mean: '5.7603',
        meanAccepted: '7.2320',
        meanDelta: '-0.4470',
        acceptance: '0.7965' },
      { name: 'downsize',
        rounds: '2.1932',
        mean: '6.3330',
        meanAccepted: '7.6601',
        meanDelta: '0.4980',
        acceptance: '0.8267' } ]

### 1920

    [ { name: 'neural',
        rounds: '2.2700',
        mean: '5.8670',
        meanAccepted: '7.5170',
        meanDelta: '0.3575',
        acceptance: '0.7805' },
      { name: 'half-or-all',
        rounds: '1.6944',
        mean: '5.3815',
        meanAccepted: '7.1420',
        meanDelta: '-0.6987',
        acceptance: '0.7535' },
      { name: 'downsize',
        rounds: '2.2067',
        mean: '6.0812',
        meanAccepted: '7.5968',
        meanDelta: '0.3092',
        acceptance: '0.8005' } ]

### 2110

    [ { name: 'neural',
        rounds: '2.0762',
        mean: '6.1742',
        meanAccepted: '7.1050',
        meanDelta: '-0.2428',
        acceptance: '0.8690' },
      { name: 'half-or-all',
        rounds: '1.5970',
        mean: '5.9737',
        meanAccepted: '7.2629',
        meanDelta: '-0.2541',
        acceptance: '0.8225' },
      { name: 'downsize',
        rounds: '2.1602',
        mean: '6.3185',
        meanAccepted: '7.6541',
        meanDelta: '0.5088',
        acceptance: '0.8255' } ]

### 2130

    [ { name: 'neural',
        rounds: '2.2305',
        mean: '5.8937',
        meanAccepted: '7.1591',
        meanDelta: '-0.0975',
        acceptance: '0.8233' },
      { name: 'half-or-all',
        rounds: '1.6784',
        mean: '5.7675',
        meanAccepted: '7.2252',
        meanDelta: '-0.3257',
        acceptance: '0.7983' },
      { name: 'downsize',
        rounds: '2.2209',
        mean: '6.1748',
        meanAccepted: '7.5997',
        meanDelta: '0.4188',
        acceptance: '0.8125' } ]

### 2220

    [ { name: 'neural',
        rounds: '1.9922',
        mean: '5.8632',
        meanAccepted: '7.3153',
        meanDelta: '-0.0309',
        acceptance: '0.8015' },
      { name: 'half-or-all',
        rounds: '1.5630',
        mean: '5.6810',
        meanAccepted: '7.2485',
        meanDelta: '-0.4166',
        acceptance: '0.7837' },
      { name: 'downsize',
        rounds: '2.0966',
        mean: '6.1377',
        meanAccepted: '7.6746',
        meanDelta: '0.4392',
        acceptance: '0.7997' } ]

### 2390

    [ { name: 'neural',
        rounds: '2.3482',
        mean: '5.8128',
        meanAccepted: '6.9844',
        meanDelta: '-0.4479',
        acceptance: '0.8323' },
      { name: 'half-or-all',
        rounds: '1.7744',
        mean: '5.8750',
        meanAccepted: '7.4132',
        meanDelta: '0.0416',
        acceptance: '0.7925' },
      { name: 'downsize',
        rounds: '2.2351',
        mean: '6.1825',
        meanAccepted: '7.6304',
        meanDelta: '0.4193',
        acceptance: '0.8103' } ]

### 2420

    [ { name: 'neural',
        rounds: '2.2172',
        mean: '5.6575',
        meanAccepted: '7.1456',
        meanDelta: '-0.2611',
        acceptance: '0.7917' },
      { name: 'half-or-all',
        rounds: '1.7439',
        mean: '5.6660',
        meanAccepted: '7.3370',
        meanDelta: '-0.1185',
        acceptance: '0.7722' },
      { name: 'downsize',
        rounds: '2.2311',
        mean: '5.8945',
        meanAccepted: '7.6009',
        meanDelta: '0.3846',
        acceptance: '0.7755' } ]

### 2490

    [ { name: 'neural',
        rounds: '2.0905',
        mean: '5.8100',
        meanAccepted: '7.2557',
        meanDelta: '-0.1133',
        acceptance: '0.8007' },
      { name: 'half-or-all',
        rounds: '1.5972',
        mean: '5.7555',
        meanAccepted: '7.2739',
        meanDelta: '-0.3839',
        acceptance: '0.7913' },
      { name: 'downsize',
        rounds: '2.1091',
        mean: '6.1258',
        meanAccepted: '7.7053',
        meanDelta: '0.4962',
        acceptance: '0.7950' } ]

### 2560

    [ { name: 'neural',
        rounds: '2.0196',
        mean: '5.7717',
        meanAccepted: '7.0559',
        meanDelta: '-0.3432',
        acceptance: '0.8180' },
      { name: 'half-or-all',
        rounds: '1.6393',
        mean: '5.9125',
        meanAccepted: '7.3288',
        meanDelta: '-0.1236',
        acceptance: '0.8067' },
      { name: 'downsize',
        rounds: '2.1601',
        mean: '6.0990',
        meanAccepted: '7.6261',
        meanDelta: '0.4758',
        acceptance: '0.7997' } ]

### 2620

    [ { name: 'neural',
        rounds: '2.1662',
        mean: '5.8135',
        meanAccepted: '7.1026',
        meanDelta: '-0.3076',
        acceptance: '0.8185' },
      { name: 'half-or-all',
        rounds: '1.6537',
        mean: '5.8745',
        meanAccepted: '7.3847',
        meanDelta: '-0.1163',
        acceptance: '0.7955' },
      { name: 'downsize',
        rounds: '2.1478',
        mean: '6.2348',
        meanAccepted: '7.6783',
        meanDelta: '0.4240',
        acceptance: '0.8120' } ]

### 2770

    [ { name: 'neural',
        rounds: '2.1490',
        mean: '5.4370',
        meanAccepted: '7.3647',
        meanDelta: '0.0684',
        acceptance: '0.7382' },
      { name: 'half-or-all',
        rounds: '1.5964',
        mean: '5.4672',
        meanAccepted: '7.2582',
        meanDelta: '-0.4779',
        acceptance: '0.7532' },
      { name: 'downsize',
        rounds: '2.1494',
        mean: '5.8857',
        meanAccepted: '7.6787',
        meanDelta: '0.4038',
        acceptance: '0.7665' } ]

### 4750

    Very bad

## Entropy schedule

### 1710

    [ { name: 'neural',
        rounds: '2.3529',
        mean: '5.7630',
        meanAccepted: '7.5457',
        meanDelta: '0.3008',
        acceptance: '0.7638' },
      { name: 'half-or-all',
        rounds: '1.7206',
        mean: '5.3647',
        meanAccepted: '7.2399',
        meanDelta: '-0.6937',
        acceptance: '0.7410' },
      { name: 'downsize',
        rounds: '2.2411',
        mean: '6.1550',
        meanAccepted: '7.6105',
        meanDelta: '0.3515',
        acceptance: '0.8087' } ]

## Fixed dist

### 560

    [ { name: 'neural',
        rounds: '2.2425',
        mean: '5.9670',
        meanAccepted: '6.8000',
        meanDelta: '-0.7556',
        acceptance: '0.8775' },
      { name: 'half-or-all',
        rounds: '1.8306',
        mean: '6.0393',
        meanAccepted: '7.3582',
        meanDelta: '-0.1782',
        acceptance: '0.8207' },
      { name: 'downsize',
        rounds: '2.1109',
        mean: '6.6550',
        meanAccepted: '7.7905',
        meanDelta: '0.9473',
        acceptance: '0.8542' } ]

### 690

    [ { name: 'neural',
        rounds: '2.3515',
        mean: '5.7242',
        meanAccepted: '7.3107',
        meanDelta: '0.0080',
        acceptance: '0.7830' },
      { name: 'half-or-all',
        rounds: '1.7908',
        mean: '5.3495',
        meanAccepted: '7.2071',
        meanDelta: '-0.5783',
        acceptance: '0.7422' },
      { name: 'downsize',
        rounds: '2.1773',
        mean: '6.1502',
        meanAccepted: '7.6806',
        meanDelta: '0.5283',
        acceptance: '0.8007' } ]

### 730

    [ { name: 'neural',
        rounds: '2.1656',
        mean: '6.1292',
        meanAccepted: '6.9062',
        meanDelta: '-0.5428',
        acceptance: '0.8875' },
      { name: 'half-or-all',
        rounds: '1.7502',
        mean: '5.8915',
        meanAccepted: '7.2779',
        meanDelta: '-0.2681',
        acceptance: '0.8095' },
      { name: 'downsize',
        rounds: '2.1044',
        mean: '6.6045',
        meanAccepted: '7.7291',
        meanDelta: '0.8177',
        acceptance: '0.8545' } ]

### 820

    [ { name: 'neural',
        rounds: '2.0363',
        mean: '6.0135',
        meanAccepted: '6.9320',
        meanDelta: '-0.5530',
        acceptance: '0.8675' },
      { name: 'half-or-all',
        rounds: '1.6334',
        mean: '5.8422',
        meanAccepted: '7.2983',
        meanDelta: '-0.2527',
        acceptance: '0.8005' },
      { name: 'downsize',
        rounds: '2.0572',
        mean: '6.4642',
        meanAccepted: '7.7836',
        meanDelta: '0.8212',
        acceptance: '0.8305' } ]

### 920

    [ { name: 'neural',
        rounds: '2.0198',
        mean: '6.3427',
        meanAccepted: '6.6122',
        meanDelta: '-1.0691',
        acceptance: '0.9593' },
      { name: 'half-or-all',
        rounds: '1.6753',
        mean: '6.4100',
        meanAccepted: '7.4470',
        meanDelta: '0.0668',
        acceptance: '0.8608' },
      { name: 'downsize',
        rounds: '2.0313',
        mean: '6.8792',
        meanAccepted: '7.8396',
        meanDelta: '1.1031',
        acceptance: '0.8775' } ]

### 970

    [ { name: 'neural',
        rounds: '1.9848',
        mean: '6.2533',
        meanAccepted: '6.8963',
        meanDelta: '-0.5983',
        acceptance: '0.9067' },
      { name: 'half-or-all',
        rounds: '1.5820',
        mean: '6.0500',
        meanAccepted: '7.3200',
        meanDelta: '-0.2175',
        acceptance: '0.8265' },
      { name: 'downsize',
        rounds: '2.0557',
        mean: '6.6733',
        meanAccepted: '7.7799',
        meanDelta: '0.8420',
        acceptance: '0.8578' } ]

### 1020

    [ { name: 'neural',
        rounds: '2.0309',
        mean: '6.1707',
        meanAccepted: '7.1194',
        meanDelta: '-0.3349',
        acceptance: '0.8668' },
      { name: 'half-or-all',
        rounds: '1.5937',
        mean: '5.8303',
        meanAccepted: '7.2493',
        meanDelta: '-0.4044',
        acceptance: '0.8043' },
      { name: 'downsize',
        rounds: '2.1036',
        mean: '6.4700',
        meanAccepted: '7.7485',
        meanDelta: '0.7371',
        acceptance: '0.8350' } ]

Running on real arena:

    43 { hash: 'bf015ba7b7643dcefdf574347b2511f6',
      date: '2018-07-03',
      mean: 6.380398671096345,
      meanAccepted: 7.19778534923339,
      acceptance: 0.8864391422530957,
      sessions: 6622 }

### 1160

    [ { name: 'neural',
        rounds: '2.1689',
        mean: '6.1028',
        meanAccepted: '7.2978',
        meanDelta: '0.0383',
        acceptance: '0.8363' },
      { name: 'half-or-all',
        rounds: '1.6852',
        mean: '5.6220',
        meanAccepted: '7.1210',
        meanDelta: '-0.5839',
        acceptance: '0.7895' },
      { name: 'downsize',
        rounds: '2.1872',
        mean: '6.2332',
        meanAccepted: '7.6646',
        meanDelta: '0.5275',
        acceptance: '0.8133' } ]

Real arena:

    74 { hash: 'f4956b21d5fbe67144b4c74cb1a2a171',
      date: '2018-07-03',
      mean: 6.099016772700983,
      meanAccepted: 7.262534435261708,
      acceptance: 0.8397917871602082,
      sessions: 8645 }

### 1220

    [ { name: 'neural',
        rounds: '2.2305',
        mean: '5.9218',
        meanAccepted: '7.4699',
        meanDelta: '0.2252',
        acceptance: '0.7927' },
      { name: 'half-or-all',
        rounds: '1.6999',
        mean: '5.4863',
        meanAccepted: '7.1810',
        meanDelta: '-0.6679',
        acceptance: '0.7640' },
      { name: 'downsize',
        rounds: '2.1986',
        mean: '6.1275',
        meanAccepted: '7.6284',
        meanDelta: '0.4130',
        acceptance: '0.8033' } ]

### 1320

    [ { name: 'neural',
        rounds: '2.1739',
        mean: '6.0070',
        meanAccepted: '7.4621',
        meanDelta: '0.2311',
        acceptance: '0.8050' },
      { name: 'half-or-all',
        rounds: '1.6422',
        mean: '5.5565',
        meanAccepted: '7.1766',
        meanDelta: '-0.6716',
        acceptance: '0.7742' },
      { name: 'downsize',
        rounds: '2.1762',
        mean: '6.1363',
        meanAccepted: '7.6393',
        meanDelta: '0.4158',
        acceptance: '0.8033' } ]

Real arena:

    75 { hash: '3717824739222fe3aa4e1d96d2b6eadc',
      date: '2018-07-03',
      mean: 6.090970578288807,
      meanAccepted: 7.482758620689655,
      acceptance: 0.8140006763611769,
      sessions: 2957 }

### 1400

    [ { name: 'neural',
        rounds: '2.2824',
        mean: '6.2512',
        meanAccepted: '7.4731',
        meanDelta: '0.1742',
        acceptance: '0.8365' },
      { name: 'half-or-all',
        rounds: '1.7438',
        mean: '5.6392',
        meanAccepted: '7.2601',
        meanDelta: '-0.5552',
        acceptance: '0.7768' },
      { name: 'downsize',
        rounds: '2.2219',
        mean: '6.2882',
        meanAccepted: '7.6152',
        meanDelta: '0.3457',
        acceptance: '0.8257' } ]

### 1460

    [ { name: 'neural',
        rounds: '2.2293',
        mean: '6.0030',
        meanAccepted: '7.6350',
        meanDelta: '0.4188',
        acceptance: '0.7863' },
      { name: 'half-or-all',
        rounds: '1.6427',
        mean: '5.5270',
        meanAccepted: '7.2013',
        meanDelta: '-0.7166',
        acceptance: '0.7675' },
      { name: 'downsize',
        rounds: '2.1743',
        mean: '6.0942',
        meanAccepted: '7.6681',
        meanDelta: '0.2778',
        acceptance: '0.7947' } ]

### 1490

    [ { name: 'neural',
        rounds: '2.3020',
        mean: '5.9520',
        meanAccepted: '7.5773',
        meanDelta: '0.4122',
        acceptance: '0.7855' },
      { name: 'half-or-all',
        rounds: '1.6807',
        mean: '5.4807',
        meanAccepted: '7.1879',
        meanDelta: '-0.7384',
        acceptance: '0.7625' },
      { name: 'downsize',
        rounds: '2.2023',
        mean: '6.1033',
        meanAccepted: '7.6100',
        meanDelta: '0.2983',
        acceptance: '0.8020' } ]

### 1580

    [ { name: 'neural',
        rounds: '2.1799',
        mean: '5.9832',
        meanAccepted: '7.4488',
        meanDelta: '0.2026',
        acceptance: '0.8033' },
      { name: 'half-or-all',
        rounds: '1.6567',
        mean: '5.5430',
        meanAccepted: '7.2010',
        meanDelta: '-0.6210',
        acceptance: '0.7698' },
      { name: 'downsize',
        rounds: '2.1824',
        mean: '6.1795',
        meanAccepted: '7.6290',
        meanDelta: '0.3892',
        acceptance: '0.8100' } ]

Real:

    52 { hash: 'ce706832ca69e1fb16001b074fd2ef0e',
      date: '2018-07-04',
      mean: 6.250992220987459,
      meanAccepted: 7.735756385068762,
      acceptance: 0.8080647721860613,
      sessions: 6299 }

### 1690

    [ { name: 'neural',
        rounds: '2.2896',
        mean: '6.0370',
        meanAccepted: '7.1571',
        meanDelta: '-0.1248',
        acceptance: '0.8435' },
      { name: 'half-or-all',
        rounds: '1.7086',
        mean: '5.7512',
        meanAccepted: '7.1778',
        meanDelta: '-0.3847',
        acceptance: '0.8013' },
      { name: 'downsize',
        rounds: '2.2801',
        mean: '6.3180',
        meanAccepted: '7.6374',
        meanDelta: '0.4998',
        acceptance: '0.8273' } ]

### 1730

    [ { name: 'neural',
        rounds: '2.3435',
        mean: '6.2235',
        meanAccepted: '7.3218',
        meanDelta: '0.0294',
        acceptance: '0.8500' },
      { name: 'half-or-all',
        rounds: '1.7941',
        mean: '5.8720',
        meanAccepted: '7.2718',
        meanDelta: '-0.4115',
        acceptance: '0.8075' },
      { name: 'downsize',
        rounds: '2.2773',
        mean: '6.2412',
        meanAccepted: '7.5835',
        meanDelta: '0.3733',
        acceptance: '0.8230' } ]

Real:

    Position 2/13, entry { hash: 'b9edc898ba44ae95d67f85ae545a6ba8',
      date: '2018-07-04',
      mean: 6.360683567224989,
      meanAccepted: 7.457935244161359,
      acceptance: 0.8528746038931643,
      sessions: 8836 }

### 1800

    [ { name: 'neural',
        rounds: '2.3026',
        mean: '6.2160',
        meanAccepted: '7.4421',
        meanDelta: '0.2658',
        acceptance: '0.8353' },
      { name: 'half-or-all',
        rounds: '1.6956',
        mean: '5.7045',
        meanAccepted: '7.1530',
        meanDelta: '-0.6132',
        acceptance: '0.7975' },
      { name: 'downsize',
        rounds: '2.2207',
        mean: '6.2127',
        meanAccepted: '7.6160',
        meanDelta: '0.3273',
        acceptance: '0.8157' } ]

### 1850

    [ { name: 'neural',
        rounds: '2.2146',
        mean: '6.1540',
        meanAccepted: '7.5140',
        meanDelta: '0.2656',
        acceptance: '0.8190' },
      { name: 'half-or-all',
        rounds: '1.6598',
        mean: '5.6828',
        meanAccepted: '7.2139',
        meanDelta: '-0.6131',
        acceptance: '0.7877' },
      { name: 'downsize',
        rounds: '2.2019',
        mean: '6.1720',
        meanAccepted: '7.6315',
        meanDelta: '0.3283',
        acceptance: '0.8087' } ]

### 1890

    [ { name: 'neural',
        rounds: '2.2175',
        mean: '5.9445',
        meanAccepted: '7.7428',
        meanDelta: '0.6252',
        acceptance: '0.7678' },
      { name: 'half-or-all',
        rounds: '1.6671',
        mean: '5.4795',
        meanAccepted: '7.1255',
        meanDelta: '-0.7877',
        acceptance: '0.7690' },
      { name: 'downsize',
        rounds: '2.1842',
        mean: '5.9140',
        meanAccepted: '7.5893',
        meanDelta: '0.1614',
        acceptance: '0.7792' } ]

Real:

    Position 5/20, entry { hash: '0a8e12067078526c09dcd5a2ec7277fd',
      date: '2018-07-04',
      mean: 6.154591660923501,
      meanAccepted: 7.702280200528273,
      acceptance: 0.7990609924190214,
      sessions: 46432 }

### 2400

    [ { name: 'neural',
        rounds: '2.2653',
        mean: '5.9958',
        meanAccepted: '7.3726',
        meanDelta: '0.1795',
        acceptance: '0.8133' },
      { name: 'half-or-all',
        rounds: '1.6880',
        mean: '5.6947',
        meanAccepted: '7.1790',
        meanDelta: '-0.5484',
        acceptance: '0.7933' },
      { name: 'downsize',
        rounds: '2.2211',
        mean: '6.1225',
        meanAccepted: '7.6150',
        meanDelta: '0.3595',
        acceptance: '0.8040' } ]

Real:

    Position 5/21, entry { hash: 'ea63771bb8f37929ea879d748914f96e',
      date: '2018-07-04',
      mean: 6.221493795364084,
      meanAccepted: 7.708732230925443,
      acceptance: 0.8070709435729337,
      sessions: 4271 }

## lstm64

### 3010

Real:

    Position 6/25, entry { hash: '53e743e29262f41cd69fda89f145cdb2',
      date: '2018-07-04',
      mean: 6.17296786389414,
      meanAccepted: 7.712723351817622,
      acceptance: 0.8003616339278375,
      sessions: 24334 }

## cos-lstm128

### 300

    [ { name: 'neural',
        rounds: '1.5674',
        mean: '5.5840',
        meanAccepted: '5.9027',
        meanDelta: '-2.0758',
        acceptance: '0.9460' },
      { name: 'half-or-all',
        rounds: '1.4483',
        mean: '6.4640',
        meanAccepted: '7.5163',
        meanDelta: '0.4927',
        acceptance: '0.8600' },
      { name: 'downsize',
        rounds: '1.7516',
        mean: '6.9530',
        meanAccepted: '8.1179',
        meanDelta: '1.7980',
        acceptance: '0.8565' } ]

### 420

    [ { name: 'neural',
        rounds: '1.8046',
        mean: '5.7235',
        meanAccepted: '6.6785',
        meanDelta: '-1.0108',
        acceptance: '0.8570' },
      { name: 'half-or-all',
        rounds: '1.5657',
        mean: '6.0648',
        meanAccepted: '7.3938',
        meanDelta: '-0.0018',
        acceptance: '0.8203' },
      { name: 'downsize',
        rounds: '1.8879',
        mean: '6.4295',
        meanAccepted: '7.8962',
        meanDelta: '1.0657',
        acceptance: '0.8143' } ]

### 570

    [ { name: 'neural',
        rounds: '2.1237',
        mean: '5.8715',
        meanAccepted: '6.6457',
        meanDelta: '-1.0023',
        acceptance: '0.8835' },
      { name: 'half-or-all',
        rounds: '1.7473',
        mean: '6.0935',
        meanAccepted: '7.4040',
        meanDelta: '-0.0963',
        acceptance: '0.8230' },
      { name: 'downsize',
        rounds: '2.0145',
        mean: '6.6508',
        meanAccepted: '7.8475',
        meanDelta: '1.1383',
        acceptance: '0.8475' } ]

### 640

    [ { name: 'neural',
        rounds: '2.2595',
        mean: '5.9270',
        meanAccepted: '6.9281',
        meanDelta: '-0.5643',
        acceptance: '0.8555' },
      { name: 'half-or-all',
        rounds: '1.8332',
        mean: '5.9612',
        meanAccepted: '7.3778',
        meanDelta: '-0.1584',
        acceptance: '0.8080' },
      { name: 'downsize',
        rounds: '2.1202',
        mean: '6.3833',
        meanAccepted: '7.7326',
        meanDelta: '0.7399',
        acceptance: '0.8255' } ]

Real:

    Position 11/26, entry { hash: 'd12b4674d76e06e617b25e3041987501',
      date: '2018-07-04',
      mean: 5.923642439431913,
      meanAccepted: 7.0722122481547975,
      acceptance: 0.837593984962406,
      sessions: 5985 }

### 750

    [ { name: 'neural',
        rounds: '2.2456',
        mean: '5.9543',
        meanAccepted: '7.1159',
        meanDelta: '-0.3977',
        acceptance: '0.8367' },
      { name: 'half-or-all',
        rounds: '1.8127',
        mean: '5.9345',
        meanAccepted: '7.3379',
        meanDelta: '-0.3104',
        acceptance: '0.8087' },
      { name: 'downsize',
        rounds: '2.0924',
        mean: '6.3415',
        meanAccepted: '7.7619',
        meanDelta: '0.7145',
        acceptance: '0.8170' } ]

### 840

    [ { name: 'neural',
        rounds: '2.0532',
        mean: '6.1727',
        meanAccepted: '6.9847',
        meanDelta: '-0.5847',
        acceptance: '0.8838' },
      { name: 'half-or-all',
        rounds: '1.6739',
        mean: '6.0365',
        meanAccepted: '7.3526',
        meanDelta: '-0.2351',
        acceptance: '0.8210' },
      { name: 'downsize',
        rounds: '1.9949',
        mean: '6.5180',
        meanAccepted: '7.8083',
        meanDelta: '0.8503',
        acceptance: '0.8347' } ]

Real:

    Position 17/40, entry { hash: 'a390d6247e2f80f55a6351e5322edcb3',
      date: '2018-07-04',
      mean: 6.1282330944219385,
      meanAccepted: 7.066295364714337,
      acceptance: 0.8672483639763167,
      sessions: 19254 }

### 990

    [ { name: 'neural',
        rounds: '1.9671',
        mean: '6.0250',
        meanAccepted: '6.8956',
        meanDelta: '-0.7488',
        acceptance: '0.8738' },
      { name: 'half-or-all',
        rounds: '1.6273',
        mean: '6.0450',
        meanAccepted: '7.4104',
        meanDelta: '-0.1725',
        acceptance: '0.8157' },
      { name: 'downsize',
        rounds: '1.9806',
        mean: '6.5738',
        meanAccepted: '7.8493',
        meanDelta: '0.9493',
        acceptance: '0.8375' } ]

### 1190

    [ { name: 'neural',
        rounds: '1.8657',
        mean: '6.1502',
        meanAccepted: '6.6869',
        meanDelta: '-0.9367',
        acceptance: '0.9197' },
      { name: 'half-or-all',
        rounds: '1.5748',
        mean: '6.1805',
        meanAccepted: '7.3512',
        meanDelta: '-0.1115',
        acceptance: '0.8407' },
      { name: 'downsize',
        rounds: '1.9409',
        mean: '6.7845',
        meanAccepted: '7.8615',
        meanDelta: '1.1069',
        acceptance: '0.8630' } ]

### 1450

    [ { name: 'neural',
        rounds: '2.4630',
        mean: '6.0340',
        meanAccepted: '7.1769',
        meanDelta: '-0.2629',
        acceptance: '0.8407' },
      { name: 'half-or-all',
        rounds: '1.9053',
        mean: '5.7858',
        meanAccepted: '7.3540',
        meanDelta: '-0.3397',
        acceptance: '0.7867' },
      { name: 'downsize',
        rounds: '2.2043',
        mean: '6.3978',
        meanAccepted: '7.7221',
        meanDelta: '0.5893',
        acceptance: '0.8285' } ]

Real:

    Position 5/44, entry { hash: '64a2ad86bbf57eb1ac941d9e659784c2',
      date: '2018-07-04',
      mean: 6.635683202785031,
      meanAccepted: 7.217341915940931,
      acceptance: 0.91940818102698,
      sessions: 5745 }

### 1620

    [ { name: 'neural',
        rounds: '2.0488',
        mean: '6.1880',
        meanAccepted: '7.1849',
        meanDelta: '-0.2853',
        acceptance: '0.8612' },
      { name: 'half-or-all',
        rounds: '1.6375',
        mean: '5.9790',
        meanAccepted: '7.2981',
        meanDelta: '-0.3933',
        acceptance: '0.8193' },
      { name: 'downsize',
        rounds: '2.0510',
        mean: '6.4683',
        meanAccepted: '7.7557',
        meanDelta: '0.6811',
        acceptance: '0.8340' } ]

Real:

    Position 1/45, entry { hash: '516140a83ce9bfb61928f8cc963e9163',
      date: '2018-07-04',
      mean: 6.879165638114046,
      meanAccepted: 7.596429058198174,
      acceptance: 0.9055788694149592,
      sessions: 8102 }

### 1760

    [ { name: 'neural',
        rounds: '2.4188',
        mean: '5.9620',
        meanAccepted: '7.3650',
        meanDelta: '-0.0219',
        acceptance: '0.8095' },
      { name: 'half-or-all',
        rounds: '1.8312',
        mean: '5.5462',
        meanAccepted: '7.2714',
        meanDelta: '-0.5552',
        acceptance: '0.7628' },
      { name: 'downsize',
        rounds: '2.2066',
        mean: '6.2955',
        meanAccepted: '7.7080',
        meanDelta: '0.5403',
        acceptance: '0.8167' } ]

### 1820

    [ { name: 'neural',
        rounds: '2.0048',
        mean: '6.2195',
        meanAccepted: '6.9686',
        meanDelta: '-0.5950',
        acceptance: '0.8925' },
      { name: 'half-or-all',
        rounds: '1.6188',
        mean: '5.9995',
        meanAccepted: '7.3299',
        meanDelta: '-0.2532',
        acceptance: '0.8185' },
      { name: 'downsize',
        rounds: '2.0269',
        mean: '6.6312',
        meanAccepted: '7.8384',
        meanDelta: '0.8726',
        acceptance: '0.8460' } ]

### 1870

    [ { name: 'neural',
        rounds: '2.5241',
        mean: '6.1692',
        meanAccepted: '6.7850',
        meanDelta: '-0.8375',
        acceptance: '0.9093' },
      { name: 'half-or-all',
        rounds: '1.9898',
        mean: '6.2720',
        meanAccepted: '7.4979',
        meanDelta: '0.0941',
        acceptance: '0.8365' },
      { name: 'downsize',
        rounds: '2.2103',
        mean: '6.6268',
        meanAccepted: '7.7438',
        meanDelta: '0.7978',
        acceptance: '0.8558' } ]

### 1980

    [ { name: 'neural',
        rounds: '2.3379',
        mean: '6.3872',
        meanAccepted: '6.9844',
        meanDelta: '-0.5068',
        acceptance: '0.9145' },
      { name: 'half-or-all',
        rounds: '1.8556',
        mean: '6.1283',
        meanAccepted: '7.3723',
        meanDelta: '-0.1774',
        acceptance: '0.8313' },
      { name: 'downsize',
        rounds: '2.2205',
        mean: '6.6265',
        meanAccepted: '7.6896',
        meanDelta: '0.7090',
        acceptance: '0.8618' } ]

Real:

    Position 0/6, entry { hash: '22f57b8987168a5ff10c9b042a6b2bcf',
      date: '2018-07-05',
      mean: 7.1786925196016105,
      meanAccepted: 7.499723267655524,
      acceptance: 0.9571943208306845,
      sessions: 18876 }

### 2070

    [ { name: 'neural',
        rounds: '2.4329',
        mean: '6.2335',
        meanAccepted: '7.1159',
        meanDelta: '-0.4204',
        acceptance: '0.8760' },
      { name: 'half-or-all',
        rounds: '1.9109',
        mean: '6.0418',
        meanAccepted: '7.3747',
        meanDelta: '-0.2087',
        acceptance: '0.8193' },
      { name: 'downsize',
        rounds: '2.1946',
        mean: '6.5325',
        meanAccepted: '7.7148',
        meanDelta: '0.6368',
        acceptance: '0.8468' } ]

### 2490

    [ { name: 'neural',
        rounds: '2.0416',
        mean: '6.1227',
        meanAccepted: '7.3304',
        meanDelta: '-0.1467',
        acceptance: '0.8353' },
      { name: 'half-or-all',
        rounds: '1.6388',
        mean: '5.7207',
        meanAccepted: '7.3272',
        meanDelta: '-0.4188',
        acceptance: '0.7808' },
      { name: 'downsize',
        rounds: '2.0772',
        mean: '6.3475',
        meanAccepted: '7.7503',
        meanDelta: '0.5488',
        acceptance: '0.8190' } ]

Real:

    Position 6/18, entry { hash: '91184c4cd5ffa90966f1c403926ebdfd',
      date: '2018-07-05',
      mean: 6.625418906101802,
      meanAccepted: 7.579781173704675,
      acceptance: 0.8740910527979766,
      sessions: 63260 }

## pnone-lstm64

### 1800

    Position 2/27, entry { hash: '4ba318c831604ad6e3c22321b43d4a19',
      date: '2018-07-05',
      mean: 6.899339603762257,
      meanAccepted: 7.5284971830370795,
      acceptance: 0.9164298579147488,
      sessions: 24985 }

### 3090

    Position 12/42, entry { hash: '4d9f77efc06b3abed6f48f790bc0ab80',
      date: '2018-07-05',
      mean: 6.443995853565388,
      meanAccepted: 7.494416243654823,
      acceptance: 0.8598395984505428,
      sessions: 18329 }

### 3600

    Position 4/10, entry { hash: 'faff41e67c4cbf2695d54680a3307fe4',
      date: '2018-07-06',
      mean: 6.558732171156894,
      meanAccepted: 7.3430801987224985,
      acceptance: 0.8931854199683043,
      sessions: 15775 }

### 4020

    Position 4/11, entry { hash: '7a654ec5805ee5a2a676a9157c13e0b8',
      date: '2018-07-06',
      mean: 6.4533255542590435,
      meanAccepted: 7.6144910076585495,
      acceptance: 0.8475058343057176,
      sessions: 13712 }

### 4350

...

## pe1

### 4160

    Position 35/61, entry { hash: '8125e780982a024543380768aa424d1e',
      date: '2018-07-09',
      mean: 5.282547303021746,
      meanAccepted: 7.311119796755912,
      acceptance: 0.7225360067777464,
      sessions: 7082 }

### 4800

    Position 4/12, entry { hash: '80d5931a9c705d04ca8ad4d33ac642e2',
      date: '2018-07-10',
      mean: 5.307900432900433,
      meanAccepted: 7.158112381415714,
      acceptance: 0.7415223665223665,
      sessions: 5544 }

### 5530

    Position 7/15, entry { hash: '8f61ce3cf5e654dae71d750302a238ca',
      date: '2018-07-10',
      mean: 5.332732544471436,
      meanAccepted: 7.217202248382649,
      acceptance: 0.7388919363686232,
      sessions: 12761 }

### 6610

    Position 4/20, entry { hash: '525015ad885b4f8dafb7f5d4aa615985',
      date: '2018-07-10',
      mean: 5.438418921798423,
      meanAccepted: 7.346718480138169,
      acceptance: 0.7402514383123802,
      sessions: 9386 }

### 7560

    Position 14/51, entry { hash: '9966257728b38aa9669ce8a2de5d6a73',
      date: '2018-07-10',
      mean: 5.914123924319664,
      meanAccepted: 7.300480681025942,
      acceptance: 0.8101006197702243,
      sessions: 67283 }

### 12530

    Position 14/64, entry { hash: '1b42e1a8b6d7264f453b2763d40c2d29',
      date: '2018-07-10',
      mean: 6.075207970593925,
      meanAccepted: 7.443614814814815,
      acceptance: 0.8161636680208938,
      sessions: 20676 }

### 14290

    Position 35/84, entry { hash: '72405c868be67b60a26c173417ac4343',
      date: '2018-07-10',
      mean: 5.783291808613414,
      meanAccepted: 7.495469372961217,
      acceptance: 0.7715716682768089,
      sessions: 39334 }

### 21310

    Position 20/57, entry { hash: 'bdce7de2f28a6e3895be89ca1b24da67',
      date: '2018-07-11',
      mean: 5.95437597017075,
      meanAccepted: 7.499405421747455,
      acceptance: 0.7939797404343164,
      sessions: 62489 }

### 26640

    Position 13/73, entry { hash: '71ea340faa42dd67935f6c42f0ab89bf',
      date: '2018-07-11',
      mean: 6.414699162223915,
      meanAccepted: 7.532699832308552,
      acceptance: 0.8515803503427266,
      sessions: 42016 }

### 30080

    Position 9/31, entry { hash: 'f498c4fb5d1bb45676f5f1cef4ca0917',
      date: '2018-07-12',
      mean: 5.763783783783784,
      meanAccepted: 7.390490712503466,
      acceptance: 0.7798918918918919,
      sessions: 9250 }

### 35040

    Position 26/79, entry { hash: '5fc4bee2bc98b0f23096736f9e142719',
      date: '2018-07-12',
      mean: 6.028472465935273,
      meanAccepted: 7.401978417266187,
      acceptance: 0.8144406976211911,
      sessions: 65537 }
