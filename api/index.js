import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { Client, auth } from "twitter-api-sdk";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(cors());

const URL = process.env.URL || "http://127.0.0.1";
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

/**
 * OAuth 2.0 Settings instructions:
 * - Use the Twitter Developer Portal to create a Project and an App.
 * - Configure your App by selecting the cog icon next to the App you wish to use.
 * - Click Edit under User authentication settings.
 * - Under OAuth 2.0 Settings, enable OAuth 2.0. Select "Web App" as your Type of App.
 * - Under General Authentication Settings make sure your Callback URI / Redirect URL is the hosted URL of Web App. Save your changes.
 */

const authClient = new auth.OAuth2User({
  client_id: process.env.CLIENT_ID,
  client_secret: process.env.CLIENT_SECRET,
  callback: `http://local.ordinaryartistservices.com/callback`,
  scopes: ["users.read", "tweet.read", "list.write"],
});
const clientOAuth = new Client(authClient);
const clientBearer = new Client(process.env.BEARER_TOKEN);

const STATE = "my-state";

app.get("/callback", async function (req, res) {
  try {
    const { code, state } = req.query;
    if (state !== STATE) return res.status(500).send("State isn't matching");
    await authClient.requestAccessToken(code);
    res.redirect("/tweets");
  } catch (error) {
    console.log(error);
  }
});

app.get("/login", async function (req, res) {
  const authUrl = authClient.generateAuthURL({
    state: STATE,
    code_challenge_method: "s256",
  });
  res.redirect(authUrl);
});

app.get("/revoke", async function (req, res) {
  try {
    const response = await authClient.revokeAccessToken();
    res.send(response);
  } catch (error) {
    console.log(error);
  }
});

app.get("/tweets", async function (req, res) {
  try {
    const response = await clientOAuth.lists.listAddMember("1572648727034175489", {
      user_id: "15673997",
    });

    console.log("response", JSON.stringify(response, null, 2));
    res.send(response);
  } catch (error) {
    console.log("tweets error", error);
  }
});

app.post("/checkName", async function (req, res) {
  try {
    const response = await clientBearer.users.findUserByUsername(req.body.username);
    res.send(response);
  } catch (error) {
    console.log("username retrieval error", error);
  }
});

app.listen(PORT, () => {
  console.log(`Go here to login: ${URL}:${PORT}/login`);
});
