/***************************************
	Author: Ahsan Zaman
	Time to make: April 30 10:50PM - May 1 01:10AM (2hrs 20mins)
	To run: g++ --std=c++11 minesweeper.cpp -o ms && ./ms
****************************************/

#include <iostream>
#include <vector>
#include <set>
#include <stdlib.h>
using namespace std; 
#define MINE_VAL 5
struct loc{
	int x, y;
	loc(int x_, int y_): x(x_), y(y_){ }
	bool operator==(const loc& other){
		return other.x==this->x && other.y==this->y;
	}
	bool operator<(const loc& rhs) const{
		return rhs.x<this->x;
	}
};
class sq{
private:
	int v;
	bool shown = false;
	char make_char[10] = {'0', '1', '2', '3', '4', '$' };
public:
	sq(int x_):v(x_){ }
	bool isMine(){ return v==MINE_VAL; }
	void show(){ shown = true; }
	char getVal(){ return shown?make_char[v]:'*'; }
	void make_mine(){ v=MINE_VAL; }
	sq operator++(int i){
		if(this->isMine()) return *this;
		this->v++;
		return *this;
	}
	bool isShown(){ return shown; }
	bool isEmpty(){ return v==0; }
};
class Board{
private:
	vector<vector<sq>> b;
	int cols, rows;
	bool game_over = false;
public:
	Board(int r, int c):rows(r),cols(c){
		b = vector<vector<sq>>(rows,vector<sq>());
		for(int i=0; i<rows; i++)
			b[i] = vector<sq>(cols,sq(0));
	}
	void setMine(int i, int j){
		b[i][j].make_mine();
		if(i>0 		) b[i-1][j]++;
		if(i<rows-1 ) b[i+1][j]++;
		if(j>0 		) b[i][j-1]++;
		if(j<cols-1 ) b[i][j+1]++;
	}
	void printStars(){
		for(int i=0; i<rows; i++){
			for(int j=0; j<cols; j++)
				cout << b[i][j].getVal() << " ";
			cout << endl;
		}
	}
	void revealSoln(){
		game_over = true;
		for(int i=0; i<rows; i++)
			for(int j=0; j<cols; j++)
				if(b[i][j].isMine()) b[i][j].show();
		printStars();
	}
	bool gameOver(){
		return game_over;
	}
	int uncoverSquare(int i, int j){
		if(b[i][j].isShown()) return 0;
		int uncovered = 1;
		b[i][j].show();
		if(b[i][j].isEmpty()){
			if(i > 0 		&& !b[i-1][j].isMine()) uncovered+=uncoverSquare(i-1, j);
			if(i < rows-1 	&& !b[i+1][j].isMine()) uncovered+=uncoverSquare(i+1, j);
			if(j > 0 		&& !b[i][j-1].isMine()) uncovered+=uncoverSquare(i,j-1);
			if(j < cols-1 	&& !b[i][j+1].isMine()) uncovered+=uncoverSquare(i,j+1);
		}
		return uncovered;
	}
	bool isMine(int i, int j){
		return b[i][j].isMine();
	}
	bool isUncovered(int i, int j){
		return b[i][j].isShown();
	}
};

class MineSweeper{
private:
	int r=4, c=5, uncovered=0, num_mines;
	vector<loc> mine_locations;
	string too_high_msg = "Error in input or chosen square does not exist.";
	string game_over_msg = "Game over. You failed.";
	string gave_up_msg = "You gave up.";
	string win_msg = "You won! Good job!";
	string instructions_msg;
	int totalSquares;
	bool isNum(char c){ return c>='0' && c<='9'; }
	int parseNum1(string s){
		string numStr = "";
		int i=0;
		while(i<s.length() && isNum(s[i])){
			numStr += s[i];
			i++;
		}
		if(i >= s.length() || numStr=="" || s[i] != ' ') return r+1; //error
		return stoi(numStr);
	}
	int parseNum2(string s){
		string numStr = "";
		int i=0;
		while(i<s.length() && s[i] != ' ') i++;
		if(i>=s.length() || s[i] != ' ') return c+1; //error
		i++;
		while(i < s.length() && isNum(s[i])){
			numStr += s[i];
			i++;
		}
		if(i < s.length() || numStr=="") return c+1; //error
		return stoi(numStr);
	}
	int getRandomInt(int a, int b){
		return rand() % b + max((a-1),0);
	}
	void make_mines(){
		set<loc> s;
		srand (time(NULL));
		for(int i=0; i<num_mines; i++){
			loc l(getRandomInt(0,r), getRandomInt(0,c));
			while(!s.insert(l).second)
				l = loc(getRandomInt(0,r), getRandomInt(0,c));
		}
		mine_locations = vector<loc>(s.begin(), s.end());
	}
public:
	MineSweeper(int r_, int c_, int m_) : r(r_),c(c_),num_mines(m_){
		if((r+1)*(c+1) < num_mines){
			cout << "Too many mines." << endl;
			return;
		}
		Board b(r,c); //why can't I store this as a class variable? 
		make_mines();
		for(loc l : mine_locations) b.setMine(l.x, l.y);
		totalSquares = r*c;
		instructions_msg = "Please choose a square. Ranges: row: 1-"+to_string(r)+" col: 1-"+to_string(c)+". Enter 'end' to give up. Example: '1 2'";
		while(!b.gameOver()){
			cout << instructions_msg << endl;
			string input;
			getline(cin, input);
			if(input == "end"){ 
				cout << gave_up_msg << endl;
				b.revealSoln();
			}
			else if(input == " "){
				b.printStars();
			}
			else{
				int rIn = parseNum1(input)-1;
				int cIn = parseNum2(input)-1;
				if(rIn >= r || cIn >= c || rIn < 0 || cIn < 0){
					cout << too_high_msg << endl;
					b.printStars();
				}
				else if(b.isMine(rIn,cIn)){
					cout << game_over_msg << endl;
					b.revealSoln();
				}
				else{
					if(b.isUncovered(rIn, cIn)) cout << "Already chosen." << endl;
					else{
						uncovered+= b.uncoverSquare(rIn, cIn);
						if(uncovered == (totalSquares-num_mines)){
							cout << win_msg << endl;
							b.revealSoln();
							break;
						}
					}
					b.printStars();
				}
			}
		}
	}

};

int main(){
	MineSweeper(4,5,3);
}