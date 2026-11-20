#include<bits/stdc++.h>
using namespace std;

struct Building {
    char name;
    long long time;
    long long rate;
};


const Building B[3]={ {'T',5,1500},{'P',4,1000},{'C',10,2000}};

struct State{
    long long profit=0;
    set<array<long long,3>> sols;
};

int main(){
    long long n;
    cout<<"Enter time units : ";
    cin>>n;
    if(n<0){
        cout<<"Invalid input: time units cannot be negative.\n";
        return 1;
    }
    vector<State> dp(n+1);
    dp[0].sols.insert({0,0,0});
    for(long long t=1;t<=n;++t){
        dp[t].profit=0;
        dp[t].sols.insert({0,0,0});
        for(int i=0;i<3;++i){
            long long d=B[i].time;
            if(t<=d) continue;
            long long rem=t-d;
            long long ans=rem*B[i].rate+dp[rem].profit;
            if(ans>dp[t].profit){
                dp[t].profit=ans;
                dp[t].sols.clear();
            }

            if(ans==dp[t].profit){
                 for(array<long long,3> c:dp[rem].sols){
                    c[i]++;
                    dp[t].sols.insert(c);
                 }
            }

        }
    }

    cout<<"Earnings: $"<<dp[n].profit<<"\n";
    cout<<"Solutions\n";
    for( auto &c :dp[n].sols){
         if (c[0]==0 && c[1]==0 && c[2]==0) continue;
        cout<<"T: "<<c[0]<<" P: "<<c[1]<<" C: "<<c[2]<<"\n";
    }
    return 0;
}