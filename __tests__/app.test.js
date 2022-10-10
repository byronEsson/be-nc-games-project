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
  describe("/api/categories", () => {
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
