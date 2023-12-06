import { checkSuit, precedes } from "../../shared/index.cjs";

export const checkPile2Stack = (state) => {
  for (let i = 1; i < 5; i++) {
    const stack = state[`stack${i}`];
    if (stack.length > 0) {
      const card = stack[stack.length - 1];
      for (let j = 1; j < 8; j++) {
        const pile = state[`pile${j}`];
        if (pile.length > 0) {
          const pileCard = pile[pile.length - 1];
          if (pileCard.suit === card.suit && precedes(card, pileCard)) {
            return true;
          }
        }
      }
    } else {
      for (let j = 1; j < 8; j++) {
        const pile = state[`pile${j}`];
        if (pile.length > 0 && pile[pile.length - 1].value === "ace") {
          return true;
        }
      }
    }
  }
  return false;
};

const checkPile2Pile = (state) => {
  for (let i = 1; i < 8; i++) {
    const pile = state[`pile${i}`];
    if (pile.length > 0) {
      const index = pile.findIndex((card) => card.up === true);
      if (index !== 0) {
        const card = pile[index];
        for (let j = 1; j < 8; j++) {
          if (i !== j) {
            const otherPile = state[`pile${j}`];
            if (otherPile.length > 0) {
              const otherCard = otherPile[otherPile.length - 1];
              if (
                checkSuit(card, otherCard) &&
                precedes(card, otherCard) &&
                otherCard.up
              ) {
                return true;
              }
            } else {
              if (card.value === "king") {
                return true;
              }
            }
          }
        }
      }
    }
  }
  return false;
};

const checkDiscard2Pile = (state, drawCnt) => {
  if (drawCnt === 3) {
    let discard = [...state.discard];
    discard == discard.reverse();
    for (let i = 0; i < discard.length; ++i) {
      if (i % 3 == 0) {
        const card = discard[i];
        for (let j = 1; j < 8; j++) {
          const pile = state[`pile${j}`];
          if (pile.length > 0) {
            const pileCard = pile[pile.length - 1];
            if (checkSuit(pileCard, card) && precedes(card, pileCard)) {
              return true;
            }
          } else {
            if (card.value === "king") {
              return true;
            }
          }
        }
      }
    }
  } else {
    let discard = [...state.draw, ...state.discard];
    for (let i = 0; i < discard.length; i++) {
      const card = discard[i];
      for (let j = 1; j < 8; j++) {
        const pile = state[`pile${j}`];
        if (pile.length > 0) {
          const pileCard = pile[pile.length - 1];
          if (checkSuit(pileCard, card) && precedes(card, pileCard)) {
            return true;
          }
        } else {
          if (card.value === "king") {
            return true;
          }
        }
      }
    }
  }
  return false;
};

const checkDiscard2Stack = (state, drawCnt) => {
  if (drawCnt === 3) {
    let discard = [...state.discard];
    discard == discard.reverse();
    for (let i = 0; i < discard.length; ++i) {
      if (i % 3 == 0) {
        const card = discard[i];
        for (let j = 1; j < 5; j++) {
          const stack = state[`stack${j}`];
          if (stack.length > 0) {
            const stackCard = stack[stack.length - 1];
            if (stackCard.suit == card.suit && precedes(stackCard, card)) {
              return true;
            }
          } else {
            if (card.value === "ace") {
              return true;
            }
          }
        }
      }
    }
  } else {
    let discard = [...state.draw, ...state.discard];
    for (let i = 0; i < discard.length; i++) {
      const card = discard[i];
      for (let j = 1; j < 5; j++) {
        const stack = state[`stack${j}`];
        if (stack.length > 0) {
          const stackCard = stack[stack.length - 1];
          if (stackCard.suit == card.suit && precedes(stackCard, card)) {
            return true;
          }
        } else {
          if (card.value === "ace") {
            return true;
          }
        }
      }
    }
  }
  return false;
};

const checkAllUp = (state) => {
  for (let i = 1; i < 8; i++) {
    const pile = state[`pile${i}`];
    if (pile.length > 0) {
      const index = pile.findIndex((card) => card.up === false);
      if (index !== -1) {
        return false;
      }
    }
  }
  return true;
};

export const checkNoMoves = (state, drawcnt) => {
  if (
    !checkAllUp(state) &&
    !checkDiscard2Pile(state, drawcnt) &&
    !checkPile2Pile(state) &&
    !checkDiscard2Stack(state, drawcnt)
  ) {
    return true;
  }
  return false;
};
