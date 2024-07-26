import { getCardFromLocatST, updateCartValue } from './homeProductCards.js';

export function showToast(operation, id) {
    const toast = document.createElement("div");
    toast.classList.add("toast");
    if (operation === "add") {
        toast.textContent = `Product ${id} added`;
    } else {
        toast.textContent = `Product ${id} deleted`;
        console.log(`Product ${id} deleted`);
    }
    document.body.appendChild(toast);
    // Automatically remove the toast after a few seconds
    setTimeout(() => {
        toast.remove();
    }, 2000);
}

export const incrementDecrement = (event, id, stock, price) => {
    const currentCardElement = document.querySelector(`#card${id}`);
    const productQuantity = currentCardElement.querySelector('.productQuantity');
    const productPrice = currentCardElement.querySelector('.productPrice');

    let quantity = parseInt(productQuantity.textContent);
    let localStoragePrice = 0;
    let localCartProducts = getCardFromLocatST();
    let existingProduct = localCartProducts.find((curProd) => curProd.id === id);

    if (existingProduct) {
        quantity = existingProduct.quantity;
        price = existingProduct.price / existingProduct.quantity;
    }

    if (event.target.className === "cartIncrement") {
        if (quantity < stock) {
            quantity += 1;
        } else if (quantity === stock) {
            quantity = stock;
        }
    }

    if (event.target.className === "cartDecrement") {
        if (quantity > 1) {
            quantity -= 1;
        }
    }

    // Update UI
    productQuantity.textContent = quantity;
    localStoragePrice = price * quantity;
    productPrice.textContent = `$${localStoragePrice.toFixed(2)}`;

    // Update in local storage
    let updateCart = localCartProducts.map((curProd) =>
        curProd.id === id ? { id, quantity, price: localStoragePrice } : curProd
    );
    localStorage.setItem('cardProductsLs', JSON.stringify(updateCart));

    updateCardProductTotal();
};

export const updateCardProductTotal = () => {
    let localCartProducts = getCardFromLocatST();
    let initialValue = 0;
    let productSubTotal = document.querySelector('.productSubTotal');
    let productFinalTotal = document.querySelector('.productFinalTotal');
    let totalProductPrice = localCartProducts.reduce((accum, currElem) => {
        let productPrice = parseInt(currElem.price) || 0;
        return accum + productPrice;
    }, initialValue);

    productSubTotal.textContent = `$${totalProductPrice}`;
    productFinalTotal.textContent = `$${totalProductPrice + 50}`;
};

updateCardProductTotal();

export const fetchQuantityFromCartsLs = (id, price) => {
    let cartProducts = getCardFromLocatST();
    let quantity = 1;
    let existingProduct = cartProducts.find((curProd) => curProd.id === id);
    if (existingProduct) {
        quantity = existingProduct.quantity;
        price = existingProduct.price / existingProduct.quantity;
    }
    return { quantity, price };
};

export const removeProdFromCart = (id) => {
    let cartProducts = getCardFromLocatST();
    cartProducts = cartProducts.filter((curProd) => curProd.id !== id);
    localStorage.setItem('cardProductsLs', JSON.stringify(cartProducts));

    // Remove the product div from the UI
    let removeDiv = document.getElementById(`card${id}`);
    if (removeDiv) {
        removeDiv.remove();
        showToast("delete", id);
    }

    updateCartValue(cartProducts);
    showCartProducts(); // Update the cart display
    updateCardProductTotal();
};

let cartProducts = getCardFromLocatST();
let filterProducts = []; // This will store filtered products

async function fetchAndFilterProducts() {
    try {
        const response = await fetch('./api/product.json');
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        const data = await response.json();

        if (data && Array.isArray(data.products)) {
            let products = data.products;

            filterProducts = products.filter(curProd => {
                return cartProducts.some(cartProd => cartProd.id === curProd.id);
            });

            console.log('Filtered products:', filterProducts);

            showCartProducts(); // Call the function to display products
        } else {
            console.error('Data format is incorrect:', data);
        }
    } catch (error) {
        console.error('Error fetching JSON:', error);
    }
}

// Call the fetchAndFilterProducts function
fetchAndFilterProducts();

const cartElement = document.querySelector('#productCartContainer');
const templateContainer = document.querySelector('#productCartTemplate');

const showCartProducts = () => {
    cartProducts = getCardFromLocatST(); // Update cartProducts from local storage
    filterProducts = filterProducts.filter(curProd => {
        return cartProducts.some(cartProd => cartProd.id === curProd.id);
    });

    cartElement.innerHTML = ''; // Clear the cart before appending updated products

    if (!filterProducts.length) {
        console.error('No products to display in cart');
        return;
    }

    filterProducts.forEach(curProd => {
        const { brand, category, id, image, name, price, stock, description } = curProd;

        // Clone the template content
        let productClone = document.importNode(templateContainer.content, true);
        let productCard = productClone.querySelector('.cards');

        if (!productCard) {
            console.error('Template structure is incorrect. .cards element is missing.');
            return;
        }

        productCard.id = `card${id}`; // Assign an ID to the product card div

        const lsActualData = fetchQuantityFromCartsLs(id, price);

        // Directly set product details in the cloned template
        productCard.querySelector('.productName').textContent = name;
        productCard.querySelector('.productImage').src = image;
        productCard.querySelector('.category').textContent = category;
        productCard.querySelector('.productImage').alt = name;
        productCard.querySelector('.productPrice').textContent = `$${(lsActualData.price * lsActualData.quantity).toFixed(2)}`;
        productCard.querySelector('.productQuantity').textContent = lsActualData.quantity;

        // Add event listener to the stock element
        productClone.querySelector('.stockElement').addEventListener('click', (event) => {
            incrementDecrement(event, id, stock, price);
        });

        // Add event listener to remove button
        productCard.querySelector('.remove-to-cart-button').addEventListener('click', () => {
            removeProdFromCart(id);
        });

        // Append the cloned product to the container
        cartElement.appendChild(productClone);
    });
};

updateCardProductTotal();
