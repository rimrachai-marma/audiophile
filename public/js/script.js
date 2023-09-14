// -- set active link class -- //
const navLinkElements = $all("[data-nav_list] a");
const windowPathname = window.location.pathname;

navLinkElements.forEach((navLinkElement) => {
  const navLinkPathname = new URL(navLinkElement.href).pathname;

  if (windowPathname === navLinkPathname) {
    navLinkElement.classList.add("active");
  }
});

// --- CART --- //
const btnRemoveAllCart = $("[data-btn-remove-all-items]");
const btnCart = $("[data-btn-cart]");

class Cart {
  #CartOverlyElement = $("[data-cart-overly]");
  #CartElement = $("[data-cart]");

  #CartListElement = $("[data-cart-list]");
  #CartTotalQtyElement = $("[data-cart-total-qty]");
  #CartTotalPriceElement = $("[data-cart-total-price]");

  #cartItems = [];
  constructor() {
    this.#cartItems = this.#getLocalStorage() || [];

    this.#renderCartItems(this.#cartItems);
    this.#updateTotalQty(this.#cartItems);
    this.#updateTotalPrice(this.#cartItems);

    this.#closeCartHandler();
  }

  get getCartItems() {
    return this.#cartItems;
  }

  addAndIncrimentCartItem = (id, qty = 1) => {
    const existingItem = this.#cartItems.find((cartItem) => cartItem.id === id);

    if (!existingItem) {
      this.#cartItems = [{ id, qty }, ...this.#cartItems];
    } else {
      existingItem.qty += qty;
    }

    this.#setLocalStorage(this.#cartItems);
    this.#renderCartItems(this.#cartItems);
    this.#updateTotalQty(this.#cartItems);
    this.#updateTotalPrice(this.#cartItems);
  };

  decrimentAndRemoveCartItem = (id, qty = 1) => {
    const existingItem = this.#cartItems.find((cartItem) => cartItem.id === id);

    if (!existingItem) {
      return;
    }

    if (existingItem.qty <= qty) {
      this.#cartItems = this.#cartItems.filter(
        (cartItem) => cartItem.id !== id
      );
    } else {
      existingItem.qty -= qty;
    }

    this.#setLocalStorage(this.#cartItems);
    this.#renderCartItems(this.#cartItems);
    this.#updateTotalQty(this.#cartItems);
    this.#updateTotalPrice(this.#cartItems);
  };

  removeCartItem = (id) => {
    this.#cartItems = this.#cartItems.filter((cartItem) => cartItem.id !== id);

    this.#setLocalStorage(this.#cartItems);
    this.#renderCartItems(this.#cartItems);
    this.#updateTotalQty(this.#cartItems);
    this.#updateTotalPrice(this.#cartItems);
  };

  clearCart = () => {
    this.#cartItems = [];

    this.#setLocalStorage(this.#cartItems);
    this.#renderCartItems(this.#cartItems);
    this.#updateTotalQty(this.#cartItems);
    this.#updateTotalPrice(this.#cartItems);
  };

  #updateTotalQty = (cartItems) => {
    const totalQty = cartItems.reduce((total, item) => total + item.qty, 0);

    this.#CartTotalQtyElement.textContent = `cart (${totalQty})`;
  };

  #updateTotalPrice = async (cartItems) => {
    this.#CartTotalPriceElement.textContent = "Calculating..";

    const totalPrice = await cartItems.reduce(
      async (totalPromise, cartItem) => {
        const total = await totalPromise;

        const storeItem = await this._fetchStoreItem(cartItem.id);

        return total + cartItem.qty * (storeItem?.price ?? 0);
      },
      Promise.resolve(0)
    );

    this.#CartTotalPriceElement.textContent = formatCurrency(totalPrice, "USD");
  };

  #renderCartItems = async (cartitems) => {
    this.#CartListElement.innerHTML = "";
    this.#CartListElement.insertAdjacentHTML(
      "afterbegin",
      "<span>Loading...</span>"
    );

    if (cartitems.length !== 0) {
      const markup = await Promise.all(
        cartitems.map(async (cartItem) => {
          const storeItem = await this._fetchStoreItem(cartItem.id);

          return this.#generateMarkup(cartItem, storeItem);
        })
      );

      this.#CartListElement.innerHTML = "";
      this.#CartListElement.insertAdjacentHTML("afterbegin", markup.join(""));
    } else {
      this.#CartListElement.innerHTML = "";
      this.#CartListElement.insertAdjacentHTML(
        "afterbegin",
        "<span>Your cart is empty!</span>"
      );
    }
  };

  #generateMarkup = (cartItem, storeItem) => `
    <li>
      <img
        src="${storeItem?.image.mobile ?? "/assets/not_available.png"}"
        alt="${storeItem?.name}"
      />

      <div class="cart-item-info">
        <h4 class="${!storeItem && "not-available"}">
          ${storeItem?.name ?? "Not available"}
        </h4>
        <span>${formatCurrency(storeItem?.price ?? 0, "USD")}</span>
      </div>
      <div class="cart-item-action">
        <button onclick="decrement(${cartItem.id})">&#8722;</button>
        <span>${cartItem.qty}</span>
        <button onclick="increment(${cartItem.id})">&#43;</button>
      </div>
    </li>
  `;

  #getLocalStorage = () => {
    return JSON.parse(localStorage.getItem("__shopping_cart__"));
  };

  #setLocalStorage = (cartItems) => {
    localStorage.setItem("__shopping_cart__", JSON.stringify(cartItems));
  };

  _fetchStoreItem = async (id) => {
    const res = await fetch(`/api/products/${id}`);

    if (!res.ok) {
      return null;
    }

    return await res.json();
  };

  openCart = () => {
    this.#CartOverlyElement.classList.add("open");
  };

  #closeCartHandler = () => {
    this.#CartOverlyElement.addEventListener("click", (event) => {
      const cartDimensions = this.#CartElement.getBoundingClientRect();

      if (
        event.clientX < cartDimensions.left ||
        event.clientX > cartDimensions.right ||
        event.clientY < cartDimensions.top ||
        event.clientY > cartDimensions.bottom
      ) {
        this.#CartOverlyElement.classList.remove("open");
      }
    });
  };
}

const cart = new Cart();

btnCart.addEventListener("click", () => cart.openCart());

function addToCart(id, qty) {
  cart.addAndIncrimentCartItem(id, qty);
}

function increment(id) {
  cart.addAndIncrimentCartItem(id);
}

function decrement(id) {
  cart.decrimentAndRemoveCartItem(id);
}

btnRemoveAllCart.addEventListener("click", () => cart.clearCart());
