/** @format */

const express = require("express");
const cors = require("cors"); // ✅ import cors

const app = express();
const port = 3000;

// datastricture

var parent_data = [];

// ✅ use cors middleware
app.use(cors());
// To parse JSON body
app.use(express.json());

app.get("/", (req, res) => {
   res.send("Hello World!");
});

app.get("/user", (req, res) => {
   res.json({ id: 1, name: "unnat" });
});

app.post("/add", (req, res) => {
   const data = req.body;
   console.log(data); // {id : 1 , name : "hshs"}
   if (data.id && data.name) {
      parent_data.push(data);
      res.json({ message: "Data added successfully", data: parent_data });
   }
   return res.json({ message: "Data not added successfully" });
});

app.delete("/delete/:id", (req, res) => {
   const id = parseInt(req.params.id);
   console.log(id);
   parent_data = parent_data.filter((item) => item.id !== id);
   res.json({ message: "Data deleted successfully", data: parent_data });
});

app.listen(port, () => {
   console.log(`Example app listening on port ${port}`);
});
