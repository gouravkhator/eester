# Eester - Express EJS Starter Template

This is a short template, to pack EJS as templating engine, with Express and Mongoose to provide a basic starter package for building express webapps.

## Prerequisites and Setup

* Run the below command to install the dependencies:

    ```bash
    npm i
    ```

* Setup the Mongodb database and add the database url in the `.env` file. Also add the session secret as some random session secret key to maintain the session. 

    The sample file for referring to what the `.env` file might look like, is present as `.env.sample` 
    
    Place this `.env` file in the project root's `src` folder.

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

## Checklist 

* [x] User Login/Logout/Register
* [x] User session management
* [x] Mongoose and User Models
* [x] Role based management
* [x] Admin section
* [x] CSRF protection using SameSite header field, consistently sent by server in Response headers.

    > We don't need a CSRF token, as SameSite header cannot be manipulated at client end. Server consistently sends the SameSite header.

* [x] Email verification via OTP over email
* [x] Error management along with HTTP status codes.
* [ ] JWT tokens instead of session id for authentication, and use one server for auth and another for the api, to provide scalability.
* [ ] Create a link and send that link for verification, instead of the manual otp, and have a timer for the expiration of that link..
* [ ] reCaptcha checking while logging in
* [ ] Remember me checkbox while login, which will modify maxAge property of cookies.
* [ ] Third Party Authentication Providers like Google, Twitter, Facebook
* [ ] Edit functionality from the dashboard.
* [ ] Password and confirm password fields to be checked and validated.
* [ ] Lit Element to be used to make simple components for EJS.
* [ ] User profile pic saving in database and doing CRUD operations on it.
* [ ] Add MFA to the admin page for improving security
* [ ] Write Mocha Tests for the API endpoints.
* [ ] Make a short message code for AppError class, by slugifying the actual message, if the short message is not passed.
* [ ] Use HTTP2.
* [ ] Make an NPM package out of this repo, to generate this template with whatever options are being provided in the cli arguments.

## Project Structure

> Credit goes to [geshan's expressjs-structure](https://github.com/geshan/expressjs-structure). I also created the similar file structure layout within my implemented code.

The main article for organizing the project structure is given [here](https://blog.logrocket.com/organizing-express-js-project-structure-better-productivity/).

**Folders and their functions:**
* `src/controllers`: Controllers control the request and response that goes in and out, to and from the route. They are like utils to the routes.
* `src/middlewares`: Here we store middlewares, which behave like helper middlewares to the controllers and other requests.
* `src/models`: Models are user schema with all ODM/ORM related methods.
* `src/public`: Public folder encompasses the styles, client-side javascripts, and images, that will be used client-side. 
* `src/routes`: Routes will contain the created express router, and those routes uses controllers for managing their requests and response flow.
* `src/services`: Services contain necessary methods for different phases of the app.

    Example: Connecting to a db, or initializing authentication, or doing cleans up at the end.

* `src/utils`: Utilities and helpers required throughout the app.
* `src/views`: Views contain the ejs files for rendering on page, with content passed from the server.
* `test/`: Refer the below image.

    ![Test Folder Structure](https://blog.logrocket.com/wp-content/uploads/2022/01/Express-test-folder-structure.png)

    As you can see, ***tests for each unit of the src folder, will be created in the same structure in test folder..***

## Flow of error handling in this template

In any models or other utils, we should throw errors either like next(err) in mongoose hooks, or some error message directly. While catching that error in routes, we can have AppError handle the errors, and throw AppError, as the modified error of our app.

This will again call next(err) in the routes, but now this err will mostly be instance of AppError, and now we can handle that err in handleErrors middleware. This handleErrors middleware runs as the last middlware for every request.
