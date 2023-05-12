/*
 * Starter Project for WhatsApp Echo Bot Tutorial
 *
 * Remix this as the starting point for following the WhatsApp Echo Bot tutorial
 *
 */
let msg = "";
("use strict");
let tables = {};
const { Client } = require("pg");
const connectionData = {
  user: process.env.user,
  host: process.env.host,
  database: process.env.database,
  password: process.env.password,
  port: 5432,
};
const client = new Client(connectionData);
client.connect();

function isIntList(array) {
  return array.every((element) => {
    return !isNaN(element);
  });
}

async function menu() {
  await client
    .query("SELECT id, nom FROM categories order by id asc")
    .then((response) => {
      let value = 0;
      while (value < response.rowCount) {
        value += 1;
        tables[response.rows[value - 1].id] = response.rows[value - 1].nom;
        msg =
          msg +
          " " +
          "*" +
          response.rows[value].id +
          ": " +
          capitalizeFirstLetter(response.rows[value].nom.split("_").join(" ")) +
          "*" +
          "\n\n";
      }
    })
    .catch((err) => {
      client.end();
    });
  await Promise.all(msg);
  return await msg;
}

async function listNames(name, numList) {
  let msg2 = "";
  var number = 1;
  await client
    .query("SELECT id, idCat, nom FROM items WHERE idCat = " + numList)
    .then((response) => {
      for (const i of response.rows) {
        msg2 = msg2 + " " + numList + "." + number + ": " + i.nom + "\n\n";
        number += 1;
      }
    })
    .catch((err) => {
      client.end();
    });
  await Promise.all(msg2);
  return await msg2;
}

async function listInfo(id1, id, msg) {
  let msgInfo = "";
  await client
    .query(
      "SELECT id, idCat, nom, informacion, contacto, horarios, web, direccion FROM (SELECT row_number() over() id, idCat, nom, informacion, contacto, horarios, web, direccion FROM items WHERE idCat = " +
        id1 +
        ") subquery WHERE id = " +
        id
    )
    .then((response) => {
      for (const i of response.rows) {
        msgInfo =
          msgInfo +
          " *" +
          msg +
          " " +
          i.nom.trim() +
          "*\n\n" +
          " " +
          i.informacion +
          "\n\n" +
          " *Contacto*" +
          ":\n " +
          i.contacto +
          "\n\n" +
          " *Horarios*" +
          ":\n " +
          i.horarios +
          "\n\n" +
          " *Web*" +
          ":\n " +
          i.web +
          "\n\n" +
          " *Direccion*" +
          ":\n " +
          i.direccion +
          "\n\n";
      }
    })
    .catch((err) => {
      client.end();
    });
  await Promise.all(msgInfo);
  return await msgInfo;
}

class Sender {
  constructor(phone_number_id, token, from) {
    this.phone_number_id = phone_number_id;
    this.token = token;
    this.from = from;
  }
  send(msg2) {
    axios({
      method: "POST",
      url:
        "https://graph.facebook.com/v12.0/" +
        this.phone_number_id +
        "/messages?access_token=" +
        this.token,
      data: {
        messaging_product: "whatsapp",
        to: this.from,
        text: { body: "*Respuesta automática*\n" + msg2 },
      },
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => console.log("response"))
      .catch((error) => console.log("error"));
  }
}

(async () => {
  msg = await menu();
})();

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const token = process.env.WHATSAPP_TOKEN;

const errorMsg =
  'BIENVENIDOS SOY EL BOT DE TRINITAT NOVA AQUÍ TENDRÉIS LA INFORMACIÓN DE LOS SERVICIOS DISPONIBLES DEL BARRIO \n\n AVISAROS QUE ESTO NO ES UN GRUPO DE WHATSAPP, SINO UN CHATBOT, LAS CONSULTAS NO SE PUBLICARÁN, NI SE CEDERÁN DATOS A TERCEROS \n\n TODA LA INFORMACIÓN ES PROPORCIONADA POR ASOCIACIONES Y VECINAS/OS DEL BARRIO \n\n Por favor si quiere saber los servicios disponibles en Trinitat Nova envíe la palabra "Hola" \n\n-----------\n\n BENVINGUTS SÓC EL BOT DE TRINITAT NOVA AQUÍ TINDREU LA INFORMACIÓ DELS SERVEIS DISPONIBLES DEL BARRI \n\n AVISEU-VOS QUE AIXÒ NO ÉS UN GRUP DE WHATSAPP, SINÓ UN CHATBOT, LES CONSULTES NO ES PUBLICARAN, NI SE CEDIRAN DADES A TERCERS \n\n TOTA LA INFORMACIÓ ÉS PROPORCIONADA PER ASSOCIACIONS I VEÏNES/OS DEL BARRI \n\n Si us plau si vol saber els serveis disponibles a Trinitat Nova envieu la paraula "Hola"';

const request = require("request"),
  express = require("express"),
  body_parser = require("body-parser"),
  axios = require("axios").default,
  app = express().use(body_parser.json());

app.listen(process.env.PORT || 8080, () => console.log("webhook is listening"));

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.get("/", (req, res) => {
  // res.sendFile('/app/index.html');
  res.render("/app/index2.ejs", {
    tables: tables,
  });
});
app.get("/form", (req, res) => {
  // res.sendFile('/app/index.html');
  res.render("/app/form_add.ejs", {
    tables: tables,
  });
});
app.get("/events", (req, res) => {
  // res.sendFile('/app/index.html');
  res.render("/app/events.ejs", {
    tables: tables,
  });
});
app.get("/index2", (req, res) => {
  // res.sendFile('/app/index.html');
  res.render("/app/index.ejs", {
    tables: tables,
  });
});
app.get("/admin", (req, res) => {
  // res.sendFile('/app/index.html');
  res.render("/app/admin.ejs", {
    tables: tables,
  });
});
app.get("/info", (req, res) => {
  // res.sendFile('/app/index.html');
  res.render("/app/info.ejs", {
    tables: tables,
  });
});
app.get("/login", (req, res) => {
  // res.sendFile('/app/index.html');
  res.render("/app/login.ejs");
});
app.get("/file", (req, res) => {
  // /something?color1=red
  res.sendFile("/app/src/" + req.query.name);
});

app.get("/api/tableName", (req, res) => {
  res.json(tables);
});

app.put("/api/tableName/:id", async (req, res) => {
  const id = req.params.id;
  const body = req.body;

  await client
    .query("update categories set nom = '" + body.nom + "' where id = " + id)
    .then((response) => {});
  msg = await menu();
  await res.json({
    message:
      `El nom de la categoria ` + body.nom + ` s'ha actualitzat correctament`,
  });
});

app.delete("/api/tableName/:id", async (req, res) => {
  const id = req.params.id;

  await client
    .query("delete from items where idCat = " + id)
    .then((response) => {});
  await client
    .query("delete from categories where id = " + id)
    .then((response) => {});
  msg = await menu();
  console.log(id);
  await res.json({
    message: `La categoria ` + id + `s'ha eliminat correctament`,
  });
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
      let msgList = msg_body.split(".");
      const sender = new Sender(phone_number_id, token, from);

      if (msg_body.toUpperCase() == "HOLA") {
        sender.send(msg);
      } else if (isIntList(msgList)) {
        if (msg_body.split(".").length == 1) {
          (async () => {
            if (
              1 <= parseInt(msg_body) &&
              parseInt(msg_body) <= Object.keys(tables).length
            ) {
              console.log("legal 1");
              sender.send(
                await listNames(tables[parseInt(msg_body)], msg_body)
              );
            } else {
              console.log("ilegal 1");
              sender.send(errorMsg);
            }
          })();
        } else if (msg_body.split(".").length > 1) {
          if (
            1 <= parseInt(msg_body.split(".")[0]) &&
            parseInt(msg_body.split(".")[0]) <= Object.keys(tables).length
          ) {
            (async () => {
              var msg2 = await listInfo(
                parseInt(msg_body.split(".")[0]),
                parseInt(msg_body.split(".")[1]),
                msg_body
              );
              if (msg2 != "") {
                console.log("legal 2");
                sender.send(msg2);
              } else {
                console.log("ilegal 2");
                sender.send(errorMsg);
              }
            })();
          }
        } else {
          sender.send(errorMsg);
        }
      } else {
        sender.send(errorMsg);
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
