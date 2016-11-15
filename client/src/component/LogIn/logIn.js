import React from 'react';
import FacebookLogin from 'react-facebook-login'

class LogIn extends React.Component {
  constructor(props) {
	  super(props);
	  this.state = {
	    user: null
	  };
  }
  componentClicked(e) {
  	console.log(e)
  }

  responseFacebook(e) {
    this.setState({ user: true })
  }

  render() {
    return (
      <div className='LogIn'>
        <FacebookLogin
            appId="1709766049351226"
            autoLoad={true}
            fields="name,email,picture"
            onClick={this.componentClicked}
            callback={this.responseFacebook}
        />
      </div>
    );
  	
  }
}



export default LogIn;