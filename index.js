import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
const db=new pg.Client({
  host:"localhost",
  user:"postgres",
  password:"Jun23135",
  database:"World",
  port: 5433,

});

db.connect();

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", async (req, res) => {
  const visitedCountries=await checkVisited();
  //each row is an object representing a record from the countries_visited table.
  res.render("index.ejs", { countries: visitedCountries, total: visitedCountries.length });
  
});

async function checkVisited() {
  let visitedCountries=[];
 try{ 
  const result=await db.query("SELECT country_code FROM countries_visited");
  result.rows.forEach(country => {
    visitedCountries.push(country.country_code);
  });
}catch (error) {
  console.error("Error querying countries_visited", error);
  throw error; 
}
  return visitedCountries;
}

app.post("/add", async (req,res)=>{
  const countryName=req.body.country;
  try{
    const result= await db.query("SELECT country_code FROM countries WHERE country_name = $1", [countryName]);
    if (result.rows.length === 0) {
            // If no matching country is found, throw an error
            throw new Error("Country not found in the database");
      }
      try{await db.query("INSERT INTO countries_visited (country_code) VALUES ($1)",
        [result.rows[0].country_code]);
      res.redirect("/");
      }catch(inserterr){
        console.log(inserterr);
        const visitedCountries= await checkVisited();
        res.render("index.ejs", { countries: visitedCountries, total: visitedCountries.length, error:"Country has already been added, try again" });
      }
    }catch(err){
    const visitedCountries= await checkVisited();
    res.render("index.ejs", {countries: visitedCountries, total: visitedCountries.length,  error: "Error adding country to visited list" 
      });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
