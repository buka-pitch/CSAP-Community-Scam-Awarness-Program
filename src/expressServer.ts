import Express from "express";
import { PrismaClient } from "@prisma/client";

const app = Express()
const prisma = new PrismaClient();

app.use(Express.json())


app.get("/", (req, res) => {
  res.send("base route");
})


app.get("/scan_url/:url", async (req, res) => {
  res.status(200).json({ "status": "success", url: req.params.url });
})


app.post("/scan_file", async (req, res) => {
  res.send("file scanner");
});

app.listen(process.env.PORT || 5000, () => {
  console.log("express server runing ");
})
