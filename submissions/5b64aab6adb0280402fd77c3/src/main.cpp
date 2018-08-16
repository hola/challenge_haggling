#include <iostream>
#include <vector>
#include <iomanip>
#include <algorithm>

using namespace std;

struct three {
  three(): a(0), b(0), c(0) {}
  int tc() const {
    return a + b + c;
  }

  int tv(const three& tv) const {
    return a * tv.a + b * tv.b + c * tv.c;
  }
  int a, b, c;

};

ostream& operator << (ostream& str, const three& t) {
  str << t.a << ", " << t.b << ", " << t.c;
  return str;
}

three operator - (const three& x, const three& y) {
  three result;
  result.a = x.a - y.a;
  result.b = x.b - y.b;
  result.c = x.c - y.c;
  return result;
}

struct earn {
  earn(const int& i_me, const int& i_en, const three& i_rest): me(i_me), en(i_en), rest(i_rest) {}
  earn(): me(0), rest() {}
  int me;
  int en;
  three rest;
};

bool operator < (const earn& a, const earn& b) {
  if (a.me != b.me) {
    return a.me < b.me;
  }
  return a.en < b.en;
}

int main() {
  int my_cost[3];
  int total_count[3];
  int enemy_cost[3];

  three count, me, enemy, subc;

  vector<three> possible_counts;

  vector<three> possible_values;

  int ways = 0;
  cout << "[" << endl;
  int w = 0;
  for (int tc = 1; tc <= 6; ++tc) {
    for (count.a = 0; count.a <= tc; ++count.a) {
      for (count.b = 0; count.b <= tc; ++count.b) {
        for (count.c = 0; count.c <= tc; ++count.c) {
          if (count.tc() == tc) {
            possible_counts.push_back(count);
            bool first = true;
            possible_values.clear();
            for (me.a = 0; me.a <= 10; ++me.a) {
              for (me.b = 0; me.b <= 10; ++me.b) {
                for (me.c = 0; me.c <= 10; ++me.c) {
                  if (me.tv(count) == 10) {
                    possible_values.push_back(me);
                  }
                }
              }
            }
/*            cout << "[";

            for (int i = 0; i < possible_values.size(); ++i) {
              cout << "[" << possible_values[i] << "]";
              if (i < possible_values.size() - 1) {
                cout << ", ";
                if (i % 10 == 9) {
                  cout << endl;
                }
              }
            }

            cout << "], " << endl;
            cout << "====================================" << endl;*/
            cout << "[";
            for (int i = 0; i < possible_values.size(); ++i) {
              cout << "[";
              w = 0;
              for (int j = 0; j < possible_values.size(); ++j) {
                three m_me = possible_values[i];
                three m_en = possible_values[j];
                int mx = -1;
                vector<earn> mx_earns;
                for (subc.a = 0; subc.a <= count.a; ++subc.a) {
                  for (subc.b = 0; subc.b <= count.b; ++subc.b) {
                    for (subc.c = 0; subc.c <= count.c; ++subc.c) {
                      three rest = count - subc;
                      int me_v, en_v;
                      me_v = m_me.tv(subc);
                      en_v = m_en.tv(rest);
                      if (me_v >= en_v) {
                        mx_earns.push_back(earn(me_v, en_v, rest));
                      }
                    }
                  }
                }

                sort(mx_earns.begin(), mx_earns.end());

                cout << "[";
                int cnt = 6;
                for (int mxp = 0; (cnt > 0) && mxp < mx_earns.size(); ++mxp) {
                  --cnt;
                  ++w;
                  if (w % 25 == 0) {
                    cout << endl;
                  }
                  cout << "[" << mx_earns[mx_earns.size() - 1 - mxp].rest << "]";
                  if ((mxp < mx_earns.size() - 1) && (cnt > 0)) {
                    cout << ", ";
                  }
                }
                cout << "]";
                if (j < possible_values.size() - 1) {
                  cout << ", ";
                }
              }
              cout << "], " << endl;
            }
            cout << "], " << endl;
          }
        }
      }
    }
  }

  cout << "]" << endl;

/*  cout << possible_counts.size() << endl;
  cout << "[";
  for (int i = 0; i < possible_counts.size(); ++i) {
    cout << "[" << possible_counts[i] << "]";
    if (i != possible_counts.size() - 1) {
      cout << ", ";
    }
    if (i % 10 == 9) {
      cout << endl;
    } else {
      if (i != possible_counts.size() - 1) {
        cout << " ";
      }
    }
  }
  cout << "]" << endl;
//  cout << ways << endl;
*/
  return 0;
}