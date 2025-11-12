# SocialEvents - Server

### API Base URL: [https://b12-a10-future-box-server.vercel.app](https://www.google.com/search?q=https://b12-a10-future-box-server.vercel.app)

-----

## Project Purpose

This repository contains the complete backend server for the **SocialEvents** platform. Built with Node.js, Express.js, and MongoDB, this server provides a secure RESTful API that handles all business logic. Its core responsibilities include managing event data, handling user authentication via JWT, and processing all event creation, update, and join requests from the client application.

-----

## Key Features

  * **Secure API Endpoints**: All private routes (create, update, delete, join) are protected using JWT verification. The server uses the **Firebase Admin SDK** to validate tokens on every protected request.
  * **MongoDB Integration**: Connects to a MongoDB database to handle all data persistence for the main `events` collection and the `joinedEvents` collection.
  * **RESTful API for Events**: Provides a full CRUD (Create, Read, Update, Delete) API for managing social service events.
  * **Ownership Verification**: All `update` and `delete` operations include server-side logic to ensure a user can *only* modify or delete events they personally created.
  * **Backend Search & Filter**: Implements backend-driven search (by event name) and filtering (by event type) using MongoDB query operators, as required by the project specifications.
  * **Dynamic Event Filtering**: The main `/api/events/upcoming` endpoint dynamically queries the database to filter out any events where the date has already passed, ensuring only future events are sent to the client.
  * **Event Joining Logic**: Manages a separate collection for joined events, including logic to prevent a user from joining the same event twice.
  * **Date-Sorted Results**: The API route for fetching a user's joined events (`/api/joined-events`) automatically sorts the results by the event date in ascending order.
  * **Vercel Deployment**: Configured with a `vercel.json` file for seamless server-side deployment on Vercel, as recommended by the project requirements.

-----

## NPM Packages Used

This project was built using the following key npm packages:

  * **`express`**: The core framework for building the Node.js server and defining API routes.
  * **`mongodb`**: The official MongoDB driver for connecting to and interacting with the database.
  * **`cors`**: For enabling Cross-Origin Resource Sharing, allowing the client (on Netlify) to communicate with the server (on Vercel).
  * **`firebase-admin`**: Used for verifying the integrity of user JWTs sent from the client, securing all private API endpoints.
  * **`dotenv`**: For managing all secret keys (database credentials, Firebase service key) as environment variables.
