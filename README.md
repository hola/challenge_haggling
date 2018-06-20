# <img src=https://hola.org/img/logo.png alt="Hola!"> JS Challenge Summer 2018: Haggling

Welcome to Hola programming challenge!

1. First prize: 3000 USD.
2. Second prize: 2000 USD.
3. Third prize: 1000 USD.
4. We might award one special prize of 400 USD at our discretion.
5. If you email the link to this page to someone, with challengejs@hola.org in CC, and they enter the competition and win a prize, you will receive half the amount they get (only the first referrer per participant).

See also the [Russian version](https://habr.com/company/hola/blog/414723/) of this page.

z## Rules

* Submit your solution to our [form](https://hola.org/challenges/haggling). Do not send solutions by e-mail!
* Submission deadline: **July 20, 2018**, 23:59:59 UTC.
* Preliminary results will be published on **July 27, 2018**, and final results on **August 3, 2018**.
* You may submit more than once. Only your latest submission, as long as it's still before the deadline, will be evaluated.
* We will use **Node.js v10.4.1** (current at the time of this publication) for testing. You can use any language features supported by the interpreter in its default configuration.
* Your code must all be in a **single JS file**.
* Your submission must be in JS. If you prefer CoffeeScript or similar, translate to JS before submitting.
* If your JS file is generated, minified and/or compiled from a different language like CoffeeScript, please submit an archive with the complete sources, and possibly a description of your approach. We will publish it, but won't test it.
* It is **not allowed to require any JS modules**, not even the standard ones built into Node.js.
* We need to know your full name, but we can publish your solution under a pseudonym instead, if you prefer. We will not publish your email address.
* Current or former Hola employees and memers of their immediate families can only participate off-contest, without winning prizes.
* Questions about the problem statement? Send them to challengejs@hola.org.

## Haggling

Let's say there are a book, two hats and three balls. You and a partner have to decide how to split these objects between the two of you. To you, the book is worth $4, a ball $2, and the hats are worthless. The partner might value the same objects differently; you don't know their valuation, but you know that the total worth of all objects is the same as for you, in this case, $10.

You and the partner take turns making offers to each other about how to split the goods. On each turn, one can either accept the partner's offer (except on the very first turn), or make a counter-offer. The negotiations are limited to 5 rounds (that is, there can be up to 10 offers in total). If an agreement is reached, each of you receives the amount that their part of the goods is worth to them. If there is still no agreement after the last turn (that is, the last word is a counter-offer rather than acceptance), neither partner receives anything at all. The same happens if one of the partners walks away from the negotiations.

Here is how the negotiations might go:

1. **You:** I want the book and two balls; you get a ball and both hats.
2. **Other:** I don't accept. I want all the balls and a hat; you get the book and a hat.
3. **You:** I don't accept. I want the book and a ball; you get two balls and both hats.
4. **Other:** I accept.

Unknown to you, the partners valuation was: $2 for a ball, $2 for a hat, nothing for a book. Your agreement brought $6 to you and $8 to your partner.

In general, there are two or more types of objects, and a positive number of objects of each type. Each type of object is worth some nonnegative integer to each partner. The total value of all objects for each of the partners is the same, although the particular valuations are, in general, different between the partners. A proposed split must distribute all objects between partners; individual objects cannot be partitioned.

Your goal is to write a script that tries to maximize the value of its deal.

### Solutions

A solution is a Node.js module with no dependencies. Its export must be a class with a constructor and a single method:

```javascript
module.exports = class {
    constructor(me, counts, values, max_rounds, log){
        ..
    }
    offer(o){
        ...
    }
}
```

An instance of this class is created once for a negotiation session. The constructor receives the following arguments:

* `me` is 0 if your turn is first, and 1 if your turn is second.
* `counts` is an array of integers, describing how many of each type of object there is. This array is between 2 and 10 elements long.
* `values` is an array of integers the same length as `counts`, describing how much every object is worth to you.
* `max_rounds` is the limit on the number of rounds in the negotiations; a round is two turns, one by each partner.
* `log` is a function which your code can call to output a message for debugging (`console.log` won't work).

The `offer` method is called each time when it's your turn. Its argument `o` is an array of integers the same size as `counts`, which describes how many of each type of object the partner offers to you. If your turn is first, and this is the first round, `o` is `undefined`.

The `offer` method should return `undefined` if you accept the offer (except when `o` is `undefined`). Otherwise, it should be an array of integers the same size as `counts`, describing how many of each type of object you want for yourself. Note that both the argument and the return value of `offer` describe the partition from *your* perspective, that is, what you get.

There is a timeout of 1 second per turn. If the code times out, throws an exception or returns an invalid value, it is regarded as walking away from the negotiations, and neither partner receives anything.

The module won't be allowed to learn, i.e. to keep any data persistent between sessions.

See [example.js](src/example.js) for a very simple example of a negotiation script. It will accept any offer that allows it to receive at least half of the total value; otherwise it simply demands all items with nonzero value. It also demonstrates the use of the `log` function.

### Testing

The [haggle.js](src/haggle.js) script allows you to stage negotiations between two human agents, between a human and a script, and between two scripts. Run it with `--help` to see what it can do.

We are going to judge the contest by running negotiations pariwise between the submitted solutions. We hope to run at least two sessions for each possible pair, but if we receive a lot of solutions, we might have to resort to a different tournament system to make testing feasible. The exact details of the tournament system will be announced later. In any case, what matters is the total value that the solution receives from all the deals it makes, not “wins” or “losses”. The winning script is the one that manages to accumulate the most value from all the deals it strikes.

For the final testing, we will use the default parameters of the testing script, that is, 3 object types, between 1 and 5 objects of each type, the total value for each partner $10, and a limit of 5 rounds. We recommend that solutions support all combinations of parameters that are allowed by the test script.

The testing will happen on Ubuntu 14.04 (amd64) on a [c3.large](https://aws.amazon.com/ru/ec2/instance-types/#c3) Amazon AWS instance, one pair another, with no other load on the machine.

Bugs reported by participants get fixed, watch the [changelog](src/CHANGELOG.md) for updates. Please include the log of the problematic session (use `--log` to obtain) when reporting a bug.

### Online negotiations

We are providing a server that lets your script negotiate with scripts of other participants. It works like a typical online game server: you connect to an “arena”, and the server pairs you with another participant who wants to play.

Currently, we are providing one arena with the default settings (3 object types, between 1 and 5 objects of each type, the total value for each partner $10, and a limit of 5 rounds). This arena does not enforce the 1-second timeout, so as to allow humans to participate. The URL to this arena is:

```
wss://hola.org/challenges/haggling/arena/standard
```

Use `haggle.js` to connect to it either as a human agent, or with your script. In this mode, the `--id` command-line option is required: it is a unique ID that will be used to track your scores. We recommend using your email address with a random string appended to it as the ID. **We won't publish this ID.** Later on, we'll launch a leaderboard where the top average scores (that is, the average score per deal) will be pubished along with the *hash* of the ID.

The server and the leaderboard are purely for your information and entertainment. The leaderboard scores will have no effect on the final standings, and you are not required to use the server at all. However, it can be a useful way to see where you stand, and to accumulate learning data to improve your script.

If you have a working script, we recommend running it repeatedly whenever your computer is powered on, such as with the following UNIX shell one-liner:

```
while true; do node haggle.js --id me@example.com:1234abcd myscript.js wss://hola.org/challenges/haggling/arena/standard; done
```

### Submitting your solution

Please submit your solutions using [this form](https://hola.org/challenges/haggling). We don't accept submissions by email.

Some solutions might contain code or data that is generated, minified or translated from another language; therefore we require that the source code be submitted as well. If the code or data is generated, please include the generator; if it's minified, include the original version; if it's compiled from a different language such as CoffeeScript, include the original code. We also appreciate if you include a brief README file with some explanation of your approach (in English). Please submit the above as a tar.gz, tar.bz2, or zip archive. The contents of this archive will be published, but won't be tested.

We have set the maximum size of the submitted script (not including the source archive) to 64 MiB. This is an arbitrary number chosen simply to prevent someone from filling our disks with a single submission. If your solution is legitimately bigger than 64 MiB, please take contact, and we'll make a reasonable increase.

If you have questions about this problem statement, or trouble submitting your solution, please contact challengejs@hola.org.

**Good luck to all the participants!**
