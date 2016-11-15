import React from 'react';

class Home extends React.Component {
  constructor(props) {
	  super(props);
	  this.state = {
	    user: null
	  };
  }

  render() {
    return (
      <div id='HomePage'>
        <img src='../../../textures/logo.png' />
        <img id='HomeBackground' src='https://files.slack.com/files-tmb/T17PD5LF2-F33L30LB0-d679fde7e5/screen_shot_2016-11-15_at_12.28.35_pm_720.png' />
        <div id="testButtons">
          <button id="joinMatch" className='btn btn-primary'>Start Match</button>
          <button id="joinExisting" className='btn btn-primary'>Join Match</button>
        </div>
      </div>
    );
  	
  }
}



export default Home;