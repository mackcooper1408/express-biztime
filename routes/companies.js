const express = require("express");

const db = require("../db")
const router = express.Router();

router.get("/", async function (req, res, next) {
  console.log("I'm Here!");
  const results = await db.query(
    "SELECT code, name FROM companies;"
  )
  const companies = results.rows;
  return res.json({ companies: companies });
});

module.exports = router;