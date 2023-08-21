# social-network-api

- GitHub repo: [github.com/benjstorlie/social-network-api](https://github.com/benjstorlie/social-network-api)

## Video Demo

[Link to video demo](https://drive.google.com/file/d/1r4rxXk9Z93elrZ-YH1S8QTKEiVPRwJR3/view)

## User Story

```md
AS A social media startup
I WANT an API for my social network that uses a NoSQL database
SO THAT my website can handle large amounts of unstructured data
```

## Acceptance Criteria

```md
GIVEN a social network API
WHEN I enter the command to invoke the application
THEN my server is started and the Mongoose models are synced to the MongoDB database
WHEN I open API GET routes in Insomnia for users and thoughts
THEN the data for each of these routes is displayed in a formatted JSON
WHEN I test API POST, PUT, and DELETE routes in Insomnia
THEN I am able to successfully create, update, and delete users and thoughts in my database
WHEN I test API POST and DELETE routes in Insomnia
THEN I am able to successfully create and delete reactions to thoughts and add and remove friends to a user’s friend list
```

## Comments

1. My particular focus for this project was have appropriate JSDoc comments for the routes. I like to be able to explicitly define the parameters for the request, and I could include the url and example data as well. This way, the code where all the routes added to the express router fits on the screen, but you can mouse over each function.

2. My other focus was trying to add helpful error messages, though I did not complete this as much as I'd like. It doesn't show on the video, because there are just too many different errors.

3. Bug: The Reactions have a few ids. There's the `reactionId`, defined in the model, and there is also both `id` and `_id` which are identical.