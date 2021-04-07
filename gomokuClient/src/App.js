import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from './components/Navbar';
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom'
import Home from './pages/Home';
import Login from './pages/Login';
import Game from './pages/Game';
import Room from './pages/Room';
import Me from './pages/Me';


class App extends React.Component{
    render(){
        return (
            <main className="main">
                <Router>
                    <Navbar />
                    <Switch>
                        <Route path='/' exact component={Home}/>
                        <Route path='/Login' component={Login}/>
                        <Route path='/Room' component={Room} />
                        <Route path='/Me' component={Me}/>
                        <Route path='/Game/:mode/:targetRoomId' component={Game}/>
                    </Switch>
                </Router>
            </main>
        );
    }
}

export default App;