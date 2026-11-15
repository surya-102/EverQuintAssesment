
#include<bits/stdc++.h>
using namespace std;

struct Result{
    int profit,t,p,c;
};

map<pair<int,int>,Result> m;
int n;

Result build(int used ,int value){
    pair<int,int> key = {used,value};
    if(m.find(key)!=m.end()){
        return m[key];
    }
    int balance=n-used;
    Result ans={value*balance,0,0,0};
    if(used+5<=n){
        Result solve=build(used+5,value+1500);
        int profit=value*5+solve.profit;
        if(profit>ans.profit){
            ans={profit,solve.t+1,solve.p,solve.c};
        }
    }
    if(used+4<=n){
        Result solve=build(used+4,value+1000);
        int profit=value*4+solve.profit;
        if(profit>ans.profit){
            ans={profit,solve.t,solve.p+1,solve.c};
        }
    }
    if(used+10<=n){
        Result solve=build(used+10,value+2000);
        int profit=value*10+solve.profit;
        if(profit>ans.profit){
            ans={profit,solve.t,solve.p,solve.c+1};
        }
    }
    return m[key]=ans;
}
int main(){
    cin>>n;
    m.clear();
    Result ans=build(0,0);
    cout<<"Earnings: $"<<ans.profit<<endl;
    cout<<"T: "<<ans.t<<" P: "<<ans.p<<" C: "<<ans.c<<endl;
    return 0;
}
