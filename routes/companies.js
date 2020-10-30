const express = require("express");

const db = require("../db")
const router = express.Router();

const { NotFoundError } = require("../expressError")

router.get("/", async function (req, res, next) {
  const results = await db.query(
    "SELECT code, name FROM companies"
  );
  const companies = results.rows;
  return res.json({ companies: companies });
});

router.get("/:code", async function (req, res, next) {
  try {
    const code = req.params.code;
    const cResults = await db.query(
      `SELECT * FROM companies
      WHERE code = $1`,
      [code]
    );
    const company = cResults.rows[0];
    if (!company) throw new NotFoundError;

    const iResults = await db.query(
      `SELECT * FROM invoices
      WHERE comp_code = $1`,
      [code]
    )
    const invoices = iResults.rows;
    company.invoices = invoices;

    return res.json({ company: company });

  } catch (error) {
    return next(error);
  }
});

router.post("/", async function (req, res, next) {
  const { code, name, description } = req.body;
  const results = await db.query(
    `INSERT INTO companies (code, name, description)
    VALUES ($1, $2, $3)
    RETURNING code, name, description`,
    [code, name, description]
  );
  const company = results.rows[0];
  return res.status(201).json({ company: company });
});

router.put("/:code", async function (req, res, next) {
  const companyCode = req.params.code;
  const { code, name, description } = req.body;
  const results = await db.query(
    `UPDATE companies
    SET name=$1, description=$2
    WHERE code = $3
    RETURNING code, name, description`,
    [name, description, companyCode]
  );
  const company = results.rows[0];
  return res.json({ company: company });
});

router.delete("/:code", async function (req, res, next) {
  try {
    const companyCode = req.params.code;
    const results = await db.query(
      `DELETE FROM companies
      WHERE code = $1`,
      [companyCode]
    );
    if (!results.rowCount) throw new NotFoundError(`cannot be found: ${companyCode}`);
    return res.json({ status: "deleted" });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;