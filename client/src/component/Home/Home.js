import React from 'react';

const clientScene = require('../../clientScene.js');

class Home extends React.Component {
  constructor(props) {
	  super(props);
	  this.state = {
	    user: null
	  };
  }
  
  StartMatch() {
    var blocker = document.getElementById( 'blocker' );
    var instructions = document.getElementById( 'instructions' );
    blocker.style.display = '';
    document.addEventListener('keydown', function(e) {
      if(e.keyCode === 16) {
     blocker.style.display = '-webkit-box';
     blocker.style.display = '-moz-box';
     blocker.style.display = 'box';
     if(instructions.style.display === '') {
       instructions.style.display = 'none';
       document.body.requestPointerLock()  
     }else {
       instructions.style.display = '';
        document.exitPointerLock()
     }   
      }
    })
    
    var button = document.getElementById('resume');
    button.addEventListener('click', function(e) {
     blocker.style.display = '-webkit-box';
     blocker.style.display = '-moz-box';
     blocker.style.display = 'box';
     if(instructions.style.display === '') {
       instructions.style.display = 'none';
       document.body.requestPointerLock()  
     }else {
       instructions.style.display = '';
     }   
    })

    document.getElementById( 'HomePage' ).style.display = 'none'; 
    clientScene.startGame();
    document.querySelector('#testButtons').remove();
  }


  JoinExisting() {
    var blocker = document.getElementById( 'blocker' );
    var instructions = document.getElementById( 'instructions' );
    blocker.style.display = 'none';
    document.addEventListener('keydown', function(e) {
     console.log('hi')
      if(e.keyCode === 16) {
     blocker.style.display = '-webkit-box';
     blocker.style.display = '-moz-box';
     blocker.style.display = 'box';
     if(instructions.style.display === '') {
       instructions.style.display = 'none';
     }else {
     instructions.style.display = '';
     }   
      }
     })
    clientScene.joinGame(0);
    document.querySelector('#testButtons').remove();
  }

  render() {
    return (
      <div id='HomePage'>
        <img src='../../../textures/logo.png' />
        <img id='HomeBackground' src='https://files.slack.com/files-tmb/T17PD5LF2-F33L30LB0-d679fde7e5/screen_shot_2016-11-15_at_12.28.35_pm_720.png' />
        <div id="testButtons">
          <button id="joinMatch" onClick={this.StartMatch} className='btn btn-primary'>Start Match</button>
          <button id="joinExisting" onClick={this.JoinExisting} className='btn btn-primary'>Join Match</button>
        </div>
          <button id="LeaderBoard"className='btn btn-primary'>View LeaderBoards</button>
      </div>
    );
  	
  }
}



export default Home;