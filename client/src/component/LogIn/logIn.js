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
  	console.log(e)
  }

  responseFacebook(e) {
    this.setState({ user: true })
      console.log(e)
      if(e.name) {
        document.getElementById('LogIn').style.visibility = 'hidden'; 
        document.getElementById('Home').style.visibility = 'visible';
        
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