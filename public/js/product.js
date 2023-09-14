// --- add to cart --- //
const productQtyElement = $("[data-product-qty]");
const btnProductQtyIncrement = $("[data-btn-increment-qty]");
const btnProductQtyDecrement = $("[data-btn-decrement-qty]");
const btnAddToCart = $("[data-btn-add-to-cart]");

let productQty = 1;

btnProductQtyIncrement.addEventListener("click", () => {
  productQty++;
  productQtyElement.textContent = productQty;
});

btnProductQtyDecrement.addEventListener("click", () => {
  if (productQty <= 1) {
    return;
  }
  productQty--;
  productQtyElement.textContent = productQty;
});

btnAddToCart.addEventListener("click", () => {
  const productId = parseInt(btnAddToCart.dataset.productId);
  cart.addAndIncrimentCartItem(productId, productQty);
});
