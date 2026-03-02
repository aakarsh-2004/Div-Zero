#include <bits/stdc++.h>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    int n;
    cin >> n;
    vector<int> a(n);
    for(auto& x: a) cin >> x;

    cout << *max_element(a.begin(), a.end()) << endl;
    
    return 0;
}