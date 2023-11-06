/* Copyright G. Hemingway, 2023 - All rights reserved */
"use strict";

const async = require("async");
const should = require("should");
const assert = require("assert");
const request = require("superagent");
const mongoose = require("mongoose");
let Models = {};
let timeout = (module.exports.timeout = 100);

const defaultCollections = [
  { name: "users", path: "../../src/server/models/user.cjs" },
  { name: "games", path: "../../src/server/models/game.cjs" },
  { name: "moves", path: "../../src/server/models/move.cjs" },
];

module.exports.setup = async (mongoURL) => {
  let collections = defaultCollections;
  // In our tests we use the test db
  try {
    await mongoose.connect(mongoURL);
    // Setup all the models
    collections.forEach((collection) => {
      Models[collection.name] = require(collection.path);
    });
    if (collections !== []) {
      await cleanup(collections);
    }
  } catch (err) {
    console.log(`Mongo connection error: ${err}`);
  }
};

const cleanup = (module.exports.cleanup = async (collections) => {
  for await (const collection of collections) {
    try {
      await Models[collection.name].deleteMany({});
      console.log(`    Collection ${collection.name} dropped.`);
    } catch (ex) {
      console.log("Cleanup error on: " + collection.name);
      console.log(ex);
    }
  }
});

module.exports.shutdown = async () => {
  // No need to drop anything here
  let collections = []; //defaultCollections;
  await cleanup(collections);
  await mongoose.connection.close();
};

module.exports.login = async (url, agent, user) => {
  // Ok, now login with user
  const res = await agent
    .post(`${url}session`)
    .send({ username: user.username, password: user.password });
  res.status.should.equal(200);
  res.body.username.should.equal(user.username);
  res.body.primary_email.should.equal(user.primary_email);
};

module.exports.logout = async (url, agent) => {
  const res = await agent.del(`${url}session`);
  res.status.should.equal(204);
};

module.exports.createUser = async (url, user) => {
  // Create a user for general context of the tests
  const res = await request.post(`${url}user`).send(user);
  res.status.should.equal(201);
};
