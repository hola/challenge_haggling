# Agent v 1.5.0

The project is written for
- fun.
- to  paticipiate in the JS competition as stated here{https://habr.com/company/hola/blog/414723/}.
- i'm not a good JS programmer... so that in order to do my kata.

## Solution is 

Original intent was to add a number of different `Advisers` with a different weights and `Stars` prediction to randomize it a bit...
Not enough time and my laziness did all to make it not to happen. 

Solution establish `State` and `OfferStorage` so that during the session there was a way to get enough information and statistic about current state and history. It allows to do more complex analisis than implemented, but who cares...

There is an `Adviser` that should do the best advice using its algorithm choosing the best strategy according the current state of session.
(`Advice` is an incomming offer acceptance rate [0, 1], and counter offer. The solution uses this `Advice` to make the final decision).

I used to say that the `Adviser` exact implementations are the most interesting in the solution but at the last day i just finished the code to work somehow, so the most interesting is possibly only this description.

Thanks for reading! :)

## License is

Copyright 2018 Alexander Volkov<alx.volkov@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.