
function fetchProducts() {
  fetch('./api/product.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }
      return response.json();
    })
    .then(data => {
      if (data && Array.isArray(data.products)) {
        window.showProductContainer(data.products);
      } else {
        console.error('Data format is incorrect:', data);
      }
    })
    .catch(error => console.error('Error fetching JSON:', error));
}

// Call the fetch funwction
fetchProducts();
