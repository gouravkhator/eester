# Express EJS Starter Template

This is a short template, to pack EJS as templating engine, with Express and Mongoose to provide a basic starter package for building express webapps.

## Packed In House

* User Login/Logout/Register
* User session management
* Mongoose and User Models
* Role based management
* Admin section
* CSRF protection using SameSite header field, consistently sent by server in Response headers.

    We don't need a CSRF token, as SameSite header cannot be manipulated at client end. Server consistently sends the SameSite header.

* Email verification via OTP over email
* Error management along with HTTP status codes.

## Prerequisites and Setup

* Run the below command to install the dependencies:

    ```bash
    npm i
    ```

* Setup the Mongodb database and add the database url in the `.env` file. Also add the session secret as some random session secret key to maintain the session. 

    The sample file for referring to what the `.env` file might look like, is present as `.env.sample` 
    
    Place this `.env` file in the project root folder.

* Run the server:

    ```bash
    npm start
    ```

* Run the server in development mode:

    ```bash
    npm run dev
    ```

### Test Login

Admin:
```
Email: g@gmail.com
Password: goku
User id: 61ddabadcbf7e4e33947e893
```

Non-admin:
```
Email: domap29001@unigeol.com
Password: goku
User id: 61decad85a1cda890151673f
```

## Future Improvements

* Create a link and send that link for verification, instead of the manual otp, and have a timer for the expiration of that link..
* reCaptcha checking while logging in
* Remember me checkbox while login, which will modify maxAge property of cookies.
* Third Party Authentication Providers like Google, Twitter, Facebook
* Edit functionality from the dashboard.
* Password and confirm password fields to be checked and validated.
* Lit Element to be used to make simple components for EJS.
* User profile pic saving in database and doing CRUD operations on it.
* Add MFA to the admin page for improving security
* Writing Mocha Tests for the API endpoints
* Make a short message code for AppError class, by slugifying the actual message, if the short message is not passed.
* Use HTTP2.

## To check and research

* Check if the req.app.set settings can be manipulated from client side.
* Check how to send proper headers for passport authentication via thunderclient or postman, for testing authentication. 

## Flow of error handling

In any models or other utils, we should throw errors either like next(err) in mongoose hooks, or some error message directly. While catching that error in routes, we can have AppError handle the errors, and throw AppError, as the modified error of our app.

This will again call next(err) in the routes, but now this err will mostly be instance of AppError, and now we can handle that err in handleErrors middleware. This handleErrors middleware runs as the last middlware for every request.
