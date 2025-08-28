function getRandomFromArray(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

var randomLabel = getRandomFromArray([2, 14, 10, 9]);
alert(randomLabel);
