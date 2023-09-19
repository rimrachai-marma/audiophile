require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");

const data = require("./data/data.json");
const { formatCurrency } = require("./utilities/formater");

// INITIATE EXPRESS APP
const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ROUTE
app.get("/", (req, res) => {
  res.render("home", {
    pageTitle: undefined,
    heroProduct: data.heroProduct,
    homeProduct: data.homeProduct,
  });
});

app.get("/products/:slug", function (req, res) {
  const product = data.products.find(
    (product) => product.slug === req.params.slug
  );

  if (!product) {
    return res.status(404).send({ message: "Product not found!" });
    // product not found page
  }

  res.render("product", {
    product: { ...product, price: formatCurrency(product.price, "USD") },
    pageTitle: `${product.name} | Audiophile e-commerce website`,
  });
});

app.get("/headphones", (req, res) => {
  const products = data.products.filter(
    (product) => product.category === "headphones"
  );

  res.render("product-list", {
    pageTitle: "Headphones | Audiophile e-commerce website",
    headerContent: "Headphones",
    products: products.slice().reverse(),
  });
});

app.get("/speakers", (req, res) => {
  const products = data.products.filter(
    (product) => product.category === "speakers"
  );

  res.render("product-list", {
    pageTitle: "Speakers | Audiophile e-commerce website",
    headerContent: "Speakers",
    products: products.slice().reverse(),
  });
});

app.get("/earphones", (req, res) => {
  const products = data.products.filter(
    (product) => product.category === "earphones"
  );

  res.render("product-list", {
    pageTitle: "Earphones | Audiophile e-commerce website",
    headerContent: "Earphones",
    products: products.slice().reverse(),
  });
});

app.get("/checkout", (req, res) => {
  res.render("checkout", {
    pageTitle: "Checkout | Audiophile e-commerce website",
  });
});

// API ROUTE
app.get("/api/products/:id", (req, res) => {
  const product = data.products.find(
    (product) => product.id === parseInt(req.params.id)
  );

  if (!product) {
    return res.status(404).send({ message: "Product not found!" });
  }

  res.send(product);
});

app.post("/api/order", (req, res) => {
  const {
    name,
    email,
    phone,
    address,
    zipCode,
    city,
    country,
    paymentMethod,
    eMoneyNumber,
    eMoneyPin,
    orderItems,
  } = req.body;

  // validation
  let emptyFields = [];

  if (!name) {
    emptyFields.push("name");
  }
  if (!email) {
    emptyFields.push("email");
  }
  if (!phone) {
    emptyFields.push("phone");
  }
  if (!address) {
    emptyFields.push("address");
  }
  if (!zipCode) {
    emptyFields.push("zipCode");
  }
  if (!city) {
    emptyFields.push("city");
  }

  if (!country) {
    emptyFields.push("country");
  }
  if (!paymentMethod) {
    emptyFields.push("paymentMethod");
  }
  if (!eMoneyNumber && paymentMethod === "e-money") {
    emptyFields.push("eMoneyNumber");
  }
  if (!eMoneyPin && paymentMethod === "e-money") {
    emptyFields.push("eMoneyPin");
  }

  if (emptyFields.length > 0) {
    return res.status(400).send({
      message: "Please fill in missing fields",
      extrafield: { emptyFields },
    });
  }
  // we can also add email validation

  let firstOrderItem = data.products.find(
    (_item) => _item.id === orderItems[0].id
  );
  firstOrderItem = { ...firstOrderItem, qty: orderItems[0].qty };

  const totalPrice = orderItems.reduce((total, orderItem) => {
    const storeItem = data.products.find((_item) => orderItem.id === _item.id);

    return total + (storeItem?.price ?? 0) * orderItem.qty;
  }, 0);

  const grandTotal = totalPrice + 50;

  const totalQty = orderItems.reduce((total, item) => total + item.qty, 0);

  res.send({
    totalQty,
    grandTotal,
    firstOrderItem,
  });
});

app.get("*", (req, res) => {
  res.status(404).send({ message: "Page not found!" });
  // Not Found Page
});

app.listen(process.env.PORT, () =>
  console.log(
    `Server running on PORT ${process.env.PORT}\nLocal:\thttp://localhost:${process.env.PORT}`
  )
);
