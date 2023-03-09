/*
 * Starter Project for WhatsApp Echo Bot Tutorial
 *
 * Remix this as the starting point for following the WhatsApp Echo Bot tutorial
 *
 */
let msg = ""
"use strict";
let tables = {};
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
  await client.query("SELECT tablename FROM pg_tables where schemaname = 'public'")
      .then(response => {
          let value = 0
          while (value < response.rowCount-1) {
            value += 1;
            tables[value] = response.rows[value].tablename
          	msg = msg+" "+"*"+value+": "+capitalizeFirstLetter(response.rows[value].tablename.split('_').join(' '))+"*"+"\n\n"
          }
      })
      .catch(err => {
          client.end()
      })
  await Promise.all(msg)
  return await msg
}

async function listNames(name, numList){
  let msg2 = ""
  await client.query("SELECT id, nom FROM "+name)
      .then(response => {
          for(const i of response.rows) {
          	msg2 = msg2+" "+numList+"."+i.id+": "+i.nom+"\n\n"
          }
      })
      .catch(err => {
          client.end()
      })
  await Promise.all(msg2)
  return await msg2
}

(async () => {
	msg = await menu()
})()

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const token = process.env.WHATSAPP_TOKEN;

const request = require("request"),
  express = require("express"),
  body_parser = require("body-parser"),
  axios = require("axios").default,
  app = express().use(body_parser.json());

app.listen(process.env.PORT || 8080, () => console.log("webhook is listening"))
app.get("/", (req, res) => {
  // res.sendFile('/app/index.html');
  res.render("index.ejs", {
    tables: tables
  })
});
app.get("/admin", (req, res) => {
  // res.sendFile('/app/index.html');
  res.render("admin.ejs", {
    tables: tables
  })
});
app.get("/file", (req, res) => {
  // /something?color1=red
  res.sendFile('/app/src/'+req.query.name);
});
app.post("/webhook", (req, res) => {
  let body = req.body;

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
      
      if(msg_body.toUpperCase() == "MENU") {
          axios({
          method: "POST",
          url:
            "https://graph.facebook.com/v12.0/" +
            phone_number_id +
            "/messages?access_token=" +
            token,
          data: {
            messaging_product: "whatsapp",
            to: from,
            text: { body: '*Respuesta automática*\n'+msg },
          },
          headers: { "Content-Type": "application/json" },
        })
            .then((response) => console.log("response"))
            .catch((error) => console.log("error"));
      }
      else if(1 <= parseInt(msg_body) && parseInt(msg_body) <= Object.keys(tables).length){(async () => {
          axios({
          method: "POST",
          url:
            "https://graph.facebook.com/v12.0/" +
            phone_number_id +
            "/messages?access_token=" +
            token,
          data: {
            messaging_product: "whatsapp",
            to: from,
            text: { body: '*Respuesta automática*\n'+await listNames(tables[parseInt(msg_body)], msg_body) },
          },
          headers: { "Content-Type": "application/json" },
        })
            .then((response) => console.log("response"))
            .catch((error) => console.log(error));
        })()}
      else{
        axios({
          method: "POST",
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
            .then((response) => console.log("response"))
            .catch((error) => console.log("error"));
      }
    
    }
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

app.get("/webhook", (req, res) => {
  const verify_token = process.env.VERIFY_TOKEN;

  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];

  if (mode && token) {
    if (mode === "subscribe" && token === verify_token) {
      console.log("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});