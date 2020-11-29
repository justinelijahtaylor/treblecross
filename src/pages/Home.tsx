import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonItem, IonRange, IonButton } from '@ionic/react';
import React from 'react';
import ExploreContainer from '../components/ExploreContainer';
import './Home.css';

type MyState = {
  numberOfBoards: any;
  boardState: boolean[][];
  boardSizeArray: number[];
  boardBruteForce: boolean[][];
  gameOver: boolean;
  computerWins: boolean;
}

type MyProps = {

}

class Home extends React.Component<MyProps,MyState> {
  constructor(props: MyProps) {
    super(props)

    this.state = {
      numberOfBoards: 1,
      boardState: [],
      boardSizeArray: [],
      boardBruteForce: [],
      gameOver: false,
      computerWins: false
    }

    this.generateTrebleCrossBoard = this.generateTrebleCrossBoard.bind(this);
    this.updateBoardState = this.updateBoardState.bind(this);
    this.computersTurn = this.computersTurn.bind(this);
    this.calculateHeaps = this.calculateHeaps.bind(this);
    this.calculateNimSum = this.calculateNimSum.bind(this);
    this.doesWinningMoveExist = this.doesWinningMoveExist.bind(this);
  }




  generateTrebleCrossBoard() {
    let tempBoardSizeArray = []
    let tempBoardState = []
    for(let i = 0; i < this.state.numberOfBoards; i++) {
      //creates a board of size 1 to 14
      tempBoardSizeArray.push(Math.floor(Math.random() * Math.floor(8))+5)
      tempBoardState.push(new Array(tempBoardSizeArray[i]).fill(false))
    }
    this.setState({boardState: tempBoardState, boardSizeArray: tempBoardSizeArray, gameOver: false, computerWins: false})

  }

  updateBoardState(boardIndex: number, squareIndex: number) {
    if(this.state.boardState[boardIndex][squareIndex] !== true && this.state.gameOver !== true) {
      let tempBoardState = this.state.boardState;
      tempBoardState[boardIndex][squareIndex] = true;
      this.setState({boardState: tempBoardState})
      let win = this.didPlayerWin()
      if(win != true) {
        this.computersTurn()
      }

    }
  }

  calculateHeaps(boardState: boolean[][]) : number[][]{
    let evaluationArray = []
    let tempEvalArray : number[] = []
    let heapSize : number = 0;
    //need to see all heaps
    for(let i = 0; i < this.state.numberOfBoards; i++) {
      heapSize = 0;
      for(let j = 0; j < this.state.boardSizeArray[i]; j++) {
        if(boardState[i][j] === false) {
          heapSize = heapSize + 1;
          if(j === 0) {
            heapSize = heapSize + 1;
          }
        } else {
          //we hit an X
          if(heapSize !== 0) {
            heapSize = heapSize - 1;
          }
          if(heapSize !== 0) {
            tempEvalArray.push(heapSize);
          }
          heapSize = -1;
        }
      }
      if(heapSize === this.state.boardSizeArray[i]) {
        heapSize = heapSize + 2;
        tempEvalArray.push(heapSize);
        heapSize = 0;
      } else {
        if(heapSize !== 0 && heapSize !== -1) {
          heapSize = heapSize + 1;
          tempEvalArray.push(heapSize);
          heapSize = 0;
        }
      }
      evaluationArray.push(tempEvalArray)
      tempEvalArray = []
    }

    return evaluationArray
  }

  calculateNimSum(evaluationArray: number[][]) : number {
    let heapValues = [0,0,0,1,1,1,2,2,0,3,3,1,1,1,0]
    let nimValueArray = evaluationArray.map(board_heaps => {
      return board_heaps.map(heap => {
        return heapValues[heap]
      })
    })

    let sum = 0
    for(let i = 0; i < this.state.numberOfBoards; i++) {
      for(let j = 0; j < nimValueArray[i].length; j++) {
        if(nimValueArray[i][j]) {
          sum = sum^nimValueArray[i][j]
        }
      }
    }
    return sum;
  }

  doesWinningMoveExist() : number[] {
    let sentinel = true
    let winningMove = [-1,-1]
    for(let i = 0; i < this.state.numberOfBoards; i++) {

      for(let j = 0; j < this.state.boardSizeArray[i]; j++) {
        if(this.state.boardState[i][j] === true) {
          if(j - 1 > -1) {
            if(this.state.boardState[i][j-1] === true) {
              sentinel = false;
              if(j - 2 > -1) {
                winningMove = [i,j-2]
              } else {
                winningMove = [i,j+1]
              }
            }
          }
          if(j - 2 > -1) {
            if(this.state.boardState[i][j-2] === true) {
              sentinel = false;
              winningMove = [i,j-1]
            }
          }
          if(j+1 < this.state.boardState[i].length) {
            if(this.state.boardState[i][j+1] === true) {
              sentinel = false;
              if(j+2 < this.state.boardState[i].length) {
                winningMove = [i,j+2]
              } else {
                winningMove = [i,j-1]
              }
            }
          }
          if(j+2 < this.state.boardState[i].length) {
            if(this.state.boardState[i][j+2] === true) {
              sentinel = false;
              winningMove = [i,j+1]
            }
          }
        }
      }
    }
    return winningMove
  }

  didPlayerWin() : boolean {
    let win = false;
    for(let i = 0; i < this.state.numberOfBoards; i++) {
      for(let j = 0; j < this.state.boardSizeArray[i]; j++) {
        if(this.state.boardState[i][j] === true) {
          if(j + 1 < this.state.boardSizeArray[i] && this.state.boardState[i][j+1] === true) {
            if(j + 2 < this.state.boardSizeArray[i] && this.state.boardState[i][j+2] === true) {
              this.setState({gameOver: true, computerWins: false})
              win = true
            }
          }
        }
      }
    }
    return win
  }

  computersTurn() {

    let cur_heaps = this.calculateHeaps(this.state.boardState)
    let cur_nimsum = this.calculateNimSum(cur_heaps)
    //evaulate board state
    let bruteForce : boolean[][]= []
    for(let i = 0; i < this.state.boardState.length; i++) {
      let temp = []
      for(let j = 0 ; j < this.state.boardState[i].length; j++) {
        temp.push(this.state.boardState[i][j])
      }
      bruteForce.push(temp)
    }

    //brute force method to try and find best bestMove
    for(let i = 0; i < this.state.numberOfBoards; i++) {

      for(let j = 0; j < this.state.boardSizeArray[i]; j++) {
        let sentinel = true
              if(bruteForce[i][j] === true) {
                sentinel = false;
              }
              if(j - 1 > -1) {
                if(bruteForce[i][j-1] === true) {
                  sentinel = false;
                }
              }
              if(j - 2 > -1) {
                if(bruteForce[i][j-2] === true) {
                  sentinel = false;
                }
              }
              if(j+1 < bruteForce[i].length) {
                if(bruteForce[i][j+1] === true) {
                  sentinel = false;
                }
              }
              if(j+2 < bruteForce[i].length) {
                if(bruteForce[i][j+2] === true) {
                  sentinel = false;
                }
              }
              let winningMove = this.doesWinningMoveExist()
              if(winningMove[0] !== -1) {

                let tempBoardState = this.state.boardState;
                tempBoardState[winningMove[0]][winningMove[1]] = true;
                this.setState({boardState: tempBoardState, gameOver: true, computerWins: true})
                return;
              }

              if(sentinel) {
                bruteForce[i][j] = true
                let heaps = this.calculateHeaps(bruteForce)
                let nimsum = this.calculateNimSum(heaps)
                if(nimsum === 0) {
                  //we found our move
                  let tempBoardState = this.state.boardState;
                  tempBoardState[i][j] = true;
                  this.setState({boardState: tempBoardState})
                  return;
                } else {
                  bruteForce[i][j] = false

          }
        }
      }
    }
    //we have found zero moves to reduce game to zero sum. make first available move that does not immediately lose the game
    for(let i = 0; i < this.state.numberOfBoards; i++) {

      for(let j = 0; j < this.state.boardSizeArray[i]; j++) {
        let sentinel = true
              if(bruteForce[i][j] === true) {
                sentinel = false;
              }
              if(j - 1 > -1) {
                if(bruteForce[i][j-1] === true) {
                  sentinel = false;
                }
              }
              if(j - 2 > -1) {
                if(bruteForce[i][j-2] === true) {
                  sentinel = false;
                }
              }
              if(j+1 < bruteForce[i].length) {
                if(bruteForce[i][j+1] === true) {
                  sentinel = false;
                }
              }
              if(j+2 < bruteForce[i].length) {
                if(bruteForce[i][j+2] === true) {
                  sentinel = false;
                }
              }

              if(sentinel) {
                let tempBoardState = this.state.boardState;
                tempBoardState[i][j] = true;
                this.setState({boardState: tempBoardState})
                return;
        }
      }
    }

    //we have found zero moves we can do that will not immediately lose the game. time for the computer to lose, gg player.
    for(let i = 0; i < this.state.numberOfBoards; i++) {

      for(let j = 0; j < this.state.boardSizeArray[i]; j++) {
        if(bruteForce[i][j] !== true) {
          let tempBoardState = this.state.boardState;
          tempBoardState[i][j] = true;
          this.setState({boardState: tempBoardState})
          return;
        }
      }
    }
  }


  render() {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Treblecross</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
        <h2>Math 576 Final Project of Justin Taylor, Javier Doward, David Munn Carstensen</h2>

          <IonItem id='rangeSliderItem'>
            <IonRange id='rangeSlider' onIonChange={e => {this.setState({numberOfBoards: e.detail.value})}} min={1} max={5} step={1} snaps={true} color="secondary" />
          </IonItem>
          <h2 id='numBoardsLabel'>Number of Treblecross boards selected: {+ this.state.numberOfBoards}</h2>
          <IonButton id='generateBoards' onClick={() => {this.generateTrebleCrossBoard()}}>Generate Boards / Play Again</IonButton>

          {this.state.boardState.map((Board, boardIndex) => <div className='board' key={boardIndex}>{
            Board.map((Square, squareIndex) =>
              <button onClick={() => {this.updateBoardState(boardIndex, squareIndex)}} key={boardIndex.toString() + "," + squareIndex.toString()} className="square">{Square ? 'X' : ''}</button>
            )
          }</div>
          )}

          {this.state.gameOver ? <h2 id='gameOverMessage'>The game is over! {this.state.computerWins ? 'The computer has won!' : 'You have won!'}</h2> : undefined}

        </IonContent>
      </IonPage>
    );
  }
}


export default Home;
