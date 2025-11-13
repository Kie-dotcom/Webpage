// JavaScript for functional buttons and cart
document.addEventListener('DOMContentLoaded', function() {
  const cart = document.getElementById('cart');
  const cartItems = document.getElementById('cart-items');
  const cartTotal = document.getElementById('cart-total');
  const checkoutBtn = document.getElementById('checkout-btn');
  const cartToggle = document.querySelector('.cart-toggle');
  let cartData = {}; // Object to hold item names and quantities

  // Toggle cart visibility
  cartToggle.addEventListener('click', function() {
    cart.classList.toggle('open');
  });

  // Function to update cart display
  function updateCart() {
    cartItems.innerHTML = '';
    let total = 0;
    for (const [name, { quantity, price }] of Object.entries(cartData)) {
      const itemTotal = quantity * price;
      total += itemTotal;
      const itemDiv = document.createElement('div');
      itemDiv.className = 'cart-item';
      itemDiv.innerHTML = `
        <span>${name} (x${quantity}) - $${itemTotal.toFixed(2)}</span>
        <button class="remove-btn" data-name="${name}">Remove</button>
      `;
      cartItems.appendChild(itemDiv);
    }
    cartTotal.textContent = total.toFixed(2);
  }

  // Add to cart functionality
  document.querySelectorAll('.order-btn').forEach(button => {
    button.addEventListener('click', function() {
      const name = this.getAttribute('data-name');
      const price = parseFloat(this.getAttribute('data-price'));
      if (cartData[name]) {
        cartData[name].quantity += 1;
      } else {
        cartData[name] = { quantity: 1, price: price };
      }
      updateCart();
      cart.classList.add('open'); // Open cart when item is added
      alert(`${name} added to cart!`);
    });
  });

  // Remove from cart functionality
  cartItems.addEventListener('click', function(e) {
    if (e.target.classList.contains('remove-btn')) {
      const name = e.target.getAttribute('data-name');
      delete cartData[name];
      updateCart();
    }
  });

  // Checkout functionality
  checkoutBtn.addEventListener('click', function() {
    if (Object.keys(cartData).length === 0) {
      alert('Your cart is empty!');
    } else {
      openPaymentModal();
    }
  });

  // Payment modal functionality
  const paymentModal = document.getElementById('payment-modal');
  const closeModal = document.getElementById('close-modal');
  const paymentForm = document.getElementById('payment-form');
  const paymentMode = document.getElementById('payment-mode');
  const paymentMethod = document.getElementById('payment-method');
  const paymentMethodContainer = document.getElementById('payment-method-container');
  const onlinePaymentFields = document.getElementById('online-payment-fields');
  const cashPaymentFields = document.getElementById('cash-payment-fields');

  function openPaymentModal() {
    // Populate order summary
    const paymentOrderItems = document.getElementById('payment-order-items');
    const paymentTotal = document.getElementById('payment-total');
    paymentOrderItems.innerHTML = '';
    
    for (const [name, { quantity, price }] of Object.entries(cartData)) {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'order-item';
      itemDiv.textContent = `${name} (x${quantity}) - $${(quantity * price).toFixed(2)}`;
      paymentOrderItems.appendChild(itemDiv);
    }
    paymentTotal.textContent = cartTotal.textContent;
    
    paymentModal.classList.add('show');
  }

  closeModal.addEventListener('click', function() {
    paymentModal.classList.remove('show');
  });

  // Close modal when clicking outside
  paymentModal.addEventListener('click', function(e) {
    if (e.target === paymentModal) {
      paymentModal.classList.remove('show');
    }
  });

  // Payment mode change
  paymentMode.addEventListener('change', function() {
    const mode = this.value;
    paymentMethodContainer.style.display = 'none';
    onlinePaymentFields.style.display = 'none';
    cashPaymentFields.style.display = 'none';
    paymentMethod.innerHTML = '<option value="">Select Method</option>';

    if (mode === 'online') {
      paymentMethodContainer.style.display = 'block';
      paymentMethod.innerHTML = `
        <option value="">Select Method</option>
        <option value="credit-card">Credit Card</option>
        <option value="debit-card">Debit Card</option>
        <option value="paypal">PayPal</option>
        <option value="gcash">GCash</option>
        <option value="maya">Maya (PayMaya)</option>
      `;
      paymentMethod.required = true;
    } else if (mode === 'cash') {
      cashPaymentFields.style.display = 'block';
      paymentMethod.required = false;
    }
  });

  // Payment method change
  paymentMethod.addEventListener('change', function() {
    const method = this.value;
    onlinePaymentFields.style.display = 'none';
    
    if (method === 'credit-card' || method === 'debit-card') {
      onlinePaymentFields.style.display = 'block';
      document.getElementById('card-number').required = true;
      document.getElementById('expiry-date').required = true;
      document.getElementById('cvv').required = true;
      document.getElementById('cardholder-name').required = true;
    } else if (method === 'paypal' || method === 'gcash' || method === 'maya') {
      // For other methods, just show confirmation
      document.getElementById('card-number').required = false;
      document.getElementById('expiry-date').required = false;
      document.getElementById('cvv').required = false;
      document.getElementById('cardholder-name').required = false;
    }
  });

  // Input validation handlers
  const cardNumberInput = document.getElementById('card-number');
  const expiryDateInput = document.getElementById('expiry-date');
  const cvvInput = document.getElementById('cvv');
  const cardholderNameInput = document.getElementById('cardholder-name');
  const customerNameInput = document.getElementById('customer-name');

  // Card number: only digits and auto-format with spaces
  cardNumberInput.addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 16) value = value.slice(0, 16);
    let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
    e.target.value = formattedValue;
  });

  // Validate card number on blur
  cardNumberInput.addEventListener('blur', function(e) {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length < 13 || value.length > 16) {
      e.target.setCustomValidity('Card number must be between 13 and 16 digits');
    } else {
      e.target.setCustomValidity('');
    }
  });

  // Expiry date: format as MM/YY
  expiryDateInput.addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    e.target.value = value;
  });

  // Validate expiry date on blur
  expiryDateInput.addEventListener('blur', function(e) {
    const value = e.target.value;
    if (value.length === 5) {
      const parts = value.split('/');
      const month = parseInt(parts[0]);
      const year = parseInt(parts[1]);
      const currentYear = new Date().getFullYear() % 100;
      const currentMonth = new Date().getMonth() + 1;
      
      if (month < 1 || month > 12) {
        e.target.setCustomValidity('Month must be between 01 and 12');
      } else if (year < currentYear || (year === currentYear && month < currentMonth)) {
        e.target.setCustomValidity('Card has expired');
      } else {
        e.target.setCustomValidity('');
      }
    } else if (value.length > 0) {
      e.target.setCustomValidity('Expiry date must be in MM/YY format');
    } else {
      e.target.setCustomValidity('');
    }
  });

  // CVV: only digits
  cvvInput.addEventListener('input', function(e) {
    e.target.value = e.target.value.replace(/\D/g, '');
  });

  // Cardholder name: only letters, spaces, hyphens, and dots
  cardholderNameInput.addEventListener('input', function(e) {
    e.target.value = e.target.value.replace(/[^A-Za-z\s\-\.]/g, '');
  });

  // Customer name: only letters, spaces, hyphens, and dots
  customerNameInput.addEventListener('input', function(e) {
    e.target.value = e.target.value.replace(/[^A-Za-z\s\-\.]/g, '');
  });

  // Form submission
  paymentForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const mode = paymentMode.value;
    const method = paymentMethod.value;
    const total = cartTotal.textContent;
    
    let message = '';
    if (mode === 'online') {
      if (method === 'credit-card' || method === 'debit-card') {
        message = `Payment successful via ${method.replace('-', ' ').toUpperCase()}!\nTotal: $${total}`;
      } else {
        message = `Payment will be processed via ${method.toUpperCase()}.\nTotal: $${total}`;
      }
    } else if (mode === 'cash') {
      const customerName = document.getElementById('customer-name').value;
      const pickupTime = document.getElementById('pickup-time').value;
      message = `Order confirmed for ${customerName}!\nCash on Pickup\nPickup Time: ${pickupTime}\nTotal: $${total}`;
    }
    
    alert(message + '\n\nThank you for your order!');
    
    // Reset everything
    cartData = {};
    updateCart();
    cart.classList.remove('open');
    paymentModal.classList.remove('show');
    paymentForm.reset();
    paymentMethodContainer.style.display = 'none';
    onlinePaymentFields.style.display = 'none';
    cashPaymentFields.style.display = 'none';
  });
});