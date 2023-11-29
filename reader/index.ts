import { APIGatewayEvent, APIGatewayProxyResult, Handler } from 'aws-lambda';
import { MongoClient } from 'mongodb';
import {
    GetSecretValueCommand,
    SecretsManagerClient,
  } from "@aws-sdk/client-secrets-manager";

const sm = new SecretsManagerClient();
async function getClient() {
    try {
        const secret = await sm.send(
            new GetSecretValueCommand({
                SecretId: 'connectionString'
            }),
        );
        sm.destroy();
        const url = String(secret.SecretString);
        return new MongoClient(url);
    } catch (error) {
        console.error('Failed to get Mongo');
        throw error;
    }
}

export const handler: Handler = async (event: APIGatewayEvent, context): Promise<APIGatewayProxyResult> => {
    console.log(event);
    try {
        const client = await getClient();
        const db = client.db('demoDB');
        const collection = db.collection('complaints');

        let result  = await collection.find({});
        client.close();
        return {
            statusCode: 200,
            body: JSON.stringify(result)
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify(error)
        };
    }
};