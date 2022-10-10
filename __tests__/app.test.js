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
  describe("/api/categories", () => {
    test("200: response object should have key of objects with an array as value", () => {
      return request(app)
        .get("/api/categories")
        .expect(200)
        .then(({ body: { categories } }) => {
          expect(categories).toBeInstanceOf(Array);
        });
    });
    test("200: array should have contain all categories", () => {
      return request(app)
        .get("/api/categories")
        .expect(200)
        .then(({ body: { categories } }) => {
          expect(categories.length).toBe(4);
        });
    });
    test("200: returned objects have correct keys", () => {
      return request(app)
        .get("/api/categories")
        .expect(200)
        .then(({ body: { categories } }) => {
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
