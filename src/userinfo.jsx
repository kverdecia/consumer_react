import React from 'react';
import gql from "graphql-tag";
import { Query } from "react-apollo";

const fetchIdentity = gql`
query {
    identity {
        id
        username
        email
        firstName
        lastName
    }
}
`;

export const UserInfo = () =>
    <Query query={fetchIdentity}>
        {({loading, data}) => {
            if (loading)
                return 'loading...';
            return JSON.stringify(data, 2, 2);
        }}
    </Query>;
