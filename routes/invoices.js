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
  try {
    const id = req.params.id;
    const iResult = await db.query(
      `SELECT id, amt, paid, add_date, paid_date, comp_code AS company FROM invoices
      WHERE id = $1`,
      [id]
    );
    const invoice = iResult.rows[0];
    if (!invoice) throw new NotFoundError;

    const cResult = await db.query(
      `SELECT * FROM companies
      WHERE code = $1`,
      [invoice.company]
    )
    const company = cResult.rows[0];
    invoice.company = company;

    return res.json({ invoice: invoice });

  } catch (error) {
    return next(error);
  }
});

router.post("/", async function (req, res, next) {

  const { comp_code, amt } = req.body;

  const result = await db.query(
    `INSERT INTO invoices
    (comp_code, amt) VALUES ($1, $2)
    RETURNING *`,
    [comp_code, amt]
  )
  const invoice = result.rows[0];

  return res.status(201).json({ invoice: invoice });

});


router.put("/:id", async function (req, res, next) {
  try {
    const id = req.params.id;
    const { amt } = req.body;

    const result = await db.query(
      `UPDATE invoices
      SET amt = $1
      WHERE id = $2
      RETURNING *`,
      [amt, id]
    )
    const invoice = result.rows[0];
    if (!invoice) throw new NotFoundError;
    return res.json({ invoice: invoice });

  } catch (error) {
    return next(error);
  }
});


router.delete("/:id", async function (req, res, next) {
  try {
    const id = req.params.id;
    const result = await db.query(
      `DELETE FROM invoices
      WHERE id = $1`,
      [id]
    )
    if (!result.rowCount) throw new NotFoundError;
    return res.json({ status: "deleted" });

  } catch (error) {
    return next(error);
  }
});

module.exports = router;