#include<bits/stdc++.h>
using namespace std;

struct Building {
    char name;
    int time;
    int rate;
};


const Building B[3]={ {'T',5,1500},{'P',4,1000},{'C',10,2000}};

struct State{
    int profit=0;
    set<array<int,3>> sols;
};

int main(){
    int n;
    cout<<"Enter time units : ";
    cin>>n;

    vector<State> dp(n+1);
    dp[0].sols.insert({0,0,0});
    for(int t=1;t<=n;++t){
        dp[t].profit=0;
        dp[t].sols.insert({0,0,0});
        for(int i=0;i<3;++i){
            int d=B[i].time;
            if(t<=d) continue;
            int rem=t-d;
            int ans=rem*B[i].rate+dp[rem].profit;
            if(ans>dp[t].profit){
                dp[t].profit=ans;
                dp[t].sols.clear();
            }

            if(ans==dp[t].profit){
                 for(array<int,3> c:dp[rem].sols){
                    c[i]++;
                    dp[t].sols.insert(c);
                 }
            }

        }
    }

    cout<<"Earnings:$ "<<dp[n].profit<<"\n";
    cout<<"Solutions\n";
    for( auto &c :dp[n].sols){
        cout<<"T: "<<c[0]<<" P: "<<c[1]<<" C: "<<c[2]<<"\n";
    }
    return 0;
}