const express = require("express");

const db = require("../db")
const router = express.Router();

const { NotFoundError } = require("../expressError")

router.get("/", async function (req, res, next) {
  const result = await db.query(
    `SELECT id, comp_code FROM invoices`
  );
  const invoices = result.rows;

  return res.json({ invoices: invoices })
});

router.get("/:id", async function (req, res, next) {
  const id = req.params.id;
  const iResult = await db.query(
    `SELECT id, amt, paid, add_date, paid_date, comp_code AS company FROM invoices
    WHERE id = $1`,
    [id]
  );
  const invoice = iResult.rows[0];

  // invoice has comp_code = "apple"
  // find companie where code = comp_code = "apple"

  const cResult = await db.query(
    `SELECT * FROM companies
    WHERE code = $1`,
    [invoice.company]
  )
  const company = cResult.rows[0];
  invoice.company = company;

  return res.json({ invoice: invoice })
});


router.post("/", async function (req, res, next) {

  let { comp_code, amt } = req.body;

  const result = await db.query(
    `INSERT INTO invoices
    (comp_code, amt) VALUES ($1, $2)
    RETURNING *`,
    [comp_code, amt]
  )
  const invoice = result.rows[0];

  return res.json({ invoice: invoice });

});

module.exports = router;