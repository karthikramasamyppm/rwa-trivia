import { GameOptions, GameStatus, PlayerMode, OpponentType } from './game-options';
import { Question } from './question';

export class PlayerQnA {
  playerId: string;
  questionId: string;
  playerAnswerId?: string;
  playerAnswerInSeconds?: number;
  answerCorrect?: boolean;
  isReported?: boolean;
}

export class Stat {
  score: number;
  round: number;
  avgAnsTime: number;
  constructor() {
    this.score = 0;
    this.round = 0;
    this.avgAnsTime = 0;
  }
}

export class Game {
  private _gameId?: string;
  private _gameOptions: GameOptions
  private _playerIds: string[];
  public gameOver: boolean;
  public playerQnAs: PlayerQnA[];
  public stats: { [key: string]: Stat };
  public nextTurnPlayerId: string;
  public winnerPlayerId: string;
  public GameStatus: string;
  public createdAt: number;
  public turnAt: number;

  constructor(gameOptions: GameOptions, player1UUId: string, gameId?: string, playerQnAs?: any, gameOver?: boolean,
    nextTurnPlayerId?: string, player2UUId?: string, winnerPlayerId?: string, gameStatus?: string, createdAt?: number, turnAt?: number) {
    //defaults
    this._gameOptions = gameOptions;
    this._playerIds = [player1UUId];
    if (player2UUId) {
      (this._playerIds.indexOf(player2UUId) === -1) ? this._playerIds.push(player2UUId) : '';
    }
    this.nextTurnPlayerId = nextTurnPlayerId ? nextTurnPlayerId : '';
    this.gameOver = (gameOver) ? true : false;
    this.playerQnAs = [];
    if (playerQnAs) {
      let key: string;
      for (key of Object.keys(playerQnAs)) {
        let qna = playerQnAs[key];
        this.playerQnAs.push({
          'playerId': qna.playerId,
          'questionId': qna.questionId,
          'playerAnswerId': qna.playerAnswerId,
          'playerAnswerInSeconds': qna.playerAnswerInSeconds,
          'answerCorrect': qna.answerCorrect,
          'isReported': (qna.isReported) ? true : false
        });
      }
    }
    if (gameId) {
      this._gameId = gameId;
    }

    if (winnerPlayerId) {
      this.winnerPlayerId = winnerPlayerId;
    }

    if (gameStatus) {
      this.GameStatus = gameStatus;
    }

    if (createdAt) {
      this.createdAt = createdAt;
    }

    if (turnAt) {
      this.turnAt = turnAt;
    }

    this.stats = {};
  }

  addPlayer(playerUUId: string) {
    (this._playerIds.indexOf(playerUUId) === -1) ? this._playerIds.push(playerUUId) : '';
  }

  setStat(gameStats: any) {

    if (gameStats) {
      for (const key of Object.keys(gameStats)) {
        const stat: Stat = gameStats[key];
        this.stats[key] = stat;
      }
    } else {
      this.generateDefaultStat();
    }

  }

  generateDefaultStat() {
    this.playerIds.map((playerId) => {
      const stat: Stat = new Stat()
      this.stats[playerId] = stat;
    });
  }

  get gameOptions(): GameOptions {
    return this._gameOptions;
  }
  get playerIds(): string[] {
    return this._playerIds;
  }
  get gameId(): string {
    return this._gameId;
  }

  addPlayerQnA(playerId: string, questionId: string): PlayerQnA {
    let playerQnA: PlayerQnA = {
      'playerId': playerId,
      'questionId': questionId
    }
    this.playerQnAs.push(playerQnA);
    return playerQnA;
  }

  calculateStat(playerId: string) {
    const stat: Stat = new Stat();
    stat.score = this.playerQnAs.filter((p) => p.answerCorrect && p.playerId === playerId).length;
    let round = 0;
    let totalQTime = 0;
    this.playerQnAs.map((playerQn) => {
      if (playerQn.playerId === playerId) {
        if (!playerQn.answerCorrect) {
          round++;
        }
        totalQTime = totalQTime + playerQn.playerAnswerInSeconds;
      }
    });
    stat.round = round;
    stat.avgAnsTime = Math.floor((totalQTime) / this.playerQnAs.filter((p) => p.playerId === playerId).length)
    this.stats[playerId] = stat;
  }

  decideWinner() {
    if (Number(this.gameOptions.playerMode) === PlayerMode.Opponent
      && Number(this.gameOptions.opponentType) === OpponentType.Random) {
      const playerId_0 = this.playerIds[0];
      const playerId_1 = this.playerIds[1];
      this.winnerPlayerId = (this.stats[playerId_0].score > this.stats[playerId_1].score) ? playerId_0 : playerId_1;
    } else {
      this.winnerPlayerId = this.playerIds[0];
    }
  }

  decideNextTurn(playerQnA: PlayerQnA, userId: string) {
    if (Number(this.gameOptions.playerMode) === PlayerMode.Opponent) {
      const otherPlayerUserId = this.playerIds.filter(playerId => playerId !== userId)[0];

      if (Number(this.gameOptions.opponentType) === OpponentType.Random) {
        if (this.GameStatus === GameStatus.STARTED && !playerQnA.answerCorrect) {
          this.nextTurnPlayerId = '';
          this.GameStatus = GameStatus.AVAILABLE_FOR_OPPONENT;
        } else if (this.GameStatus === GameStatus.RESTARTED && !playerQnA.answerCorrect) {
          this.nextTurnPlayerId = otherPlayerUserId;
          this.GameStatus = GameStatus.WAITING_FOR_RANDOM_PLAYER_INVITATION_ACCEPTANCE;
        } else if ((this.GameStatus === GameStatus.JOINED_GAME ||
          this.GameStatus === GameStatus.WAITING_FOR_RANDOM_PLAYER_INVITATION_ACCEPTANCE) && !playerQnA.answerCorrect) {
          this.nextTurnPlayerId = otherPlayerUserId;
          this.GameStatus = GameStatus.WAITING_FOR_NEXT_Q;
        } else if (!playerQnA.answerCorrect) {
          this.nextTurnPlayerId = otherPlayerUserId;
        } else {
          this.nextTurnPlayerId = userId;
        }
      } else if (Number(this.gameOptions.opponentType) === OpponentType.Friend) {
        if (this.GameStatus === GameStatus.STARTED && !playerQnA.answerCorrect) {
          this.nextTurnPlayerId = otherPlayerUserId;
          this.GameStatus = GameStatus.WAITING_FOR_FRIEND_INVITATION_ACCEPTANCE;
        } else if ((this.GameStatus === GameStatus.WAITING_FOR_FRIEND_INVITATION_ACCEPTANCE ||
          this.GameStatus === GameStatus.RESTARTED) && !playerQnA.answerCorrect) {
          this.nextTurnPlayerId = otherPlayerUserId;
          this.GameStatus = GameStatus.WAITING_FOR_NEXT_Q;
        } else if (!playerQnA.answerCorrect) {
          this.nextTurnPlayerId = otherPlayerUserId;
        } else {
          this.nextTurnPlayerId = userId;
        }
      }

    } else {
      this.nextTurnPlayerId = userId;
    }
  }


  updatePlayerQnA(playerId: string, questionId: string,
    playerAnswerId: string, playerAnswerInSeconds: number, answerCorrect: boolean): PlayerQnA {
    let playerQnA: PlayerQnA = this.playerQnAs.find(p => p.playerId === playerId && questionId === questionId);
    playerQnA.playerAnswerId = playerAnswerId;
    playerQnA.answerCorrect = answerCorrect;
    playerQnA.playerAnswerInSeconds = playerAnswerInSeconds;
    return playerQnA;
  }

  getDbModel(): any {
    let dbModel = {
      'gameOptions': { ...this._gameOptions },
      'playerIds': this.playerIds,
      'gameOver': (this.gameOver) ? this.gameOver : false,
      'playerQnAs': this.playerQnAs,
      'nextTurnPlayerId': (this.nextTurnPlayerId) ? this.nextTurnPlayerId : '',
      'GameStatus': (this.GameStatus) ? this.GameStatus : GameStatus.STARTED
    }
    if (this.winnerPlayerId) {
      dbModel['winnerPlayerId'] = this.winnerPlayerId;
    }
    for (let i = 0; i < this.playerIds.length; i++) {
      dbModel['playerId_' + i] = this.playerIds[i];
    }

    if (this.createdAt) {
      dbModel['createdAt'] = this.createdAt;
    }

    if (this.turnAt) {
      dbModel['turnAt'] = this.turnAt;
    }

    if (this.gameId) {
      dbModel['id'] = this.gameId;
    }

    for (const key of Object.keys(this.stats)) {
      this.stats[key] = { ...this.stats[key] };
    };

    dbModel['stats'] = this.stats;

    return dbModel;
  }

  static getViewModel(dbModel: any): Game {

    const game: Game = new Game(dbModel['gameOptions'], dbModel['playerIds'][0], dbModel['id'],
      dbModel['playerQnAs'], dbModel['gameOver'], dbModel['nextTurnPlayerId'],
      (dbModel['playerIds'].length > 1) ? dbModel['playerIds'][1] : undefined, dbModel['winnerPlayerId'],
      dbModel['GameStatus'], dbModel['createdAt'], dbModel['turnAt']);
    if (dbModel['playerIds'].length > 1) {
      game.addPlayer(dbModel['playerIds'][1]);  //2 players
    }
    game.setStat(dbModel['stats']);
    // console.log(game);
    return game;
  }


}
