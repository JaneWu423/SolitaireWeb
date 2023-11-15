/* Copyright G. Hemingway, 2023 - All rights reserved */
"use strict";

const Joi = require("joi");
const {
  initialState,
  shuffleCards,
  filterGameForProfile,
  filterMoveForResults,
} = require("../../solitare.cjs");

module.exports = (app) => {
  /**
   * Create a new game
   *
   * @param {req.body.game} Type of game to be played
   * @param {req.body.color} Color of cards
   * @param {req.body.draw} Number of cards to draw
   * @return {201 with { id: ID of new game }}
   */
  app.post("/v1/game", async (req, res) => {
    if (!req.session.user)
      return res.status(401).send({ error: "unauthorized" });

    // Schema for user info validation
    const schema = Joi.object({
      game: Joi.string().lowercase().required(),
      color: Joi.string().lowercase().required(),
      draw: Joi.any(),
    });
    // Validate user input
    try {
      const data = await schema.validateAsync(req.body, { stripUnknown: true });
      // Set up the new game
      let newGame = {
        owner: req.session.user._id,
        active: true,
        cards_remaining: 52,
        color: data.color,
        game: data.game,
        score: 0,
        start: Date.now(),
        winner: "",
        state: [],
      };
      switch (data.draw) {
        case "Draw 1":
          newGame.drawCount = 1;
          break;
        case "Draw 3":
          newGame.drawCount = 3;
          break;
        default:
          newGame.drawCount = 1;
      }
      console.log(newGame);
      // Generate a new initial game state
      newGame.state = initialState();
      let game = new app.models.Game(newGame);
      try {
        await game.save();
        const query = { $push: { games: game._id } };
        // Save game to user's document too
        await app.models.User.findByIdAndUpdate(req.session.user._id, query);
        res.status(201).send({ id: game._id });
      } catch (err) {
        console.log(`Game.create save failure: ${err}`);
        res.status(400).send({ error: "failure creating game" });
        // TODO: Much more error management needs to happen here
      }
    } catch (err) {
      const message = err.details[0].message;
      console.log(`Game.create validation failure: ${message}`);
      res.status(400).send({ error: message });
    }
  });

  /**
   * Fetch game information
   *
   * @param (req.params.id} Id of game to fetch
   * @return {200} Game information
   */
  app.get("/v1/game/:id", async (req, res) => {
    try {
      let game = await app.models.Game.findById(req.params.id);
      if (!game) {
        res.status(404).send({ error: `unknown game: ${req.params.id}` });
      } else {
        const state = game.state.toJSON();
        let results = filterGameForProfile(game);
        results.start = Date.parse(results.start);
        results.cards_remaining =
          52 -
          (state.stack1.length +
            state.stack2.length +
            state.stack3.length +
            state.stack4.length);
        // Do we need to grab the moves
        if (req.query.moves === "") {
          const moves = await app.models.Move.find({ game: req.params.id });
          state.moves = moves.map((move) => filterMoveForResults(move));
        }
        results.drawCount = game.drawCount;
        res.status(200).send(Object.assign({}, results, state));
      }
    } catch (err) {
      console.log(`Game.get failure: ${err}`);
      res.status(404).send({ error: `unknown game: ${req.params.id}` });
    }
  });

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
  const checkSuit = (card1, card2) => {
    if (card1.suit === "spades" || card1.suit === "clubs") {
      return card2.suit === "hearts" || card2.suit === "diamonds";
    } else {
      return card2.suit === "spades" || card2.suit === "clubs";
    }
  };

  const checkStack = (stack, cards) => {
    if (cards.length === 1) {
      if (stack.length === 0 && cards[0].value === "ace") {
        return true;
      } else if (stack.length > 0) {
        const topCard = stack[stack.length - 1];
        if (topCard.suit === cards[0].suit && precedes(topCard, cards[0])) {
          return true;
        }
      }
    }
    return false;
  };

  const checkPile = (pile, cards) => {
    const leadCard = cards[0];
    if (pile.length === 0 && leadCard.value === "king") {
      return true;
    } else if (pile.length > 0) {
      const topCard = pile[pile.length - 1];
      if (checkSuit(leadCard, topCard) && precedes(leadCard, topCard)) {
        return true;
      }
    }
    return false;
  };

  const checkMove = (state, cards, src, dest, drawCnt) => {
    if (dest === "draw") return false;
    if (dest.startsWith("stack")) {
      return checkStack(state[dest], cards);
    }
    if (dest.startsWith("pile")) {
      return checkPile(state[dest], cards);
    }
    if (dest === "discard") {
      return src === "draw" && cards.length < drawCnt+1;
    }
  };
  let validateMove = (drawCnt, state, move) => {
    const src = move.src;
    const dest = move.dest;
    const cards = move.cards;
    if (checkMove(state, cards, src, dest, drawCnt)) {
      let newSrc = [],
        newDest = [];
      if (move.src === "draw" && state[move.src].length == 0) {
        newSrc = state["discard"];
        newSrc.map((card) => (card.up = false));

        newSrc.reverse();
      } else {
        move.cards.map((card) => (card.up = true));
        const moveCards = drawCnt===3 && move.dest==="discard"? move.cards.reverse(): move.cards;
        newDest =
          state[move.dest].length === 0
            ? moveCards
            : [...state[move.dest], ...moveCards];
        newSrc = state[move.src].slice(0, -moveCards.length);
        if (newSrc.length > 0 && move.src !== "draw")
          newSrc.slice(-1)[0].up = true;
      }

      const newState = {
        ...state,
        [move.src]: newSrc,
        [move.dest]: newDest,
      };
      return newState;
    }
  };

  /**
   * update game information with new moves
   *
   * @param (req.params.id} Id of game to update
   * @return {200} new game information
   */
  app.put("/v1/game/:id", async (req, res) => {
    if (!req.session.user){
      return res.status(401).send({ error: "unauthorized" });
    }
    try {
      let game = await app.models.Game.findById(req.params.id)
        .populate("owner")
        .exec();
      if (!game) {
        return res
          .status(404)
          .send({ error: `unknown game: ${req.params.id}` });
      } else if (game.owner.username !== req.session.user.username) {
        return res
          .status(401)
          .send({ error: `not owner of game: ${req.params.id}` });
      } else if(game.won){
        return res.status(201).send(game.state);
      }
      else{
        const drawCnt = game.drawCount;
        const state = game.state.toJSON();
        let move = req.body;

        let newState = validateMove(drawCnt, state, move);
        let won = false;
        if (newState) {
          move = new app.models.Move({
            ...move,
            game: req.params.id,
            date: Date.now(),
            user: req.session.user._id,
          });
          try {
            let query = {};
            if (
              newState.stack1.length === 13 &&
              newState.stack2.length === 13 &&
              newState.stack3.length === 13 &&
              newState.stack4.length === 13
            ) {
              won = true;
              query = {
                $inc: { moves: 1 }, 
                $set: {
                  state: newState,
                  won: true,
                  active: false,
                  end: Date.now(),
                },
              };
            } else {
              query = {
                $inc: { moves: 1 }, 
                $set: { state: newState }, 
              };
            }
            // Save game to user's document too
            await app.models.Game.findByIdAndUpdate(req.params.id, query);
            await move.save();
            if (won) {
              return res.status(201).send(newState);
            } else{
            return res.status(200).send(newState);
          }
          } catch (err) {
            console.log("Failed to save game state", err);
            return res.status(400).send({ error: "Failed updating game" });
          }
        } else {
          res.status(400).send({ error: "Invalid move" });
        }
      }
    } catch (err) {
      console.log(`Game.get failure: ${err}`);
      res.status(404).send({ error: `unknown game: ${req.params.id}` });
    }
  });

  // Provide end-point to request shuffled deck of cards and initial state - for testing
  app.get("/v1/cards/shuffle", (req, res) => {
    res.send(shuffleCards(false));
  });
  app.get("/v1/cards/initial", (req, res) => {
    res.send(initialState());
  });
};
