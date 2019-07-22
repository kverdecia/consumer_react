import React, { useState, useContext, useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import ShortId from 'shortid';

const Oauth2Context = React.createContext({});

export const Oauth2 = ({clientId, secretKey, redirectUri, scope,
        authorizeUrl, tokenUrl, children}) => {
    const [ token, setToken ] = useState();
    const value = {clientId, secretKey, redirectUri, authorizeUrl, tokenUrl,
        scope, token, setToken};
    return (
        <Oauth2Context.Provider value={value}>
            {children}
        </Oauth2Context.Provider>
    );
}
Oauth2.propTypes = {
    clientId: PropTypes.string,
    secretKey: PropTypes.string,
    redirectUri: PropTypes.string,
    authorizeUrl: PropTypes.string,
    tokenUrl: PropTypes.string,
    scope: PropTypes.string,
    children: PropTypes.any.isRequired,
};
Oauth2.defaultProps = {
    clientId: process.env.REACT_APP_OAUTH2_CLIENT_ID,
    secretKey: process.env.REACT_APP_OAUTH2_SECRET_KEY,
    redirectUri: process.env.REACT_APP_OAUTH2_REDIRECT_URI,
    authorizeUrl: process.env.REACT_APP_OAUTH2_AUTHORIZE_URL,
    tokenUrl: process.env.REACT_APP_OAUTH2_TOKEN_URL,
    scope: process.env.REACT_APP_OAUTH2_SCOPE || 'read write',
};

const Login = () => {
    const isAuthorized = useIsAuthorized();
    const {
        response_type, client_id, redirect_uri,
        scope, state, authorizeUrl
    } = useLoginContext();
    if (!isAuthorized) {
        sessionStorage.setItem('oauth2State', state);
        const params = {response_type, client_id, redirect_uri, scope, state};
        const search = (new URLSearchParams(params)).toString();
        const url = `${authorizeUrl}?${search}`;
        const destination = new URL(url);
        window.location = destination;
    }
    return null;
}
Oauth2.Login = Login;

const Complete = ({match, location, success, error}) => {
    const { grant_type, client_id, client_secret,
        redirect_uri, tokenUrl, setToken} = useCompleteContext();
    const isAuthorized = useIsAuthorized();
    useEffect(() => {
        if (isAuthorized)
            return;
        const state = sessionStorage.getItem('oauth2State');
        sessionStorage.removeItem('oauth2State');
        if (!state)
            return error("Error authorizing application");
        let params = new URLSearchParams(location.search);
        const code = params.get('code');
        if (!code)
            return error("Error authorizing application.");
        const paramState = params.get('state');
        if (!state)
            return error("Error authorizing application.");
        if (state !== paramState)
            return error("Error authorizing application: wrong state value.");
        const formData = new FormData();
        formData.append('grant_type', grant_type);
        formData.append('client_id', client_id);
        formData.append('client_secret', client_secret);
        formData.append('redirect_uri', redirect_uri);
        formData.append('code', code);
        fetch(tokenUrl, {
            method: 'POST',
            body: formData
        }).then(result => result.json())
            .then(result => {
                setToken(result);
            });
    });
    return isAuthorized ? <Redirect to="/" push={false} /> : null;
}
Complete.propTypes = {
    success: PropTypes.func.isRequired,
    error: PropTypes.func.isRequired,
};
Complete.defaultProps = {
    success: () => null,
    error: () => null,
};
Oauth2.Complete = Complete;

export const useIsAuthorized = () => {
    return !!useContext(Oauth2Context).token
}

export const useLoginContext = () => {
    const { clientId:client_id, redirectUri:redirect_uri,
        authorizeUrl, scope } = useContext(Oauth2Context);
    const state = ShortId.generate();
    const response_type = 'code';
    return {response_type, client_id, redirect_uri, scope, state, authorizeUrl}
};

export const useCompleteContext = () => {
    const { tokenUrl, setToken, clientId: client_id,
        secretKey: client_secret, redirectUri: redirect_uri,
    } = useContext(Oauth2Context);
    const grant_type = 'authorization_code';
    return {grant_type, client_id, client_secret, redirect_uri, tokenUrl, setToken};
}

export const useToken = () => {
    const { token } = useContext(Oauth2Context);
    return token;
}

export const Authorized = ({children}) => {
    const isAuthorized = useIsAuthorized();
    return isAuthorized ? children : null;
}
Oauth2.Authorized = Authorized;

export const NotAuthorized = ({children}) => {
    const isAuthorized = useIsAuthorized();
    return isAuthorized ? null : children;
}
Oauth2.NotAuthorized = NotAuthorized;
