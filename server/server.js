require('dotenv').config();

const express = require('express');
const app = express();
const cors = require("cors")

app.use(express.json());
app.use(
    cors({
      origin: "*",
    })
  )
  const path = require('path');
  app.use(express.static(path.join(__dirname, '..', 'public')));


const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY);


// storedItems are the products that will be available for purchase
const storedItems = [
    { id: 1 , name: 'Learn react Today', description: 'Description for Item 1', amount: 2000, currency: 'usd' },
    { id: 2, name: 'Learn Css Today', description: 'Description for Item 2', amount: 3000, currency: 'usd' },
    { id: 3, name: 'Learn js', description: 'Description for Item 3', amount: 1500, currency: 'usd' },
];

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});


app.post('/create-checkout-session', async (req, res) => {
    const { items } = req.body;

    try {
        // Aici se creeaza sesiunea de checkout cu Stripe
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'], // ce fel de plata accepta
            line_items: items.map(item => { // pentru fiecare produs din items, se creeaza un obiect cu datele necesare
                const storedItem = storedItems.find(i => i.id === item.id);
                if (!storedItem) {
                    throw new Error(`Item with id ${item.id} not found`);
                }
                return {
                    price_data: {
                        currency: storedItem.currency,
                        product_data: {
                            name: storedItem.name,
                            description: storedItem.description,
                        },
                        unit_amount: storedItem.amount,
                    },
                    quantity: item.quantity,
                };
            }),
            mode: 'payment', // modalitatea de plata(poate fii si subscription)
            // URL-urile la care se va redirectiona utilizatorul dupa ce a facut plata
            success_url: `${req.headers.origin}/success`,
            // URL-urile la care se va redirectiona utilizatorul daca a anulat plata
            cancel_url: `${req.headers.origin}/cancel`,
        });
        console.log('Checkout Session Created:', session);
        res.json({ url: session.url }); // trimite URL-ul de checkout catre client
    } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.listen(3000, () => {
    console.log('Server is running on port 3000');
});