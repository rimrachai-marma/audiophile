const modal = $("[data-modal]");
const orderInfoElement = $("[data-order-info");

class Checkout extends Cart {
  #CheckoutListElement = $("[data-checkout-list]");
  #CheckoutTotalPriceElement = $("[data-checkout-total-price]");
  #ShippingChargeElement = $("[data-shipping-charge]");
  #VatElement = $("[data-vat]");
  #GrandTotalElement = $("[data-grand-total]");

  #checkoutItems = this.getCartItems;
  #vat = 20;
  #shippingCharge = 50;

  constructor() {
    super();

    this.#renderCheckoutItems(this.#checkoutItems);
    this.#updateCheckoutSummary(this.#checkoutItems, this.#vat);
  }

  get getCheckoutItems() {
    return this.#checkoutItems;
  }

  clearChecout = () => {
    this.#checkoutItems = [];

    this.#renderCheckoutItems(this.#checkoutItems);
    this.#updateCheckoutSummary(this.#checkoutItems, this.#vat);
  };

  #updateCheckoutSummary = async (checkoutItems, tax) => {
    const totalPrice = await this.#totalPrice(checkoutItems);

    // UPDATE TOTAL PRICE
    this.#CheckoutTotalPriceElement.textContent = formatCurrency(
      totalPrice,
      "USD"
    );

    // UPDATE SHIPPING CHARGE
    this.#ShippingChargeElement.textContent = formatCurrency(
      this.#shippingCharge,
      "USD"
    );

    // UPDATE VAT (INCLUDED)
    const totalVat = totalPrice * (tax / 100);
    this.#VatElement.textContent = formatCurrency(totalVat, "USD");

    // UPDATE GRAND TOTAL
    const grandTotal = totalPrice + this.#shippingCharge;
    this.#GrandTotalElement.textContent = formatCurrency(grandTotal, "USD");
  };

  #renderCheckoutItems = async (checkoutItems) => {
    this.#CheckoutListElement.innerHTML = "";
    this.#CheckoutListElement.insertAdjacentHTML(
      "afterbegin",
      "<span>Loading...</span>"
    );

    if (checkoutItems.length !== 0) {
      const markup = await Promise.all(
        checkoutItems.map(async (checkoutItem) => {
          const storeItem = await this._fetchStoreItem(checkoutItem.id);

          return this.#generateMarkup(checkoutItem, storeItem);
        })
      );

      this.#CheckoutListElement.innerHTML = "";
      this.#CheckoutListElement.insertAdjacentHTML(
        "afterbegin",
        markup.join("")
      );
    } else {
      this.#CheckoutListElement.innerHTML = "";
      this.#CheckoutListElement.insertAdjacentHTML(
        "afterbegin",
        "<span>Your cart is empty!</span>"
      );
    }
  };

  #generateMarkup = (checkoutItem, storeItem) => `
    <li>
      <img
        src="${storeItem?.image.mobile ?? "./assets/not_available.png"}"
        alt="${storeItem?.name}"
      />

      <div class="checkout-item-info">
        <h4 class="${!storeItem && "not-available"}">
          ${storeItem?.name ?? "Not available"}
        </h4>
        <span>${formatCurrency(storeItem?.price ?? 0, "USD")}</span>
      </div>
      <div class="checkout-item-qty">${checkoutItem.qty}</div>
    </li>
  `;

  #totalPrice = async (checkoutItems) => {
    return await asyncReduce(
      checkoutItems,
      async (total, checkoutItem) => {
        const storeItem = await this._fetchStoreItem(checkoutItem.id);

        return total + checkoutItem.qty * (storeItem?.price ?? 0);
      },
      0
    );
  };
}

const checkout = new Checkout();

// SELECT PAYMENT METHOD //
const paymentMethodField = $("[data-payment-method]");
const paymentmethods = e$all(paymentMethodField, "input[name='paymentMethod']");

const eMoney = $("[data-e-money]");
const cashSummary = $("[data-cash-summary]");

paymentmethods.forEach((paymentmethod) => {
  paymentmethod.addEventListener("change", function (event) {
    if (event.target.value === "cash" && event.target.checked) {
      addStyle(eMoney, { display: "none" });

      removeStyle(cashSummary, ["display"]);
    }

    if (event.target.value === "e-money" && event.target.checked) {
      addStyle(cashSummary, { display: "none" });

      removeStyle(eMoney, ["display"]);
    }
  });
});

// -- FORM VALIDATON --//
const form = $("[data-form]");

const nameInput = e$(form, "input#name");
const emailInput = e$(form, "input#email");
const phoneInput = e$(form, "input#phone");
const addressInput = e$(form, "input#address");
const zip_codeInput = e$(form, "input#zip_code");
const cityInput = e$(form, "input#city");
const countryInput = e$(form, "input#country");
const eMoneyNumberInput = e$(form, "input#eMoneyNumber");
const eMoneyPinInput = e$(form, "input#eMoneyPin");

const nameInputLabel = e$(form, "label[for='name']");
const emailInputLabel = e$(form, "label[for='email']");
const phoneInputLabel = e$(form, "label[for='phone']");
const addressInputLabel = e$(form, "label[for='address']");
const zip_codeInputLabel = e$(form, "label[for='zip_code']");
const cityInputLabel = e$(form, "label[for='city']");
const countryInputLabel = e$(form, "label[for='country']");
const eMoneyNumberInputLabel = e$(form, "label[for='eMoneyNumber']");
const eMoneyPinInputLabel = e$(form, "label[for='eMoneyPin']");

const nameError = $("[data-name-error-message]");
const emailError = $("[data-email-error-message]");
const phoneError = $("[data-phone-error-message]");
const addressError = $("[data-address-error-message]");
const zip_codeError = $("[data-zip_code-error-message]");
const cityError = $("[data-city-error-message]");
const countryError = $("[data-country-error-message]");
const eMoneyNumberError = $("[data-eMoneyNumber-error-message]");
const eMoneyPinError = $("[data-eMoneyPin-error-message]");

// name input validation
nameInput.addEventListener("input", function (event) {
  if (event.target.value) {
    nameError.textContent = "";
    nameInput.classList.remove("invalid");
    nameInputLabel.classList.remove("invalid");
  }
  if (event.target.value === "") {
    nameError.textContent = "Name field is required";
    nameInput.classList.add("invalid");
    nameInputLabel.classList.add("invalid");
  }
});

// email input validation
emailInput.addEventListener("input", function (event) {
  if (event.target.value) {
    if (isValidEmail(event.target.value)) {
      emailError.textContent = "";
      emailInput.classList.remove("invalid");
      emailInputLabel.classList.remove("invalid");
    } else {
      emailError.textContent = "Invalid email address";
      emailInput.classList.add("invalid");
      emailInputLabel.classList.add("invalid");
    }
  }

  if (event.target.value === "") {
    emailError.textContent = "Email field is required";
    emailInput.classList.add("invalid");
    emailInputLabel.classList.add("invalid");
  }
});

// phone input validation
phoneInput.addEventListener("input", function (event) {
  if (event.target.value) {
    phoneError.textContent = "";
    phoneInput.classList.remove("invalid");
    phoneInputLabel.classList.remove("invalid");
  }
  if (event.target.value === "") {
    phoneError.textContent = "Phone Number field is required";
    phoneInput.classList.add("invalid");
    phoneInputLabel.classList.add("invalid");
  }
});

// address input validation
addressInput.addEventListener("input", function (event) {
  if (event.target.value) {
    addressError.textContent = "";
    addressInput.classList.remove("invalid");
    addressInputLabel.classList.remove("invalid");
  }
  if (event.target.value === "") {
    addressError.textContent = "Adsress field is required";
    addressInput.classList.add("invalid");
    addressInputLabel.classList.add("invalid");
  }
});

// zip code input validation
zip_codeInput.addEventListener("input", function (event) {
  if (event.target.value) {
    zip_codeError.textContent = "";
    zip_codeInput.classList.remove("invalid");
    zip_codeInputLabel.classList.remove("invalid");
  }
  if (event.target.value === "") {
    zip_codeError.textContent = "ZIP code field is required";
    zip_codeInput.classList.add("invalid");
    zip_codeInputLabel.classList.add("invalid");
  }
});

// city input validation
cityInput.addEventListener("input", function (event) {
  if (event.target.value) {
    cityError.textContent = "";
    cityInput.classList.remove("invalid");
    cityInputLabel.classList.remove("invalid");
  }
  if (event.target.value === "") {
    cityError.textContent = "City field is required";
    cityInput.classList.add("invalid");
    cityInputLabel.classList.add("invalid");
  }
});

// couuntry input validation
countryInput.addEventListener("input", function (event) {
  if (event.target.value) {
    countryError.textContent = "";
    countryInput.classList.remove("invalid");
    countryInputLabel.classList.remove("invalid");
  }
  if (event.target.value === "") {
    countryError.textContent = "Country field is required";
    countryInput.classList.add("invalid");
    countryInputLabel.classList.add("invalid");
  }
});

// e-Money Number input validation
eMoneyNumberInput.addEventListener("input", function (event) {
  if (event.target.value) {
    eMoneyNumberError.textContent = "";
    eMoneyNumberInput.classList.remove("invalid");
    eMoneyNumberInputLabel.classList.remove("invalid");
  }
  if (event.target.value === "") {
    eMoneyNumberError.textContent = "e-Money Number field is required";
    eMoneyNumberInput.classList.add("invalid");
    eMoneyNumberInputLabel.classList.add("invalid");
  }
});

// e-Money PIN input validation
eMoneyPinInput.addEventListener("input", function (event) {
  if (event.target.value) {
    eMoneyPinError.textContent = "";
    eMoneyPinInput.classList.remove("invalid");
    eMoneyPinInputLabel.classList.remove("invalid");
  }
  if (event.target.value === "") {
    eMoneyPinError.textContent = "e-Money PIN field is required";
    eMoneyPinInput.classList.add("invalid");
    eMoneyPinInputLabel.classList.add("invalid");
  }
});

// FFORM SUBMITION
form.addEventListener("submit", async (event) => {
  event.preventDefault();

  // name input validation
  if (nameInput.value === "") {
    nameError.textContent = "Name field is required";
    nameInput.classList.add("invalid");
    nameInputLabel.classList.add("invalid");
  }

  // email input validation
  if (emailInput.value === "") {
    emailError.textContent = "Email field is required";
    emailInput.classList.add("invalid");
    emailInputLabel.classList.add("invalid");
  }
  if (emailInput.value && !isValidEmail(emailInput.value)) {
    emailError.textContent = "Invalid email address";
    emailInput.classList.add("invalid");
    emailInputLabel.classList.add("invalid");
  }

  // phone input validation
  if (phoneInput.value === "") {
    phoneError.textContent = "Phone Number field is required";
    phoneInput.classList.add("invalid");
    phoneInputLabel.classList.add("invalid");
  }

  // address input validation
  if (addressInput.value === "") {
    addressError.textContent = "Address field is required";
    addressInput.classList.add("invalid");
    addressInputLabel.classList.add("invalid");
  }

  // zip code input validation
  if (zip_codeInput.value === "") {
    zip_codeError.textContent = "ZIP code field is required";
    zip_codeInput.classList.add("invalid");
    zip_codeInputLabel.classList.add("invalid");
  }

  // city input validation
  if (cityInput.value === "") {
    cityError.textContent = "City field is required";
    cityInput.classList.add("invalid");
    cityInputLabel.classList.add("invalid");
  }

  // country input validation
  if (countryInput.value === "") {
    countryError.textContent = "Country field is required";
    countryInput.classList.add("invalid");
    countryInputLabel.classList.add("invalid");
  }

  // e-Money Number input validation
  if (eMoneyNumberInput.value === "") {
    eMoneyNumberError.textContent = "e-Money Number field is required";
    eMoneyNumberInput.classList.add("invalid");
    eMoneyNumberInputLabel.classList.add("invalid");
  }

  // e-Money PIN input validation
  if (eMoneyPinInput.value === "") {
    eMoneyPinError.textContent = "e-Money PIN field is required";
    eMoneyPinInput.classList.add("invalid");
    eMoneyPinInputLabel.classList.add("invalid");
  }

  // submit form is here
  const formData = new FormData(event.target);

  const name = formData.get("name");
  const email = formData.get("email");
  const phone = formData.get("phone");
  const address = formData.get("address");
  const zipCode = formData.get("zip_code");
  const city = formData.get("city");
  const country = formData.get("country");
  const eMoneyNumber = formData.get("eMoneyNumber");
  const eMoneyPin = formData.get("eMoneyPin");
  const paymentMethod = formData.get("paymentMethod");

  if (
    (name !== "") &
    (email !== "") &
    (phone !== "") &
    (address !== "") &
    (zipCode !== "") &
    (city !== "") &
    (country !== "") &
    (address !== "") &
    ((paymentMethod === "e-money") &
      (eMoneyNumber !== "") &
      (eMoneyPin !== "") || paymentMethod === "cash")
  ) {
    fetch("/api/order", {
      method: "POST",
      body: JSON.stringify({
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
        orderItems: checkout.getCartItems,
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    })
      .then((res) => res.json())
      .then(({ totalQty, grandTotal, firstOrderItem }) => {
        //form reset
        nameInput.value = "";
        emailInput.value = "";
        phoneInput.value = "";
        addressInput.value = "";
        zip_codeInput.value = "";
        cityInput.value = "";
        countryInput.value = "";
        eMoneyNumberInput.value = "";
        eMoneyPinInput.value = "";

        // clear cart and checout
        checkout.clearCart();
        checkout.clearChecout();

        //update and show modal
        const markup = `
          <div class="order-items">
            <div class="order-item">
              <img
                src="${firstOrderItem.image.mobile}"
                alt="${firstOrderItem.name}"
              />
              <div class="order-item-info">
                <h4 >${firstOrderItem.name}</h4>
                <span >${formatCurrency(firstOrderItem.price, "USD")}</span>
              </div>
              
              <div  class="order-item-qty">x${firstOrderItem.qty}</div>
            </div>
            <hr />
            <div  class="order-item-length">
              ${
                totalQty > firstOrderItem.qty
                  ? `and ${totalQty - firstOrderItem.qty} other item (s)`
                  : ""
              }
            </div>
            
          </div>
          <div class="order-price">
            <span>Grand total</span>
            <span>${formatCurrency(grandTotal, "USD")}</span>
          </div>
        `;

        orderInfoElement.innerHTML = "";
        orderInfoElement.insertAdjacentHTML("afterbegin", markup);

        modal.showModal();
      });
  }
});

// --- CLOSE MODAL --- //
modal.addEventListener("click", (event) => {
  const dialogDimensions = modal.getBoundingClientRect();
  if (
    event.clientX < dialogDimensions.left ||
    event.clientX > dialogDimensions.right ||
    event.clientY < dialogDimensions.top ||
    event.clientY > dialogDimensions.bottom
  ) {
    modal.close();
  }
});
