const app = require("../app");
const request = require("supertest");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const data = require("../db/data/test-data");

beforeEach(() => {
  return seed(data);
});
afterAll(() => {
  db.end();
});

describe("/api", () => {
  describe("General Errors", () => {
    describe("404: Not Found", () => {
      test("404: response when given bad path", () => {
        return request(app)
          .get("/api/c")
          .expect(404)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("Route not found!");
          });
      });
    });
  });
  describe("GET /api/categories", () => {
    test("200: response object should have key of categories with an array as of correct category objects", () => {
      return request(app)
        .get("/api/categories")
        .expect(200)
        .then(({ body: { categories } }) => {
          expect(categories).toBeInstanceOf(Array);
          expect(categories.length).toBe(4);
          expect(
            categories.forEach((category) => {
              expect(category).toEqual(
                expect.objectContaining({
                  slug: expect.any(String),
                  description: expect.any(String),
                })
              );
            })
          );
        });
    });
  });
  describe("GET /api/reviews/:review_id", () => {
    test("200: respond with a review object", () => {
      return request(app)
        .get("/api/reviews/1")
        .expect(200)
        .then(({ body: { review } }) => {
          expect(review).toEqual(
            expect.objectContaining({
              review_id: 1,
              title: "Agricola",
              designer: "Uwe Rosenberg",
              owner: "mallionaire",
              review_img_url:
                "https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png",
              review_body: "Farmyard fun!",
              category: "euro game",
              created_at: expect.any(String), //highlighting this to sort out
              votes: 1,
            })
          );
        });
    });
    test("200: response object also contains comment_count", () => {
      return request(app)
        .get("/api/reviews/1")
        .expect(200)
        .then(({ body: { review } }) => {
          expect(review).toEqual(
            expect.objectContaining({
              comment_count: 0,
            })
          );
        });
    });
    describe("Errors", () => {
      test("400: responds with error when id not of correct type", () => {
        return request(app)
          .get("/api/reviews/nan")
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("Incorrect datatype for review_id");
          });
      });
      test("404: responds with error when id not in db", () => {
        return request(app)
          .get("/api/reviews/9999")
          .expect(404)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("No review with that ID (9999)");
          });
      });
    });
  });
  describe("GET /api/users", () => {
    test("200: response object should have key of users with array of user objects", () => {
      return request(app)
        .get("/api/users")
        .expect(200)
        .then(({ body: { users } }) => {
          expect(users.length).toBe(4);
          expect(
            users.forEach((user) => {
              expect(user).toEqual(
                expect.objectContaining({
                  username: expect.any(String),
                  name: expect.any(String),
                  avatar_url: expect.any(String),
                })
              );
            })
          );
        });
    });
  });
  describe("PATCH api/reviews/:review_id", () => {
    test("200: responds with updated review object", () => {
      const reqObj = { inc_votes: 2 };

      return request(app)
        .patch("/api/reviews/1")
        .send(reqObj)
        .expect(200)
        .then(({ body: { review } }) => {
          expect(review).toEqual({
            review_id: 1,
            title: "Agricola",
            designer: "Uwe Rosenberg",
            owner: "mallionaire",
            review_img_url:
              "https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png",
            review_body: "Farmyard fun!",
            category: "euro game",
            created_at: expect.any(String),
            votes: 3,
          });
        });
    });
    describe("Errors", () => {
      test("400: responds with error when inc_votes of wrong type", () => {
        const reqObj = { inc_votes: "nan" };

        return request(app)
          .patch("/api/reviews/1")
          .send(reqObj)
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("Incorrect datatype for inc_votes");
          });
      });
      test("400: responds with error when object formatted incorrectly", () => {
        const reqObj = { not_inc_votes: 2 };

        return request(app)
          .patch("/api/reviews/1")
          .send(reqObj)
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).toBe(
              "Was expecting request object of the form {inc_votes: <integer>}"
            );
          });
      });
      test("400: when passed id of invalid type", () => {
        const reqObj = { inc_votes: 2 };

        return request(app)
          .patch("/api/reviews/nn")
          .send(reqObj)
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("Incorrect datatype for review_id");
          });
      });
      test("404: when passed id not in db", () => {
        const reqObj = { inc_votes: 2 };

        return request(app)
          .patch("/api/reviews/99999")
          .send(reqObj)
          .expect(404)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("No review with that ID");
          });
      });
    });
  });
  //   describe("GET /api/reviews", () => {
  //     test("200: responds with array of review objects", () => {
  //       return request(app)
  //         .get("/api/reviews")
  //         .expect(200)
  //         .then(({ body: { reviews } }) => {
  //           expect(reviews.length).toBe(12);
  //           expect(
  //             reviews.forEach((review) => {
  //               expect.objectContaining({
  //                 owner: expect.any(String),
  //                 title: expect.any(String),
  //                 review_id: expect.any(Number),
  //                 category: expect.any(String),
  //                 review_img_url: expect.any(String),
  //                 created_at: expect.any(String),
  //                 votes: expect.any(Number),
  //                 designer: expect.any(String),
  //                 comment_count: expect.any(String),
  //               });
  //             })
  //           );
  //         });
  //     });
  //   });
  describe("GET /api/reviews/:review_id/comments", () => {
    test("200: should respond with array of comments objects", () => {
      return request(app)
        .get("/api/reviews/2/comments")
        .expect(200)
        .then(({ body: { comments } }) => {
          expect(comments).toHaveLength(3);
          console.log(comments[0]);
          expect(
            comments.forEach((comment) => {
              expect(comment).toEqual(
                expect.objectContaining({
                  comment_id: expect.any(Number),
                  votes: expect.any(Number),
                  created_at: expect.any(String),
                  author: expect.any(String),
                  body: expect.any(String),
                  review_id: expect.any(Number),
                })
              );
            })
          );
        });
    });
    describe("Errors", () => {
      test("400: should respond with error when review_id of incorrect type", () => {
        return request(app)
          .get("/api/reviews/nan/comments")
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("Incorrect datatype for review_id");
          });
      });
      test("404: should respond with an error when no reviews with that id", () => {
        return request(app)
          .get("/api/reviews/9999/comments")
          .expect(404)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("No review with that ID (9999)");
          });
      });
      test("200: should respond with empty object when review has no comments", () => {
        return request(app)
          .get("/api/reviews/1/comments")
          .expect(200)
          .then(({ body: { comments } }) => {
            expect(comments).toEqual([]);
          });
      });
    });
  });
});
