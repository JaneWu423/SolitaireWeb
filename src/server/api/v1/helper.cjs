const { checkSuit, precedes } = require("../../../shared/index.cjs");

// helper for checks for game rules

// check stack for legal move
const checkStack = (stack, cards) => {
  if (cards.length === 1) {
    if (stack.length == 0 && cards[0].value == "ace") {
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

// check pile for legal move
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

// check if move is legal
const checkMove = (state, cards, src, dest, drawCnt) => {
  if (dest === "draw") return false;
  if (dest.startsWith("stack")) {
    return checkStack(state[dest], cards);
  }
  if (dest.startsWith("pile")) {
    return checkPile(state[dest], cards);
  }
  if (dest === "discard") {
    return src === "draw" && cards.length <= drawCnt;
  }
  return true;
};

// validate current move
const validateMove = (drawCnt, state, move) => {
  const src = move.src;
  const dest = move.dest;
  const cards = move.cards;
  if (checkMove(state, cards, src, dest, drawCnt)) {
    let newSrc = [],
      newDest = [];
    if (src === "draw" && state[src].length == 0) {
      newSrc = state.discard;
      newSrc.map((card) => (card.up = false));
      newSrc.reverse();
      newDest = [];
    } else {
      move.cards.map((card) => (card.up = true));
      const moveCards =
        drawCnt === 3 && dest === "discard" ? move.cards.reverse() : move.cards;
      newDest =
        state[dest].length === 0 ? moveCards : [...state[dest], ...moveCards];
      newSrc = state[src].slice(0, -moveCards.length);
      if (newSrc.length > 0 && src !== "draw") newSrc.slice(-1)[0].up = true;
    }

    const newState = {
      ...state,
      [src]: newSrc,
      [dest]: newDest,
    };

    return newState;
  }
  return false;
};

// check if there is any possible automove
const checkAutoMove = (drawCnt, state) => {
  for (let i = 1; i < 5; i++) {
    const stack = state[`stack${i}`];
    if (stack.length > 0) {
      const card = stack[stack.length - 1];
      for (let j = 1; j < 8; j++) {
        const pile = state[`pile${j}`];
        if (pile.length > 0) {
          const pileCard = pile[pile.length - 1];
          if (card.suit == pileCard.suit && precedes(card, pileCard)) {
            let move = {
              src: `pile${j}`,
              dest: `stack${i}`,
              cards: [pileCard],
            };
            let newState = validateMove(drawCnt, state, move);
            return [move, newState];
          }
        }
      }
    } else {
      for (let j = 1; j < 8; j++) {
        const pile = state[`pile${j}`];
        if (pile.length > 0 && pile[pile.length - 1].value === "ace") {
          const pileCard = pile[pile.length - 1];
          let move = {
            src: `pile${j}`,
            dest: `stack${i}`,
            cards: [pileCard],
          };
          let newState = validateMove(drawCnt, state, move);
          return [move, newState];
        }
      }
    }
  }
  return [];
};

//  calculate corresponding points for each move
const checkScore = (src, dest) => {
  if (src.startsWith("pile") || dest.startsWith("stack")) return 10;
  else if (src.startsWith("stack") && dest.startsWith("pile")) return -15;
  else if (src.startsWith("discard") && dest.startsWith("pile")) return 5;
  else if (src.startsWith("pile")) return 5;
  else if (src.startsWith("draw")) return -1;
  else return 0;
};

module.exports = {
  checkScore: checkScore,
  checkAutoMove: checkAutoMove,
  validateMove: validateMove,
};
