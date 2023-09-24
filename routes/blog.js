const express = require("express");
// importing pool
const db = require("../data/database");
const router = express.Router();

router.get("/", function (req, res) {
  res.redirect("/posts"); // if the user visits the site / , I wanna redirect him
});

router.get("/posts", async function (req, res) {
  // using as here is just aliasing to differentiate the authorname from post title
  const [posts] = await db.query(
    "SELECT posts.*,authors.name AS author_name FROM blog.posts INNER JOIN authors ON posts.author_id=authors.id"
  );
  res.render("posts-list", { posts: posts });
});

router.get("/new-post", async function (req, res) {
  //getting authors from database
  /* note that , the returned data is obj with 2 arrays , 1st is array of data wanted
    2nd is metadata , and as we are interested in the data only , we used array destructuring to 
    extract the 1st element only
    */
  const [authors] = await db.query("SELECT * FROM authors ");

  res.render("create-post", { authors: authors });
});

router.post("/posts", async function (req, res) {
  // keys are the names in the html code
  const data = [
    req.body.title,
    req.body.summary,
    req.body.content,
    req.body
      .author /* note that , what will be submitted as for the drop down is the option value , which we 've choden to be the id*/,
  ];
  // mysql2 package helps us , replaces ? with the array
  await db.query(
    "INSERT INTO posts (title , summary, body, author_id) VALUES (?)",
    [data]
  );
  console.log("aya");
  res.redirect("/posts");
});

router.get("/posts/:id", async function (req, res) {
  const [posts] = await db.query(
    `
  SELECT posts.*,authors.name AS author_name,authors.email AS author_email FROM blog.posts 
  INNER JOIN authors ON posts.author_id=authors.id
  Where posts.id= ?`,
    [req.params.id]
  );

  if (!posts || posts.length === 0) {
    return res.status(404).render("404");
  }

  const postData = {
    ...posts[0],
    date: posts[0].date.toISOString() /* I am over riding the date property to make it readable */,
    humanReadableDate: posts[0].date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  };
  res.render("post-detail", { post: postData });
});

router.get("/posts/:id/edit", async function (req, res) {
  const [posts] = await db.query("SELECT * FROM posts WHERE id = ?", [
    req.params.id,
  ]);
  if (!posts || posts.length === 0) {
    return res.status(404).render("404");
  }
  res.render("update-post", { post: posts[0] });
});

router.post("/posts/:id/edit", async function (req, res) {
  await db.query(
    "UPDATE posts SET  title = ?,summary= ? , body = ? WHERE id= ? ",
    [
      req.body.title,
      req.body.summary,
      req.body.content,
      req.params.id
    ]
  );
    /* note eno ana fi form el html khaletoh yeroload bas 2ashan yesubmit bas 2amaltelo redirect hena aho */
  res.redirect("/posts");
});

router.post("/posts/:id/delete", async function (req, res) {
  await db.query(
    "DELETE FROM posts WHERE id= ? ",
    [
      req.params.id
    ]
  );
  res.redirect("/posts");
});

module.exports = router;
