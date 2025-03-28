import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Array "mo:base/Array";
import Order "mo:base/Order";

actor {

type UserRank= {
  principal_id : Principal;
  score : Nat;
  rank : Nat;
};

// variable 
  private stable var users : [(Principal, Nat)] = [];
  private stable var scoreboard : [(Principal, Nat)] = [];

// Mapping 
private var usersMap = HashMap.HashMap<Principal, Nat>(
    0,
    Principal.equal,
    Principal.hash,
  );
  private var scoreboardMap = HashMap.HashMap<Principal, Nat>(
    0,
    Principal.equal,
    Principal.hash,
  );

  private func loadState() {
    usersMap := HashMap.fromIter<Principal, Nat>(
      users.vals(),
      users.size(),
      Principal.equal,
      Principal.hash,
    );
    scoreboardMap := HashMap.fromIter<Principal, Nat>(
      scoreboard.vals(),
      scoreboard.size(),
      Principal.equal,
      Principal.hash,
    );
  };

  system func preupgrade() {
    users := Iter.toArray(usersMap.entries());
    scoreboard := Iter.toArray(scoreboardMap.entries());
  };

  system func postupgrade() {
    loadState();
  };

  var secretNumber : Nat = 0;
  var attempts : Nat = 0;
  let maxAttempts : Nat = 100;
  var seed : Nat = 1;

  // Scoreboard untuk menyimpan pemain dan jumlah percobaan mereka
  

  public func initGame() : async () {
    // Sederhana pembangkit angka pseudo-random
    seed := (seed * 1103515245 + 12345) % 2147483648;
    secretNumber := (seed % 100) + 1; // Angka antara 1-100
    attempts := 0;
  };

  public shared (msg) func checkGuess(userGuess : Nat) : async Text {
    if (attempts >= maxAttempts) {
      return "Game Over";
    };

    attempts += 1;
    
    if (userGuess == secretNumber) {
      // Menyimpan skor hanya jika pemain menebak dengan benar
      usersMap.put(msg.caller, userGuess);
      scoreboardMap.put(msg.caller, attempts);

      return "Correct Broh!";
    } else if (userGuess < secretNumber) {
      return "TooLow";
    } else {
      return "TooHigh";
    }
  };

  private func sortScoreboard() : [(Principal, Nat)] {
    let board = Iter.toArray(scoreboardMap.entries());  // Ambil data langsung dari HashMap
    Array.sort(board, func(a : (Principal, Nat), b : (Principal, Nat)) : Order.Order {
      Nat.compare(a.1, b.1)  // Urutkan berdasarkan skor (jumlah attempts)
    })
};

  public query func getTopScores(n : Nat) : async [(Principal, Nat)] {
    let sortedBoard = sortScoreboard();
    return Array.take(sortedBoard, Nat.min(n, sortedBoard.size()));
};

  public shared(msg) func getUserRank() : async ?UserRank {
    let sortedBoard = sortScoreboard();
    let userPrincipal = msg.caller;
    switch (scoreboardMap.get(userPrincipal)) {
      case (?scoreboard) { 
        
    // Cari index pengguna di papan skor yang sudah diurutkan
    var rank : Nat = 0;
    for (i in Iter.range(0, sortedBoard.size() - 1)) {
      if (sortedBoard[i].0 == userPrincipal) {
        rank := i;
      }
    };

let res : UserRank = {
principal_id = userPrincipal;
score = 0;
rank = rank;
        };

    return ?res;
       };
      case (null) { 
        return null;
       };
    };
  };

}
