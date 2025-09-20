import { logInfo } from '../utils/logger.js';
import resolvers from './resolvers.js';
import schemaDefinition from './schema.js';
import { ApolloServer, gql } from 'apollo-server';

// The GraphQL schema
const typeDefs = gql`${schemaDefinition}`;

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const initGraphQL = () => {
    server.listen().then(({ url }) => {
      logInfo(`🚀 Server ready at ${url}`, 'GraphQL');
    });
};

export default initGraphQL;