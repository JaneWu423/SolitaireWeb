/* Copyright G. Hemingway, 2023 - All rights reserved */
"use strict";

const should = require("should");
const assert = require("assert");
const request = require("superagent");
const harness = require("./harness.cjs");
const data = require("./data");
let config = {};
let users = data.users;
const envConfig = require("simple-env-config");
const env = process.env.NODE_ENV ? process.env.NODE_ENV : "test";

describe("Session:", () => {
  let primaryAgent = request.agent();
  let anonAgent = request.agent();
  before(async () => {
    config = await envConfig("./config/config.json", env);
    config.url = `${config.url}:${config.port}${config.api_version}/`;
    await harness.setup(config.mongodb);
    // Create a user for game testing
    await harness.createUser(config.url, users.primary);
  });
  after(async () => {
    await harness.shutdown();
  });

  describe("Log in:", () => {
    it("Failure - missing username", async () => {
      try {
        await primaryAgent.post(`${config.url}session`).send({
          password: "whattheduck",
        });
      } catch ({ response }) {
        response.status.should.equal(400);
        response.body.error.should.equal(`"username" is required`);
      }
    });
    it("Failure - missing password", async () => {
      try {
        await primaryAgent.post(`${config.url}session`).send({
          username: "whattheduck",
        });
      } catch ({ response }) {
        response.status.should.equal(400);
        response.body.error.should.equal(`"password" is required`);
      }
    });
    it("Failure - unknown user", async () => {
      try {
        await primaryAgent.post(`${config.url}session`).send({
          username: "whattheduck",
          password: users.primary.password,
        });
      } catch ({ response }) {
        response.status.should.equal(401);
        response.body.error.should.equal(`unauthorized`);
      }
    });
    it("Failure - wrong password", async () => {
      try {
        await primaryAgent.post(`${config.url}session`).send({
          username: users.primary.username,
          password: "whattheduck",
        });
      } catch ({ response }) {
        response.status.should.equal(401);
        response.body.error.should.equal(`unauthorized`);
      }
    });
    it("Success - log in user", async () => {
      const res = await primaryAgent.post(`${config.url}session`).send({
        username: users.primary.username,
        password: users.primary.password,
      });
      res.status.should.equal(200);
      res.body.username.should.equal(users.primary.username);
      res.body.primary_email.should.equal(users.primary.primary_email);
    });
  });

  describe("Log out:", () => {
    it("Success - log out logged in user", async () => {
      const res = await primaryAgent.del(`${config.url}session`);
      res.status.should.equal(204);
    });
    it("Success - call logout on not logged in user", async () => {
      const res = await anonAgent.del(`${config.url}session`);
      res.status.should.equal(200);
    });
  });
});
