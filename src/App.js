import React from 'react';
import { BrowserRouter, Route, Link } from 'react-router-dom';
import { Oauth2 } from './oauth2';
import { GraphQL } from './graphql';
import { UserInfo } from './userinfo';
import './App.css';

function App() {
    return (
        <BrowserRouter>
            <Oauth2>
                <GraphQL>
                    <div className="App">
                        <Oauth2.NotAuthorized>
                            <Link to="/login">Login</Link>
                        </Oauth2.NotAuthorized>
                        <Oauth2.Authorized>
                            Logged!!!
                            <UserInfo />
                        </Oauth2.Authorized>
                    </div>
                    <Route exact path="/login" component={Oauth2.Login} />
                    <Route exact path="/login/complete" component={Oauth2.Complete} />
                </GraphQL>
            </Oauth2>
        </BrowserRouter>
    );
}

export default App;
