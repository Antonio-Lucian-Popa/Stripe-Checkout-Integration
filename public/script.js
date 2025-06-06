const button = document.getElementById('button');
button.addEventListener('click', () => {
    fetch('/create-checkout-session', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            // Produsele pe care le cumpara, si cantitatiile
            items: [
                { id: 1, quantity: 1 },
                { id: 2, quantity: 2 },
            ]
        }),
    })
    .then((response) => {
        if(response.ok) return response.json();
        return response.json().then(error => { Promise.reject(error) });
    }).then(({ url}) => {
        console.log('Redirecting to:', url);
        window.location = url; // Redirect to Stripe Checkout(url care va fii generat ca sa faca plata cu stripe)
    }).catch((error) => {
        console.error('Error:', error);
        alert('An error occurred while processing your request. Please try again later.');
    });
});