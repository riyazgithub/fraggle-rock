import React from 'react';
import Home from '../Home/Home.js'
import FacebookLogin from 'react-facebook-login'

class LogIn extends React.Component {
  constructor(props) {
	  super(props);
	  this.state = {
	    user: null
	  };
    this.responseFacebook = this.responseFacebook.bind(this)
  }
  componentClicked(e) {
  }
  
  playAsGuest() {
    document.getElementById('LogIn').style.display = 'none'; 
    document.getElementById('Home').style.display = 'block';
  }

  responseFacebook(e) {
    this.setState({ user: true })
      if(e.name) {
        document.getElementById('LogIn').style.display = 'none'; 
        document.getElementById('Home').style.display = 'block';
        
      }
    
  }

  render() {
      return (
        <div>
        <div id='LogIn'>
          <div id='Facebook'>
            <FacebookLogin
                appId="1709766049351226"
                autoLoad={true}
                fields="name,email,picture"
                onClick={this.componentClicked}
                callback={this.responseFacebook}
            />
            <button onClick={this.playAsGuest} id='GuestLogIn'>Play As Guest</button>
          </div>
          <img id='LogInPageLogo' src="../../../textures/LogInPageLogo.jpg" />
        </div>
        <div id='Home'>
          <Home />
        </div>
        </div>
      );  
  	
  }
}



export default LogIn;