/* Copyright G. Hemingway, @2023 - All rights reserved */
"use strict";
// const { GravHash } = require("../shared/index.cjs");

module.exports = (app, conf) => {
  // Make sure the user came to us first
  const checkState = async (goodState, state) => {
    if (goodState !== state)
      throw "Invalid state - Log out and in again before linking with Github.";
  };

  // Exchange temporary GH code for more permanent access_token
  const checkCode = async (code, state) => {
    const res = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: conf.github.client_id,
        client_secret: conf.github.client_secret,
        code,
        state,
        url: conf.github.url,
      }),
    });
    if (res.ok) return await res.json();
    throw "checkCode error";
  };

  // Fetch caller's github info
  const checkGithubInfo = async (accessToken) => {
    const res = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `token ${accessToken}`,
      },
    });
    if (res.ok) {
      const data = await res.json();
      console.log(`Fetched Github UserId: ${data.login}`);
      const resInfo = await fetch(
        `https://api.github.com/users/${data.login}`,
        {
          headers: {
            Authorization: `token ${accessToken}`,
          },
        }
      );
      if (resInfo.ok) {
        const dataInfo = await resInfo.json();
        console.log(dataInfo.login, dataInfo.email, dataInfo.avatar_url);
        return dataInfo;
      } else {
        throw "checkGithubUserInfo error";
      }
    }
    throw "checkGithubInfo error";
  };

  // Any attempt to login redirects to Github SSO auth
  app.get("/loginGH", (req, res) => {
    // Redirect to Github login with client_id, state and scope
    req.session.state = Math.random()
      .toString(36)
      .replace(/[^a-z]+/g, "")
      .substr(0, 10);
    const ghPath =
      `https://github.com/login/oauth/authorize?` +
      `scope=${conf.github.scope}&` +
      `client_id=${conf.github.client_id}&` +
      `state=${req.session.state}`;
    console.log(`Sending users to: ${ghPath}`);
    res.send({ ghPath: ghPath });
  });

  app.get("/auth/github", async (req, res) => {
    // Must have a temp code from GH
    if (!req.query.code)
      return res.status(400).send({ error: "Code field required" });
    // Must have state token too
    if (!req.query.state)
      return res.status(400).send({ error: "State field required" });
    // Validate state
    try {
      // Is this a valid GH response
      await checkState(req.session.state, req.query.state);
      // Convert code to token and scope
      const { access_token } = await checkCode(req.query.code, req.query.state);
      // Get GH username
      const user = await checkGithubInfo(access_token);
      console.log(
        `Fetched Github UserId: ${user.login} and id is ${user.node_id}`
      );
      // Save the login and token to the session for future use
      // req.session.user = {
      //   username: user.login,
      //   email: user.email,
      //   avatar: user.avatar_url,
      //   token: access_token,
      // };
      // Redirect to profile
      const exist = await await app.models.User.findOne({
        username: user.login.toLowerCase(),
      });
      if (exist) {
        if (await exist.authenticate(user.node_id)) {
          // Regenerate session when signing in to prevent fixation
          req.session.regenerate(() => {
            req.session.user = {
              ...exist._doc,
              token: access_token,
            };
            console.log(`Session.login success: ${req.session.user.username}`);
            // If a match, return 201:{ username, primary_email }
            res.redirect("/handle/" + user.login.toLowerCase());
          });
        } else {
          // If not a match, return 401:unauthorized
          console.log(`Session.login failed.  Incorrect credentials.`);
          res.status(401).send({ error: "unauthorized" });
        }
      } else {
        const first_name = user.name ? user.name.split(" ")[0] : "";
        const last_name = user.name ? user.name.split(" ")[1] : "";
        const userState = {
          username: user.login.toLowerCase(),
          first_name: first_name,
          last_name: last_name,
          primary_email: user.email ? user.email : "no@email.com",
          city: user.location ? user.location : "",
          avatar: user.avatar_url? user.avatar_url : "/images/githubicon.png",
          password: user.node_id,
        };
        try {
          let user = new app.models.User(userState);
          console.log(user);
          await user.save();
          // Send the happy response back
          res.redirect(
            `/handle/${userState.username}`
          );
        } catch (err) {
          console.log(err);
          // Error if username is already in use
          if (err.code === 11000) {
            if (err.message.indexOf("username_1") !== -1)
              res.status(400).send({ error: "username already in use" });
            if (err.message.indexOf("primary_email_1") !== -1)
              res.status(400).send({ error: "email address already in use" });
          }
          // Something else in the username failed
          else res.status(400).send({ error: err });
        }
      }
    } catch (err) {
      console.log(err);
      // Send user error
      res.status(400).send(err);
    }
  });
};