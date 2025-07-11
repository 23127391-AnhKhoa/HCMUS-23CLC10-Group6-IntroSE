// Test pricing logic
const testGigData = {
  price: '50',
  delivery_days: 3,
  num_of_edits: 1
};

const calculateTotalPrice = (gigData) => {
  const basePrice = parseFloat(gigData.price) || 0;
  const deliveryDays = parseInt(gigData.delivery_days) || 7;
  const numOfEdits = parseInt(gigData.num_of_edits) || 0;
  
  console.log('Input data:', { basePrice, deliveryDays, numOfEdits });
  
  // Fast delivery surcharge
  let deliverySurcharge = 0;
  if (deliveryDays === 1) {
    deliverySurcharge = basePrice * 0.5; // 50% surcharge for 1-day delivery
  } else if (deliveryDays === 2) {
    deliverySurcharge = basePrice * 0.25; // 25% surcharge for 2-day delivery  
  } else if (deliveryDays === 3) {
    deliverySurcharge = basePrice * 0.1; // 10% surcharge for 3-day delivery
  }
  
  // Extra revisions fee (more than 3 revisions)
  let revisionFee = 0;
  if (numOfEdits > 3) {
    revisionFee = (numOfEdits - 3) * (basePrice * 0.1); // 10% of base price per extra revision
  }
  
  const totalPrice = basePrice + deliverySurcharge + revisionFee;
  console.log('Price breakdown:', { basePrice, deliverySurcharge, revisionFee, totalPrice });
  
  return totalPrice;
};

console.log('Test 1 - 3 days delivery:');
console.log('Total price:', calculateTotalPrice(testGigData));

console.log('\nTest 2 - 1 day delivery:');
console.log('Total price:', calculateTotalPrice({...testGigData, delivery_days: 1}));

console.log('\nTest 3 - 5 revisions:');
console.log('Total price:', calculateTotalPrice({...testGigData, num_of_edits: 5}));

console.log('\nTest 4 - 1 day delivery + 5 revisions:');
console.log('Total price:', calculateTotalPrice({...testGigData, delivery_days: 1, num_of_edits: 5}));
