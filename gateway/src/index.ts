import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from '@apollo/server/standalone';

// GraphQL schema
const typeDefs = `#graphql
    type Mutation{
        askCV(question: String!): String
    }
    type Query{
        _empty: String
    }
`;

//Dictionary of resolvers
const resolvers = {
    Mutation: {
        askCV: async (_: any, { question }: { question: string }) => { //parent and args are the parameters used here
            try {
                const contextPayload = {
                    question: question,
                    timestamp: new Date().toISOString(),
                    source: "CV_API_GATEWAY",
                };
                const aiServiceUrl = process.env.AI_SERVICE_URL || "http://127.0.0.1:5000/ask";

                const response = await fetch(aiServiceUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(contextPayload),
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json() as { answer: string };
                return data.answer;
            } catch (error) {
                console.error("Error in askCV:", error);
                throw new Error('Failed to get a response from the AI service.');
            }
        },
    },
};

async function start_server() {
    const server = new ApolloServer({
        typeDefs,
        resolvers,
    });

    const { url } = await startStandaloneServer(server, {
        listen: { port: 4000 },
    });

    console.log(`🚀 Server is running on ${url}`);
}

start_server();


