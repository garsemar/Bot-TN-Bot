/*
 * Starter Project for WhatsApp Echo Bot Tutorial
 *
 * Remix this as the starting point for following the WhatsApp Echo Bot tutorial
 *
 */

"use strict";

const { Client } = require('pg')
  const connectionData = {
      user: 'rwndjpvi',
      host: 'trumpet.db.elephantsql.com',
      database: 'rwndjpvi',
      password: 'xe7nhSHrlEA62i6n5EzzNeI5uUKUJ5Wa',
      port: 5432,
  }
  const client = new Client(connectionData)
  client.connect()

async function menu(){
  let msg = ""
  await client.query("SELECT tablename FROM pg_tables where schemaname = 'public'")
      .then(response => {
          let value = 0
          while (value < response.rowCount-1) {
            value += 1;
          	msg = msg+" "+"*"+value+". "+capitalizeFirstLetter(response.rows[value].tablename.split('_').join(' '))+"*"+"\n\n"
          }
      })
      .catch(err => {
          client.end()
      })
  await Promise.all(msg)
  return await msg
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}


// Access token for your app
// (copy token from DevX getting started page
// and save it as environment variable into the .env file)
const token = process.env.WHATSAPP_TOKEN;

// Imports dependencies and set up http server
const request = require("request"),
  express = require("express"),
  body_parser = require("body-parser"),
  axios = require("axios").default,
  app = express().use(body_parser.json()); // creates express http server

// Sets server port and logs message on success
app.listen(process.env.PORT || 8080, () => console.log("webhook is listening"))
app.get("/", (req, res) => {
  res.sendFile('/app/index.html');
});
app.get("/style", (req, res) => {
  res.sendFile('/app/style.css');
});
app.get("/fondo", (req, res) => {
  res.sendFile('/app/src/fondo.jpg')
});
app.get("/logo", (req, res) => {
  res.sendFile('/app/src/bot.png');
});
// Accepts POST requests at /webhook endpoint
app.post("/webhook", (req, res) => {
  // Parse the request body from the POST
  let body = req.body;

  // Check the Incoming webhook message
  console.log(JSON.stringify(req.body, null, 2));

  // info on WhatsApp text message payload: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/payload-examples#text-messages
  if (req.body.object) {
    if (
      req.body.entry &&
      req.body.entry[0].changes &&
      req.body.entry[0].changes[0] &&
      req.body.entry[0].changes[0].value.messages &&
      req.body.entry[0].changes[0].value.messages[0]
    ) {
      let phone_number_id =
        req.body.entry[0].changes[0].value.metadata.phone_number_id;
      let from = req.body.entry[0].changes[0].value.messages[0].from; // extract the phone number from the webhook payload
      let msg_body = req.body.entry[0].changes[0].value.messages[0].text.body; // extract the message text from the webhook payload
      
      if(msg_body.toUpperCase() == "MENU") {(async () => {
          axios({
          method: "POST", // Required, HTTP method, a string, e.g. POST, GET
          url:
            "https://graph.facebook.com/v12.0/" +
            phone_number_id +
            "/messages?access_token=" +
            token,
          data: {
            messaging_product: "whatsapp",
            to: from,
            text: { body: '*Respuesta automática*\n'+await menu() },
          },
          headers: { "Content-Type": "application/json" },
        })
            .then((response) => console.log(response))
            .catch((error) => console.log(error));
        })()}
      else{
        axios({
          method: "POST", // Required, HTTP method, a string, e.g. POST, GET
          url:
            "https://graph.facebook.com/v12.0/" +
            phone_number_id +
            "/messages?access_token=" +
            token,
          data: {
            messaging_product: "whatsapp",
            to: from,
            text: { body: '*Respuesta automática*\n'+'Por favor si quiere saber los servicios disponibles en Trinitat Nova envíe la palabra "MENU"' },
          },
          headers: { "Content-Type": "application/json" },
        })
            .then((response) => console.log(response))
            .catch((error) => console.log(error));
      }
    
    }
    res.sendStatus(200);
  } else {
    // Return a '404 Not Found' if event is not from a WhatsApp API
    res.sendStatus(404);
  }
});

// Accepts GET requests at the /webhook endpoint. You need this URL to setup webhook initially.
// info on verification request payload: https://developers.facebook.com/docs/graph-api/webhooks/getting-started#verification-requests
app.get("/webhook", (req, res) => {
  /**
   * UPDATE YOUR VERIFY TOKEN
   *This will be the Verify Token value when you set up webhook
   **/
  const verify_token = process.env.VERIFY_TOKEN;

  // Parse params from the webhook verification request
  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];

  // Check if a token and mode were semeta dev nt
  if (mode && token) {
    // Check the mode and token sent are correct
    if (mode === "subscribe" && token === verify_token) {
      // Respond with 200 OK and challenge token from the request
      console.log("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
});