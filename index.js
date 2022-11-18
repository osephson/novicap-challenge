class Checkout {
  products = [];
  rules = [];

  productPrices = {}; // Object that represents price of each product
  productCounts = {}; // Object that represents scanned count of each product
  productCodes = []; // Array that represents scanned product codes

  ruleOptions = {}

  constructor({ products, rules }) {
    this.products = products;
    this.rules = rules;

    this.productCounts = {};
    for(let product of products) {
      this.productCodes.push(product.code);
      this.productPrices[product.code] = product.price;
    }

    this.ruleOptions = {};
    for (let rule of rules) {
      const { name, options } = rule;
      this.ruleOptions[name] = {};

      switch(name) {
        case "BOGO":
          for (const o of options) {
            this.ruleOptions[name][o.productCode] = true;
          }
          break;
        case "discount_quantity":
          for (const o of options) {
            this.ruleOptions[name][o.productCode] = o;
          }
      }
    }
  }

  scan(code) {
    if (!this.productCodes.includes(code)) {
      console.log("** Warn: %s is not registered on product list! **", code);
      return;
    }

    if (!this.productCounts[code])
      this.productCounts[code] = 0;
    this.productCounts[code]++;
  }

  isProductMatchedToRule(code, rule) {
    return this.ruleOptions[rule] && this.ruleOptions[rule][code]
  }

  totalByCode(code) {
    const { productCounts, productPrices, ruleOptions } = this;
    let price = productPrices[code];
    let count = productCounts[code];

    for (let rule in ruleOptions) {
      if (this.isProductMatchedToRule(code, rule)) {
        switch(rule) {
          case "BOGO":
              count = Math.round(count / 2);
            break;
          case "discount_quantity":
            const option = ruleOptions[rule][code]
            if (count >= option.discountNumber) {
              price = option.discountedPrice;
            }
            break;
          default:
            break;
        }
      }
    }

    return price * count;
  }

  total() {
    let price = 0;
    const scannedCodes = Object.keys(this.productCounts);

    for (const code of scannedCodes) {
      price += this.totalByCode(code);
    }
    return Number(price).toFixed(2);
  }
}

const products = require("./products.json");
const rules = require("./price-rules.json");

const orders = [
  ["VOUCHER", "TSHIRT", "MUG"],
  ["VOUCHER", "TSHIRT", "VOUCHER"],
  ["TSHIRT", "TSHIRT", "TSHIRT", "VOUCHER", "TSHIRT"],
  ["VOUCHER", "TSHIRT", "VOUCHER", "VOUCHER", "MUG", "TSHIRT", "TSHIRT"],
]

for (const order of orders) {
  const checkout = new Checkout({ products, rules });
  for (const item of order) {
    checkout.scan(item)
  }

  const price = checkout.total();
  console.log("Items:", order.join(", "));
  console.log("Total:", price);
}
