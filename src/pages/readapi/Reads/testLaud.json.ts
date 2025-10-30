import type { APIRoute } from "astro";
import neo4j from 'neo4j-driver';
import { v4 as uuidv4 } from 'uuid';
import nanoid from 'nanoid';
import Iron from '@hapi/iron';

const TOKEN_SECRET = process.env.TOKEN_SECRET




    


export const post: APIRoute = async ({ request }) => {
  const response = 'successfully from laudspeaker';
  console.log("this is the response right before send back to the client", response);

  const headers = new Headers();
  headers.set("Access-Control-Allow-Origin", "http://localhost:3000");
  headers.set("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type");

  // Create a new response object with CORS headers
  return new Response(JSON.stringify({
    message: response,
  }), {
    // Set HTTP status code
    status: 200,
    // Set headers for CORS
    headers: headers
  });
}
  
export const options = async ({ request }) => {
  // Handle OPTIONS preflight
  return new Response(null, {
      status: 204,
      headers: {
          "Access-Control-Allow-Origin": "http://localhost:3000",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
      }
  });
};



