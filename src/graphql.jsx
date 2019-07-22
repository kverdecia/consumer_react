import React from 'react';
import { ApolloProvider } from 'react-apollo';
import { ApolloClient } from 'apollo-client';
import { createHttpLink } from 'apollo-link-http';
import { setContext } from 'apollo-link-context';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { useToken } from './oauth2'


export const GraphQL = ({children}) => {
    const token = useToken();
    const accessToken = token ? token.access_token : '';
    const httpLink = createHttpLink({
        uri: 'http://localhost:8000/graphql/',
    });
    const authLink = setContext((_, { headers }) => {
        return {
            headers: {
                ...headers,
                authorization: token ? `Bearer ${accessToken}` : "",
            }
        }
    });
    const client = new ApolloClient({
        link: authLink.concat(httpLink),
        cache: new InMemoryCache()
    });
    return (
        <ApolloProvider client={client}>
            {children}
        </ApolloProvider>
    );
}
