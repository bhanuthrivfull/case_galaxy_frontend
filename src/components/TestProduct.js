import { Box, Grid } from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify';

const TestProduct = () => {

    const API_BASE_URL = process.env.REACT_APP_API_URL || "https://case-galaxy-backend-2ow1.onrender.com/api";
    const [products, setProducts] = useState([]);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/products`);
            setProducts(response.data);
        } catch (err) {
            toast.error("Error loading products");
        }
    };

    const [exchangeRates, setExchangeRates] = useState({});
    const [currency, setCurrency] = useState("INR");

    const getCurrencyFromLanguage = () => {
        const lang = localStorage.getItem("selectedLanguage");
        if (lang === "zh-TW") return "CNY";
        return "INR";
    };

    useEffect(() => {
        fetch("https://api.exchangerate-api.com/v4/latest/INR")
            .then(res => res.json())
            .then(data => setExchangeRates(data.rates))
            .catch(error => console.error("Error fetching exchange rates:", error));

        setCurrency(getCurrencyFromLanguage());
    }, []);


    const orgPrice =499
    const conOrgPrice = exchangeRates[currency]
      ? (orgPrice * exchangeRates[currency]).toFixed(2)
      : orgPrice;
  
    const actualPrice = 99
    const conActPrice = exchangeRates[currency]
    ? (actualPrice * exchangeRates[currency]).toFixed(2)
    : actualPrice;
  
  

    return (
        <div className='border'>
            <Grid container
                spacing={2}
                sx={{ display: "flex", justifyContent: "center" }}>
                {products.map(product => {
                    const convertedPrice = exchangeRates[currency]
                        ? (product.price * exchangeRates[currency]).toFixed(2)
                        : product.price;

                    return (
                        <Grid item xs={12} sm={6} key={product._id}>
                            <h2 key={product.id}>
                                {convertedPrice}
                            </h2>
                        </Grid>
                    );
                })}
            </Grid>

            <h4>{conOrgPrice}</h4>
            <h4>{conActPrice}</h4>
        </div>
    )
}

export default TestProduct;