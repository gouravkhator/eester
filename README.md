# Express EJS Starter Template

This is a short template, to pack EJS as templating engine, with Express and Mongoose to provide a basic starter package for building express webapps.

## Packed In House

* User Login/Logout/Register
* User session management
* Mongoose and User Models

## Prerequisites and Setup

* Run the below command to install the dependencies:

    ```sh
    npm i
    ```

* Setup the Mongodb database and add the database url in the `.env` file. Also add the session secret as some random session secret key to maintain the session:

    ```sh
    DATABASE_URL=mongodb+srv://<username>:<password>@cluster0.wtxus.mongodb.net/<dbname>?retryWrites=true&w=majority
    SESSION_SECRET=<session_secret>
    ```

    Place this `.env` file in the project root folder.

* Run the server:

    ```sh
    npm start
    ```

* Run the server in development mode:

    ```sh
    npm run dev
    ```

### Test Login

Email: `g@gmail.com` and Password: `goku`

## Future Improvements

* Third Party Authentication Providers like Google, Twitter, Facebook
* Error and flash message management
* Email verification via OTP over email
* Password and confirm password fields to be checked
* Lit Element to be used to make simple components for EJS
* CSRF protection
* User settings edit feature and user dashboard
* User image saving and showcasing
* Admin panel with MFA setup for admins
* Role management in ExpressJS
* Writing Tests for the API endpoints
