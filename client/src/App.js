import React from 'react';
import './App.css';

class App extends React.Component {
  constructor() {
    super()

    this.state = {
      returning: true
    }
  }

  render() {
    return (
      <div className="App">
        <button onClick={() => {
          this.setState({returning: true})
        }}>Returning User</button>
        <button onClick={() => {
          this.setState({returning: false})
        }}>New User</button>
        {this.state.returning ? <form onSubmit={e => {
          e.preventDefault()
          fetch("https://code.eganshub.net/api/login/?email=" + document.querySelector("#email").value)
          alert("returning")
        }}>
          <input id="email" type="email" placeholder="Email Address"></input>
          <button type="submit">Log In</button>
        </form> :
        <form onSubmit={e => {
          e.preventDefault()

          alert("new")
        }}>
          <input id="email" type="email" placeholder="Email Address"></input>
          <input id="name" type="name" placeholder="Full Name"></input>
          <input id="password" type="password" placeholder="Password"></input>
          <button type="submit">Log In</button>
        </form>}
      </div>
    );
  }
}

export default App;
