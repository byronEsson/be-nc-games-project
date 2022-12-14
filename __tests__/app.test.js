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
    describe("POST /api/categories", () => {
      test("201: responds with newly created category object", () => {
        const reqObj = {
          slug: "not slimy",
          description: "not the animal",
        };

        return request(app)
          .post("/api/categories")
          .send(reqObj)
          .expect(201)
          .then(({ body: { category } }) => {
            expect(category).toEqual({
              slug: "not slimy",
              description: "not the animal",
            });
          });
      });
      describe("Errors", () => {
        test("400: badly formatted request body", () => {
          const reqObj = {
            snail: "not slug",
            description: "it has a shell",
          };

          return request(app)
            .post("/api/categories")
            .send(reqObj)
            .expect(400)
            .then(({ body: { msg } }) => {
              expect(msg).toBe("Invalid request body - missing necessary keys");
            });
        });
      });
    });
  });
  describe("/reviews", () => {
    describe("GET /api/reviews", () => {
      test("200: responds with array of review objects sorted by date", () => {
        return request(app)
          .get("/api/reviews")
          .expect(200)
          .then(({ body: { reviews, total_count } }) => {
            expect(reviews).toBeSortedBy("created_at", { descending: true });
            expect(total_count).toBe(13);
            expect(
              reviews.forEach((review) => {
                expect(review).toEqual(
                  expect.objectContaining({
                    owner: expect.any(String),
                    title: expect.any(String),
                    review_id: expect.any(Number),
                    category: expect.any(String),
                    review_img_url: expect.any(String),
                    created_at: expect.any(String),
                    votes: expect.any(Number),
                    designer: expect.any(String),
                    comment_count: expect.any(Number),
                  })
                );
              })
            );
          });
      });
      test("200: should accept a category query to filter reviews by category", () => {
        return request(app)
          .get("/api/reviews?category=social+deduction")
          .expect(200)
          .then(({ body: { reviews, total_count } }) => {
            expect(total_count).toBe(11);
            expect(
              reviews.forEach((review) => {
                expect(review).toEqual(
                  expect.objectContaining({
                    category: "social deduction",
                  })
                );
              })
            );
          });
      });
      const columns = [
        "created_at",
        "owner",
        "title",
        "review_id",
        "category",
        "review_img_url",
        "votes",
        "designer",
        "comment_count",
      ];

      test.each(columns)("200: should accept sort_by query", (column) => {
        return request(app)
          .get(`/api/reviews?sort_by=${column}`)
          .expect(200)
          .then(({ body: { reviews } }) => {
            const spacesRemoved = reviews.map((review) => {
              const newReview = { ...review };
              if (isNaN(review[column])) {
                newReview[column] = newReview[column].replace(" ", "");
              }
              return newReview;
            });
            expect(spacesRemoved).toBeSortedBy(`${column}`, {
              descending: true,
            });
          });
      });
      test("200: should accept order query", () => {
        return request(app)
          .get("/api/reviews?order=asc")
          .expect(200)
          .then(({ body: { reviews } }) => {
            expect(reviews).toBeSortedBy("created_at", { ascending: true });
          });
      });
      test("200: queries can be used together", () => {
        return request(app)
          .get(
            "/api/reviews/?order=asc&sort_by=votes&category=social+deduction"
          )
          .expect(200)
          .then(({ body: { reviews } }) => {
            expect(reviews).toHaveLength(10);
            expect(reviews).toBeSortedBy("votes", { ascending: true });
            expect(
              reviews.forEach((review) => {
                expect(review).toEqual(
                  expect.objectContaining({
                    category: "social deduction",
                  })
                );
              })
            );
          });
      });
      describe("Errors", () => {
        test("404: responds with error when category does not exist", () => {
          return request(app)
            .get("/api/reviews?category=obscure+category")
            .expect(404)
            .then(({ body: { msg } }) => {
              expect(msg).toBe("No such category");
            });
        });
        test("200: should respond with empty array when category exists but has no reviews", () => {
          return request(app)
            .get("/api/reviews?category=children's+games")
            .expect(200)
            .then(({ body: { reviews } }) => {
              expect(reviews).toEqual([]);
            });
        });
      });
      describe("FEATURE pagination", () => {
        test("200: should accept a limit query", () => {
          return request(app)
            .get("/api/reviews?limit=5")
            .expect(200)
            .then(({ body: { reviews } }) => {
              expect(reviews).toHaveLength(5);
            });
        });
        test("200: should accept a page query when used with limit", () => {
          const firstPage = request(app).get(
            "/api/reviews?sort_by=review_id&limit=5&p=1"
          );

          const secondPage = request(app).get(
            "/api/reviews?sort_by=review_id&limit=5&p=2"
          );

          return Promise.all([firstPage, secondPage]).then(
            ([
              {
                body: { reviews: reviews1 },
              },
              {
                body: { reviews: reviews2 },
              },
            ]) => {
              expect(reviews1).not.toEqual(reviews2);
              expect(reviews1[0].review_id).toBe(13);
              expect(reviews2[0].review_id).toBe(8);
            }
          );
        });
        test("200: response object should have total count property", () => {
          return request(app)
            .get("/api/reviews?category=social+deduction")
            .expect(200)
            .then(({ body: { total_count } }) => {
              expect(total_count).toBe(11);
            });
        });
        describe("Errors", () => {
          test("400: when limit of incorrect datatype", () => {
            return request(app)
              .get("/api/reviews?limit=nan")
              .expect(400)
              .then(({ body: { msg } }) => {
                expect(msg).toBe("Incorrect datatype for limit");
              });
          });
          test("400: when page not of correct datatype", () => {
            return request(app)
              .get("/api/reviews?p=nan&limit=5")
              .expect(400)
              .then(({ body: { msg } }) => {
                expect(msg).toBe("Incorrect datatype for page");
              });
          });
          test("404: when page with no data", () => {
            return request(app)
              .get("/api/reviews?p=9999&limit=5")
              .expect(404)
              .then(({ body: { msg } }) => {
                expect(msg).toBe("No content found on p9999");
              });
          });
          test("200: total_count property ignores limit", () => {
            return request(app)
              .get("/api/reviews?category=social+deduction&limit=5")
              .expect(200)
              .then(({ body: { total_count } }) => {
                expect(total_count).toBe(11);
              });
          });
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
              expect(msg).toBe("Invalid request body - missing necessary keys");
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
      describe("FEATURE pagination", () => {
        test("200: should accept a limit query", () => {
          return request(app)
            .get("/api/reviews/2/comments?limit=2")
            .expect(200)
            .then(({ body: { comments } }) => {
              expect(comments).toHaveLength(2);
            });
        });
        test("200: should accept a page query", () => {
          const firstPage = request(app).get(
            "/api/reviews/2/comments?limit=1&p=1"
          );

          const secondPage = request(app).get(
            "/api/reviews/2/comments?limit=1&p=2"
          );

          return Promise.all([firstPage, secondPage]).then(
            ([
              {
                body: { comments: comments1 },
              },
              {
                body: { comments: comments2 },
              },
            ]) => {
              expect(comments1).not.toEqual(comments2);
              expect(comments1[0].comment_id).toBe(5);
              expect(comments2[0].comment_id).toBe(1);
            }
          );
        });
        test("200: response object should have total count property", () => {
          return request(app)
            .get("/api/reviews/2/comments")
            .expect(200)
            .then(({ body: { total_count } }) => {
              expect(total_count).toBe(3);
            });
        });
        describe("Errors", () => {
          test("400: when limit of incorrect datatype", () => {
            return request(app)
              .get("/api/reviews/2/comments?limit=nan")
              .expect(400)
              .then(({ body: { msg } }) => {
                expect(msg).toBe("Incorrect datatype for limit");
              });
          });
          test("400: when page not of correct datatype", () => {
            return request(app)
              .get("/api/reviews/2/comments?p=nan&limit=5")
              .expect(400)
              .then(({ body: { msg } }) => {
                expect(msg).toBe("Incorrect datatype for page");
              });
          });
          test("404: when page with no data", () => {
            return request(app)
              .get("/api/reviews/2/comments?p=9999&limit=5")
              .expect(404)
              .then(({ body: { msg } }) => {
                expect(msg).toBe("No comments found on p9999");
              });
          });
          test("200: total_count property ignores limit", () => {
            return request(app)
              .get("/api/reviews/2/comments?limit=1")
              .expect(200)
              .then(({ body: { total_count } }) => {
                expect(total_count).toBe(3);
              });
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
              expect(msg).toBe("Invalid request body - missing necessary keys");
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
    describe("POST /api/reviews", () => {
      test("201: should respond with newly created review", () => {
        const postObj = {
          owner: "mallionaire",
          title: "this is a review",
          review_body: "something about the game",
          designer: "Someone Really Cool",
          category: "dexterity",
        };

        return request(app)
          .post("/api/reviews")
          .send(postObj)
          .expect(201)
          .then(({ body: { review } }) => {
            expect(review).toEqual(
              expect.objectContaining({
                owner: "mallionaire",
                title: "this is a review",
                review_body: "something about the game",
                designer: "Someone Really Cool",
                category: "dexterity",
                review_id: 14,
                votes: 0,
                review_img_url:
                  "https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg",
                created_at: expect.any(String),
                comment_count: 0,
              })
            );
          });
      });
      describe("Errors", () => {
        test("400: when response object badly formatted", () => {
          return request(app)
            .post("/api/reviews")
            .send({})
            .expect(400)
            .then(({ body: { msg } }) => {
              expect(msg).toBe("Invalid request body - missing necessary keys");
            });
        });
        test("404: when user not in db", () => {
          const postObj = {
            owner: "notauser",
            title: "this is a review",
            review_body: "something about the game",
            designer: "Someone Really Cool",
            category: "dexterity",
          };

          return request(app)
            .post("/api/reviews")
            .send(postObj)
            .expect(404)
            .then(({ body: { msg } }) => {
              expect(msg).toBe("No content found for (owner)=(notauser)");
            });
        });
      });
    });
    describe("DELETE /api/reviews/:review_id", () => {
      test("204: should delete specified review", () => {
        return request(app)
          .delete("/api/reviews/1")
          .expect(204)
          .then(({ body }) => {
            expect(body).toEqual({});
          });
      });
      describe("Errors", () => {
        test("400: when id of incorrect type", () => {
          return request(app)
            .delete("/api/reviews/nan")
            .expect(400)
            .then(({ body: { msg } }) => {
              expect(msg).toBe("Incorrect datatype for review_id");
            });
        });
        test("404: responds with error when id not in db", () => {
          return request(app)
            .delete("/api/reviews/9999")
            .expect(404)
            .then(({ body: { msg } }) => {
              expect(msg).toBe("No review with that ID (9999)");
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
              expect(msg).toEqual("No content found for comment_id=9999");
            });
        });
      });
    });
    describe("PATCH /api/comments/:comment_id", () => {
      test("200: should increment votes by specified value", () => {
        const reqObj = { inc_votes: 2 };

        return request(app)
          .patch("/api/comments/1")
          .send(reqObj)
          .expect(200)
          .then(({ body: { comment } }) => {
            expect(comment).toEqual(
              expect.objectContaining({
                votes: 18,
              })
            );
          });
      });
      describe("Errors", () => {
        test("400: when incorrect datatype for id", () => {
          const reqObj = { inc_votes: 2 };

          return request(app)
            .patch("/api/comments/nan")
            .send(reqObj)
            .expect(400)
            .then(({ body: { msg } }) => {
              expect(msg).toBe("Incorrect datatype for comment_id");
            });
        });
        test("404: when comment does not exist", () => {
          const reqObj = { inc_votes: 2 };

          return request(app)
            .patch("/api/comments/9999")
            .send(reqObj)
            .expect(404)
            .then(({ body: { msg } }) => {
              expect(msg).toBe("No content found for comment_id=9999");
            });
          post;
        });
        test("400: when inc_votes incorrect datatype", () => {
          const reqObj = { inc_votes: "nan" };

          return request(app)
            .patch("/api/comments/1")
            .send(reqObj)
            .expect(400)
            .then(({ body: { msg } }) => {
              expect(msg).toBe("Incorrect datatype for inc_votes");
            });
        });
        test("400: when inc_votes missing", () => {
          return request(app)
            .patch("/api/comments/1")
            .send({})
            .expect(400)
            .then(({ body: { msg } }) => {
              expect(msg).toBe("Invalid request body - missing necessary keys");
            });
        });
      });
    });
  });
});
