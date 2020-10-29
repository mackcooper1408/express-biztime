const request = require("supertest");

const app = require("../app");
const db = require("../db");

let companyA;
let companyB;

beforeEach(async function () {
  await db.query(`DELETE FROM companies`);

  const resultA = await db.query(
    `INSERT INTO companies (code, name, description)
    VALUES ('test', 'Test Company', 'test description')
    RETURNING code, name`
  );
  companyA = resultA.rows[0];

  const resultB = await db.query(
    `INSERT INTO companies (code, name, description)
    VALUES ('test2', 'Test Company 2', 'test description 2')
    RETURNING code, name`
  );
  companyB = resultB.rows[0];
});

test("GET all company", async function () {
  let res = await request(app).get("/companies");
  expect(res.body).toEqual({
    companies: [
      companyA,
      companyB
    ]
  });
});


afterAll(async function () {
  await db.end();
});