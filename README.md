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

* Remove generic params from being passed individually in render function. (As it is passed globally in server.js)
* reCaptcha checking while logging in
* Remember me checkbox while login, which will modify maxAge property of cookies.
* Third Party Authentication Providers like Google, Twitter, Facebook
* Edit functionality from the dashboard. 
* Password and confirm password fields to be checked
* Lit Element to be used to make simple components for EJS
* User image saving and showcasing
* Admin panel with MFA setup for admins
* Writing Tests for the API endpoints
* Remove user passing from every route as it is passed globally through middlewares.
* Make a short message code for AppError class, by slugifying the actual message, if the short message is not passed.
* Use HTTP2.

## To check and research

* Check if the req.app.set settings can be manipulated from client side.
* Check how to send proper headers for passport authentication via thunderclient or postman, for testing authentication. 

## Flow of error handling

Error should be thrown like next(err) or some error message, and while catching that error in routes, we can have AppError as the modified error of our app.

This will again call next(err) but now we handle that in handleErrors middleware.
