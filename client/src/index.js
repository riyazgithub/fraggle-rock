import React from 'react';
import ReactDOM from 'react-dom';
import LogIn from './component/LogIn/logIn.js';

const clientScene = require('./clientScene.js');
// var loaderScene = require('test.js');

// document.querySelector('#joinMatch').addEventListener('click', function() {
//   var blocker = document.getElementById( 'blocker' );
//   var instructions = document.getElementById( 'instructions' );
//   blocker.style.display = '';
//   document.addEventListener('keydown', function(e) {
//     if(e.keyCode === 16) {
// 	  blocker.style.display = '-webkit-box';
// 	  blocker.style.display = '-moz-box';
// 	  blocker.style.display = 'box';
// 	  if(instructions.style.display === '') {
// 		  instructions.style.display = 'none';
// 		  document.body.requestPointerLock()	
// 	  }else {
// 		  instructions.style.display = '';
//       document.exitPointerLock()
// 	  } 	
//     }
//   })
  
//   var button = document.getElementById('resume');
//   button.addEventListener('click', function(e) {
// 	  blocker.style.display = '-webkit-box';
// 	  blocker.style.display = '-moz-box';
// 	  blocker.style.display = 'box';
// 	  if(instructions.style.display === '') {
// 		  instructions.style.display = 'none';
// 		  document.body.requestPointerLock()	
// 	  }else {
// 		  instructions.style.display = '';
// 	  } 	
//   })

   
//   clientScene.startGame();
//   document.querySelector('#testButtons').remove();
// });

// document.querySelector('#joinExisting').addEventListener('click', function() {
//   var blocker = document.getElementById( 'blocker' );
//   var instructions = document.getElementById( 'instructions' );
//   blocker.style.display = 'none';
//   document.addEventListener('keydown', function(e) {
//   	console.log('hi')
//     if(e.keyCode === 16) {
// 	  blocker.style.display = '-webkit-box';
// 	  blocker.style.display = '-moz-box';
// 	  blocker.style.display = 'box';
// 	  if(instructions.style.display === '') {
// 	    instructions.style.display = 'none';
// 	  }else {
// 		instructions.style.display = '';
// 	  } 	
//     }
//   	})
//   clientScene.joinGame(0);
//   document.querySelector('#testButtons').remove();
// });


// const clientScene = require('./clientScene.js');
// var loaderScene = require('test.js');
ReactDOM.render(<LogIn />, document.getElementById('app'));