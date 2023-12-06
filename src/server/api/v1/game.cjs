/* Copyright G. Hemingway, 2023 - All rights reserved */
"use strict";

const Joi = require("joi");
const {
  initialState,
  shuffleCards,
  filterGameForProfile,
} = require("../../solitare.cjs");

const { validateMove, checkScore, checkAutoMove } = require("./helper.cjs");

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
          try {
            const moves = await app.models.Move.find({ game: req.params.id });
            results.move_details = moves;
          } catch (err) {
            console.log(`Move.get failure: ${err}`);
            res
              .status(404)
              .send({ error: `Failed to get move for: ${req.params.id}` });
          }
        } else if (req.query.end === "") {
          try {
            let query = {
              $set: {
                active: false,
                end: Date.now(),
                score: game.score,
              },
            };
            // Save game to user's document too
            await app.models.Game.findByIdAndUpdate(req.params.id, query);
            return res.status(201).send({});
          } catch (err) {
            return res.status(400).send({ error: "Failed Ending game" });
          }
        }
        results.drawCount = game.drawCount;
        results.active = game.active;
        results.won = game.won;
        return res.status(200).send(Object.assign({}, results, state));
      }
    } catch (err) {
      console.log(`Game.get failure: ${err}`);
      res.status(404).send({ error: `unknown game: ${req.params.id}` });
    }
  });


  /**
   * update game information with new moves
   *
   * @param (req.params.id} Id of game to update
   * @return {200} new game information
   */
  app.put("/v1/game/:id", async (req, res) => {
    if (!req.session.user) {
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
      } else if (game.won) {
        return res.status(201).send(game.state);
      } else if (!game.active) {
        return res.status(202).send(game.state);
      } else {
        const drawCnt = game.drawCount;
        const state = game.state.toJSON();
        let move = req.body;

        let newState = validateMove(drawCnt, state, move);
        let won = false;
        if (newState) {
          move = new app.models.Move({
            ...move,
            state: newState,
            game: req.params.id,
            date: Date.now(),
            user: req.session.user.username,
          });
          try {
            let query = {};
            const score = checkScore(move.src, move.dest);
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
                  score: game.score + score,
                },
              };
            } else {
              query = {
                $inc: { moves: 1 },
                $set: { state: newState, score: game.score + score },
              };
            }
            // Save game to user's document too
            await app.models.Game.findByIdAndUpdate(req.params.id, query);
            await move.save();
            if (won) {
              return res.status(201).send(newState);
            } else {
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

  /**
   * initiate auto complete for game
   *
   * @param (req.params.id} Id of game to update
   * @return {200} new game state after auto complete
   */
  app.get("/v1/game/auto/:id", async (req, res) => {
    if (!req.session.user) {
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
      } else if (game.won) {
        return res.status(201).send(game.state);
      } else {
        const drawCnt = game.drawCount;
        const state = game.state.toJSON();
        let moreAuto = true;
        let newState = state;
        let won = false;
        while (moreAuto != false) {
          const update = checkAutoMove(drawCnt, newState);
          if (update.length > 0 && update[1] != {}) {
            let move = update[0];
            newState = update[1];
            move = new app.models.Move({
              ...move,
              game: req.params.id,
              state: newState,
              date: Date.now(),
              user: req.session.user.username,
            });
            try {
              let query = {};
              const score = checkScore(move.src, move.dest);
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
                    score: game.score + score,
                  },
                };
              } else {
                query = {
                  $inc: { moves: 1 },
                  $set: { state: newState, score: game.score + score },
                };
              }
              // Save game to user's document too
              await app.models.Game.findByIdAndUpdate(req.params.id, query);
              await move.save();
              if (won) {
                return res.status(201).send(newState);
              }
            } catch (err) {
              console.log("Failed to save game state", err);
              return res.status(400).send({ error: "Failed updating game" });
            }
          } else {
            moreAuto = false;
          }
        }
        if (Object.keys(newState).length > 0)
          return res.status(200).send(newState);
        else return res.status(401).send({ error: "Failed auto completion" });
      }
    } catch (err) {
      console.log(`Game.get failure: ${err}`);
      res.status(404).send({ error: `unknown game: ${req.params.id}` });
    }
  });

  /**
   * get move information
   *
   * @param (req.params.id} Id of move to get
   * @return {200} move information
   */
  app.get("/v1/moves/:id", (req, res) => {
    app.models.Move.findOne({ _id: req.params.id })
      .then((moves) => {
        res.status(200).send({ state: moves.state });
      })
      .catch((err) => {
        console.log(`Move.get failure: ${err}`);
        res.status(404).send({ error: `unknown move: ${req.params.id}` });
      });
  });

  // Provide end-point to request shuffled deck of cards and initial state - for testing
  app.get("/v1/cards/shuffle", (req, res) => {
    res.send(shuffleCards(false));
  });
  app.get("/v1/cards/initial", (req, res) => {
    res.send(initialState());
  });
};
