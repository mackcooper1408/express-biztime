const request = require("supertest");

const app = require("../app");
const db = require("../db");

let companyA;
let companyB;

let invoice1;
let invoice2;

beforeEach(async function () {
  await db.query(`DELETE FROM companies`);
  await db.query(`DELETE FROM invoices`);

  const cResultA = await db.query(
    `INSERT INTO companies (code, name, description)
    VALUES ('test', 'Test Company', 'test description')
    RETURNING *`
  );
  companyA = cResultA.rows[0];

  const cResultB = await db.query(
    `INSERT INTO companies (code, name, description)
    VALUES ('test2', 'Test Company 2', 'test description 2')
    RETURNING *`
  );
  companyB = cResultB.rows[0];

  // const iResultA = await db.query(
  //   `INSERT INTO invoices (comp_code, amt)
  //   VALUES ('test', 100)
  //   RETURNING *`
  // );
  // invoice1 = iResultA.rows[0];

  // const iResultB = await db.query(
  //   `INSERT INTO invoices (comp_code, amt)
  //   VALUES ('test', 200)
  //   RETURNING *`
  // );
  // invoice2 = iResultB.rows[0];
  companyA.invoices = [];
});


describe("Test Get routes", function () {
  test("GET all company", async function () {
    const res = await request(app).get("/companies");
    expect(res.body).toEqual({
      companies: [
        { code: companyA.code, name: companyA.name },
        { code: companyB.code, name: companyB.name }
      ]
    });
  });

  test("GET one company", async function () {
    const res = await request(app).get("/companies/test");
    expect(res.body).toEqual({
      company: companyA
    });
  });

  test("GET non-existent company", async function () {
    const res = await request(app).get("/companies/not-real");
    expect(res.status).toEqual(404);
  })

});

describe("Test Post route", function () {
  test("POST new company", async function () {
    const newCompany = {
      code: "mack",
      name: "Mack Corporation",
      description: "Super Awesome"
    }
    const res = await request(app)
      .post("/companies")
      .send(newCompany);

    expect(res.status).toEqual(201);
    expect(res.body).toEqual({
      company: {
        code: newCompany.code,
        name: newCompany.name,
        description: newCompany.description
      }
    });

  });
});


afterAll(async function () {
  await db.end();
});