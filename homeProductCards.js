const cartValue = document.querySelector('#cartValue')
export const updateCartValue = (cartProducts) => {

  return (cartValue.innerHTML = `<i class="fa-solid fa-cart-shopping"> 
${cartProducts.length}</i>
`)
}

//Add to cart button
export const getCardFromLocatST = () => {
  let cartProducts = localStorage.getItem('cardProductsLs')
  if (!cartProducts) {
    return [];
  }
  cartProducts = JSON.parse(cartProducts);
  //update cart button value
  updateCartValue(cartProducts);
  return cartProducts;
}
getCardFromLocatST();

export  function showToast(operation,id){
  const toast = document.createElement("div")
  toast.classList.add("toast");
  if(operation === "add"){
      toast.textContent= `Product ${id} deleted`
  }
  else{
      toast.textContent= `Product ${id} added`
  }
  document.body.appendChild(toast);
   // Automatically remove the toast after a few seconds
setTimeout(() => {
  toast.remove();
}, 2000);
} 

export const addToCart = (event, id, stock) => {
  let arrLocalStorage = getCardFromLocatST();
  const CurrProdElem = document.querySelector(`#card${id}`);
  let quantity = CurrProdElem.querySelector('.productQuantity').innerText;
  let price = CurrProdElem.querySelector('.productPrice').innerText;
  //console.log(quantity,price);
  price = price.replace('$', "")
  let existingProduct = arrLocalStorage.find((curProd) => curProd.id === id);

  if (existingProduct && quantity > 1) {
    quantity = parseInt(quantity, 10);

    quantity = Number(existingProduct.quantity) + quantity;
    price = Number(price * quantity);
    let updateCart = { id, quantity, price };
    updateCart = arrLocalStorage.map((curProd) => {
      return curProd.id === id ? updateCart : curProd;
    })
    localStorage.setItem('cardProductsLs', JSON.stringify(updateCart))

  }

  if (existingProduct) {
    return false
  }
  price = Number(price * quantity);
  quantity = Number(quantity);
  // let updateCart = {id,quantity,price};
  arrLocalStorage.push({ id, quantity, price })
  localStorage.setItem('cardProductsLs', JSON.stringify(arrLocalStorage))
  //update cart button value
  updateCartValue(arrLocalStorage);
  showToast("delete", id);


}

export const homeQuantityToggle = (event, id, stock) => {
  const cardElement = document.querySelector(`#card${id}`);
  console.log(cardElement);

  if (!cardElement) {
    console.error(`Element with id card${id} not found.`);
    return;
  }

  // Assuming you want to handle increment and decrement actions
  const incrementBtn = cardElement.querySelector('.cartIncrement');
  const decrementBtn = cardElement.querySelector('.cartDecrement');
  const quantityElement = cardElement.querySelector('.productQuantity');
  let quantity = parseInt(quantityElement.textContent, 10);

  if (event.target === incrementBtn) {
    if (quantity < stock) {
      quantity++;
    } else {
      alert('Stock limit reached');
    }
  } else if (event.target === decrementBtn) {
    if (quantity > 1) {
      quantity--;
    }
  }

  quantityElement.textContent = quantity;
};

function showProductContainer(products) {
  if (!Array.isArray(products)) {
    console.error('Expected an array but got:', products);
    return false;
  }

  const productContainer = document.querySelector('#productContainer');
  const productTemplate = document.querySelector('#productTemplate');

  products.forEach((curProd) => {
    const { brand, category, id, image, name, price, stock, description } = curProd;

    const productClone = document.importNode(productTemplate.content, true);

    // Set unique id for each card
    const cardElement = productClone.querySelector('.cards');
    cardElement.setAttribute("id", `card${id}`);

    productClone.querySelector('.productName').textContent = name;
    productClone.querySelector('.productImage').src = image;
    productClone.querySelector('.productImage').alt = name;
    productClone.querySelector('.productPrice').textContent = `$${price}`;
    productClone.querySelector('.category').textContent = category;
    //   productClone.querySelector('.productDescription').textContent = description;
    productClone.querySelector('.productStock').textContent = stock;
    productClone.querySelector('.productActualPrice').textContent = `$${price * 2}`;

    // Add event listener to the stock element
    const stockElement = productClone.querySelector('.stockElement');
    stockElement.addEventListener('click', (event) => {
      homeQuantityToggle(event, id, stock, price);
    });

    productClone.querySelector('.add-to-cart-button').addEventListener('click', (event) => {
      addToCart(event, id, stock)
    })

    productContainer.appendChild(productClone);
  });
}



// Attach the function to the global object
window.showProductContainer = showProductContainer;
