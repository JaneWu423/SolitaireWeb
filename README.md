# CS 4288: Web-based System Architecture 
## Programming Assignment 5

## Overview

For this assignment you are going to add game-play logic and actions to your application.  The end result of this assignment is that a player should be able to register, start a game, play only valid moves in the game according to the rules.  You do not need to recognize the end of a game (either winning or running out of moves).


## Let the User Move a Card (20pts + 2x5pt bonuses)

In an earlier assignment you enabled users to physically move a card, but there was no game structure at that point.  Now you must allow the user to play the game by moving one or more cards at a time.  For example, here are some valid moves according to the game's rules (not an exhaustive list):
 
 * From one of the seven tableau piles to another of the seven tableau piles (one or more cards)
 * From one of the seven tableau piles to one of the four foundation stacks (one card)
 * From one of the four foundations to one of the seven tableau piles (one card)
 * From the waste pile to one of the seven tableau piles (one card)
 * From the waste pile to one of the four foundations (one card)
 * From the talon pile to the waste pile (1 or 3 cards)
 
The simplest way of approaching this is to maintain some state in the client.  The user clicks some card once to select it (and the cards below it in a pile) and then clicks another card to identify where the card is to be moved.  The user should not be able to click a card that is face-down, except in the talon pile.  The talon pile also is different in that a single click on the talon pile is a request to draw cards.  No second click is necessary.  If in doubt, follow the rules of the game from the Wiki page.
 
We can capture the requested move in JSON as follows:

```{ cards: [{"suit": "clubs", "value": 7}, ...], src: "pile1", dst: "stack2" }```

You must just print out this structure to the client's console for the requested move in order to get these points.  You will also need to send this structure to the server, outlined below.

If the user clicks on the background (i.e. not on any card), any state relating to the move should be reset.

***5 BONUS pts***: In addition to the two-click method, allow the user to drag-and-drop card(s) from the source to the destination. 

***5 BONUS pts***: Two things: First, on the first click visually highlight the card(s) that are being selected.  Second, once one or more cards have been selected, pressing the 'ESC' key or clicking on any face-down card will deselect the cards, removing the highlighting.


## Validate Moves (50pts)

For this block of points you must implement a server-side function that implements the core game-play logic.  Here is a possible starting point of what I am looking for:
  
```
let validateMove = async (currentState, requestedMove) => {
    ...
    /* return error or new state */
};
```  

It takes the current game state and the move being requested by the user and validates it against the current state and the rules of the game.  This will be used in the functionality described below.

## Send the Move Request (30pts)

Now that our clients are generating move JSONs, and we have some means of knowing if they are valid or not, we need to bring it all together.  You will need to enhance your React-based client with the following capabilities:

* After the user has clicked enough to generate the move JSON (see above), execute an AJAX PUT to /v1/game/:gameID with the JSON data for the move

* The server-side must have a route handler that receives this request.  It must validate that the user is logged in and is the owner of the game.  You must add this handler - follow the norms already established in the code.

* Finally, we have to make sure the move is valid.  So call _validateMove_ with game's state info from the DB and the requested move from the client.  The function should either return the new valid game state or an error.

* If the requested move is not valid, send an appropriate error back to the client

* If the move is valid, update the state recorded into the DB, save the executed move to the DB, and send success and the new state back to the client

* If the client receives an error from the server, restore the visual state to match the valid prior state

* If the client receives success from the server, update the visual state to match the send new state

The end result of all of this work is that a player should be able to play a game through until its completion.

## Grading Criteria:

Point totals for each criterion are listed above.  Meet the description above, and you get all the points.  As functionality isn't working, visual styling is not as desired, or things are simply missing, points will be deducted.

At this point you need to support all the rules of the game.

## Submission:

Ensure your files are in a clean and organized folder hierarchy.  Make sure your package.json is complete and up-to-date.  Commit all necessary files (not node_modules) to your GitHub repository.  Grading will follow the same script as last assignment:

* Clone student's repo
* Run ```npm install``` and all dependencies are installed
* Run ```npm run build``` and the full client is run through webpack
* Adjust config.json to their MongoDB setup
* Run ```npm run start``` and the web app is running
* Navigate to [http://localhost:8080](http://localhost:8080) and the grader is on the landing page

Your repo must be compliant with these steps.  It is easy to practice this on your local machine to ensure you have everything in the right place.

## General Server-Side Requirements
 
 * All data must be stored into the MongoDB
 
 * All server-side routines interacting with the DB must have good error management and reporting
 
 * All data stored in the database must be validated and cleansed of any possible script injections
  
 
 ## Testing Code - Useful, but different
 
 * Github Actions are not required for this assignment, but I have provided the testing code from prior assignments to help in your development.