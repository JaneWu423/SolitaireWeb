/* Copyright G. Hemingway, 2023 - All rights reserved */
"use strict";

require("md5");

const validPassword = (password) => {
  if (!password || password.length < 8) {
    return { error: "Password length must be > 7" };
  } else if (!password.match(/[0-9]/i)) {
    return { error: "Password must contain a number" };
  } else if (!password.match(/[a-z]/)) {
    return { error: "Password must contain a lowercase letter" };
  } else if (!password.match(/\@|\!|\#|\$|\%|\^/i)) {
    return { error: "Password must contain @, !, #, $, % or ^" };
  } else if (!password.match(/[A-Z]/)) {
    return { error: "Password must contain an uppercase letter" };
  }
  return undefined;
};

const GravHash = (email) => {
  let hash = email && email.replace(/^\s\s*/, "").replace(/\s\s*$/, "");
  hash = hash && hash.toLowerCase();
  hash = hash && md5(hash);
  return `https://www.gravatar.com/avatar/${hash}`;
}

const validUsername = (username) => {
  if (!username || username.length <= 2 || username.length >= 16) {
    return { error: "Username length must be > 2 and < 16" };
  } else if (!username.match(/^[a-z0-9]+$/i)) {
    return { error: "Username must be alphanumeric" };
  }
  return undefined;
};

const checkSuit = (card1, card2) => {
  if (card1.suit === "spades" || card1.suit === "clubs") {
    return card2.suit === "hearts" || card2.suit === "diamonds";
  } else {
    return card2.suit === "spades" || card2.suit === "clubs";
  }
};

const precedes = (card1, card2) => {
  if (card1.value === "king" || card2.value === "ace") return false;
  const list = [
    "ace",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "jack",
    "queen",
    "king",
  ];
  return list.indexOf(card1.value) + 1 === list.indexOf(card2.value);
};

module.exports = {
  validPassword: validPassword,
  GravHash: GravHash,
  validUsername: validUsername,
  checkSuit: checkSuit,
  precedes: precedes,
};