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
  test("200: responds with object of available endpoints", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body: { endpoints } }) => {
        expect(endpoints).toEqual(
          expect.objectContaining({
            "GET /api": expect.any(Object),
            "GET /api/reviews": expect.any(Object),
            "GET /api/reviews/:review_id": expect.any(Object),
            "PATCH /api/reviews/:review_id": expect.any(Object),
            "GET /api/reviews/:review_id/comments": expect.any(Object),
            "POST /api/reviews/:review_id/comments": expect.any(Object),
            "GET /api/users": expect.any(Object),
            "DELETE /api/comments/:comment_id": expect.any(Object),
          })
        );
      });
  });
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
  describe("/categories", () => {
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
  });
  describe("/reviews", () => {
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
              expect(msg).toBe("Invalid post body - missing necessary keys");
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
    describe("GET /api/reviews/:review_id/comments", () => {
      test("200: should respond with array of comments objects sorted by date", () => {
        return request(app)
          .get("/api/reviews/2/comments")
          .expect(200)
          .then(({ body: { comments } }) => {
            expect(comments).toHaveLength(3);
            expect(comments).toBeSortedBy("created_at", { descending: true });
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
        test("200: should respond with empty array when review has no comments", () => {
          return request(app)
            .get("/api/reviews/1/comments")
            .expect(200)
            .then(({ body: { comments } }) => {
              expect(comments).toEqual([]);
            });
        });
      });
    });
    describe("POST /api/reviews/review_id/comments", () => {
      test("201: should respond with new comment object", () => {
        const postObj = {
          username: "mallionaire",
          comment: "something about games",
        };

        return request(app)
          .post("/api/reviews/1/comments")
          .send(postObj)
          .expect(201)
          .then(({ body: { comment } }) => {
            expect(comment).toEqual(
              expect.objectContaining({
                comment_id: 7,
                author: "mallionaire",
                votes: 0,
                body: "something about games",
                review_id: 1,
                created_at: expect.any(String),
              })
            );
          });
      });
      describe("Errors", () => {
        test("400: responds with error when properties missing", () => {
          const postObj = {};

          return request(app)
            .post("/api/reviews/1/comments")
            .send(postObj)
            .expect(400)
            .then(({ body: { msg } }) => {
              expect(msg).toBe("Invalid post body - missing necessary keys");
            });
        });
        test("400: when username not a valid user", () => {
          const postObj = {
            username: "notAUser",
            comment: "something about games",
          };
          return request(app)
            .post("/api/reviews/1/comments")
            .send(postObj)
            .expect(404)
            .then(({ body: { msg } }) => {
              expect(msg).toBe("No content found for (author)=(notAUser)");
            });
        });
        test("400: when id not of correct type", () => {
          const postObj = {
            username: "mallionaire",
            comment: "something about games",
          };
          return request(app)
            .post("/api/reviews/nan/comments")
            .send(postObj)
            .expect(400)
            .then(({ body: { msg } }) => {
              expect(msg).toBe("Incorrect datatype for review_id");
            });
        });
        test("404: when id does not exist", () => {
          const postObj = {
            username: "mallionaire",
            comment: "something about games",
          };
          return request(app)
            .post("/api/reviews/9999/comments")
            .send(postObj)
            .expect(404)
            .then(({ body: { msg } }) => {
              expect(msg).toBe("No content found for (review_id)=(9999)");
            });
        });
      });
    });
  });
  describe("/users", () => {
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
    describe("GET /api/users/:username", () => {
      test("200: should respond with single user object", () => {
        return request(app)
          .get("/api/users/mallionaire")
          .expect(200)
          .then(({ body: { user } }) => {
            expect(user).toEqual({
              username: "mallionaire",
              name: "haz",
              avatar_url:
                "https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg",
            });
          });
      });
      describe("Errors", () => {
        test("404: when no user with that username", () => {
          return request(app)
            .get("/api/users/notauser")
            .expect(404)
            .then(({ body: { msg } }) => {
              expect(msg).toBe("No user with that username");
            });
        });
      });
    });
  });
  describe("/comments", () => {
    describe("DELETE /api/comments/:comment_id", () => {
      test("204: should delete specified comment ", () => {
        return request(app)
          .delete("/api/comments/4")
          .expect(204)
          .then(({ body }) => {
            expect(body).toEqual({});
          });
      });
      describe("Errors", () => {
        test("400: when invalid comment id", () => {
          return request(app)
            .delete("/api/comments/nan")
            .expect(400)
            .then(({ body: { msg } }) => {
              expect(msg).toEqual("Incorrect datatype for comment_id");
            });
        });
        test("404: when no comment with that id in db", () => {
          return request(app)
            .delete("/api/comments/9999")
            .expect(404)
            .then(({ body: { msg } }) => {
              expect(msg).toEqual("No content found for (comment_id)=(9999)");
            });
        });
      });
    });
  });
});
