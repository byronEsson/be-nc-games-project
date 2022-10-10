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
          console.log(categories);
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
          expect(review).toEqual({
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
          });
        });
    });
    describe("Errors", () => {
      test("400: responds with error when id not of correct type", () => {
        return request(app)
          .get("/api/reviews/nan")
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("review_id must be a number");
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
});
