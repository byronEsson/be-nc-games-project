## Byron's Backend Project

https://byrons-backend-project.herokuapp.com/

This is a solo project completed during my time at Northcoders.

I have built an API in order to practise the methods used to build a real world backend service and will use this in my front-end project on this course. In order to interact with this API please follow the link at the top of this README and navigate to the enpoint /api to get an overview of all available endpoints.

### To Use This Repo

In order to use this repo you will need to clone it to your device by entering the following to your terminal:

```
git clone https://github.com/byronEsson/be-nc-games-project.git
```

To install dependencies, run `npm install`.

### Databases

The data used in this project are found in `/db/data`. To seed this data you will first need to create two separate .env files, `.env.test` and `.env.development` in the root of this repo. Into each, add `PGDATABASE=<database_name_here>`, with the correct database name for that environment (see `/db/setup.sql` for the database names). Add these filenames to the .gitignore file to ensure they aren't pushed to GitHub.

Run `npm setup-dbs` to create the SQL databases followed by `npm seed` to seed the `devlopment` data.

### Testing

Tests are run with the command `npm test` or `npm t` to run all commands or append the file name of the test suite to run only that. Test suites and their files are found in the `__tests__` folder.

The file `app.tests.js` will reseed the `test_data` before each test is run so you are not required to do it manually, and the effects of previous tests will not need to be considered for future ones.

The tests make use of [jest](https://www.npmjs.com/package/supertest), [jest-sorted](https://www.npmjs.com/package/jest-sorted/v/1.0.14) and [supertest](https://www.npmjs.com/package/jest) libraries.

#### Versions

`Node.js`: v18.7.0
`PostgreSQL`: v14.5
