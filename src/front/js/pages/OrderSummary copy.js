import React, { useState, useEffect, useContext } from "react";
import axios from 'axios';
import PropTypes from "prop-types";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Context } from "../store/appContext";
import { Navbar } from "../component/navbar";
import { Footer } from "../component/footer";
import "../../styles/summary.css";

export const OrderSummary = () => {
  const { store, actions } = useContext(Context);
  const [comment, setComment] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const { restaurantId, tableId } = useParams();
  const [paymentStatus, setPaymentStatus] = useState("")

  const totalPrice = store.cart.reduce(
    (total, meal) => total + meal.price * meal.quantity,
    0
  );
  const navigate = useNavigate();
  const handleCommentChange = (e) => {
    setComment(e.target.value);
  };


  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
  };
  const cartItems = store.cart.map(item => ({
    name: item.name,
    price: item.price,
    quantity: item.quantity
  }));

  // const handleCheckout = () => {
  //   console.log('handleCheckout called');
  //   axios
  //     .post(`${process.env.BACKEND_URL}/stripe/create-checkout-session`, {
  //       cart: cartItems,
  //       restaurantId: restaurantId,
  //       tableId: tableId
  //     })
  //     .then((response) => {
  //       console.log('Response received:', response);
  //       if (response.data.url) {
  //         window.location.href = response.data.url;
  //       }
  //     })
  //     .catch((err) => console.log(err.message));
  // };
  const handleCheckout = () => {
    console.log('handleCheckout called');
    // Guardar el carrito y otros estados en sessionStorage
    sessionStorage.setItem('cart', JSON.stringify(store.cart));
    sessionStorage.setItem('comment', comment);
    sessionStorage.setItem('restaurantId', restaurantId);
    sessionStorage.setItem('tableId', tableId);

    axios
      .post(`${process.env.BACKEND_URL}/stripe/create-checkout-session`, {
          cart: cartItems,
          restaurantId: restaurantId,
          tableId: tableId
      })
      .then((response) => {
          console.log('Response received:', response);
          if (response.data.url) {
              window.location.href = response.data.url;
          }
      })
      .catch((err) => console.log(err.message));
};

useEffect(() => {
  // Restaurar el carrito y otros estados de sessionStorage
  const savedCart = sessionStorage.getItem('cart');
  const savedComment = sessionStorage.getItem('comment');
  const savedRestaurantId = sessionStorage.getItem('restaurantId');
  const savedTableId = sessionStorage.getItem('tableId');

  if (savedCart) {
      actions.setCart(JSON.parse(savedCart)); // Implementa setCart en tu store si no lo tienes
  }
  if (savedComment) {
      setComment(savedComment);
  }
  if (savedRestaurantId && savedTableId) {
      setPaymentStatus('paid'); // Actualiza el estado para reflejar que el pago fue realizado
  }
}, []);


  const handleFinishOrder = async () => {
    if (!paymentMethod) {
      alert('Please choose your payment method!');
      return;
    }
    if (paymentStatus === 'paid') {
      await actions.addProductToTable(tableId, store.cart);

      const orderResult = await actions.createOrder(restaurantId, tableId, comment, paymentMethod, totalPrice, paymentStatus);
      if (orderResult && orderResult.id) {
        const orderId = orderResult.id;
        const invoiceResult = await actions.createInvoice(restaurantId, tableId, orderId)
          // Procesar la orden y posiblemente redirigir al usuario
      } else {
          throw new Error('Order result is undefined or missing the order ID');
      }
  } else {
      alert('Payment not completed yet!');
  }
    // if (paymentMethod === "stripe") {
    //   handleCheckout();
    // } else 
    // if (paymentMethod === "cash") {
    //   navigate(`/restaurants/${restaurantId}/tables/${tableId}/order-success`);
    // }
    
    //   // try {
    //    if (paymentStatus === 'paid') {
    //      await actions.addProductToTable(tableId, store.cart);

    //      const orderResult = await actions.createOrder(restaurantId, tableId, comment, paymentMethod, totalPrice, paymentStatus);
    //      if (orderResult && orderResult.id) {
    //       const orderId = orderResult.id;

    //        // const invoiceResult = await actions.createInvoice(restaurantId, tableId, orderId);

    //      } else {
    //        throw new Error('Order result is undefined or missing the order ID');
    //      }
    //    } else {
    //      await actions.addProductToTable(tableId, store.cart);

    //      const orderResult = await actions.createOrder(restaurantId, tableId, comment, paymentMethod, totalPrice);
    //      if (orderResult && orderResult.id) {
    //       const orderId = orderResult.id;

    //       const invoiceResult = await actions.createInvoice(restaurantId, tableId, orderId);
    //    } else {
    //       throw new Error('Order result is undefined or missing the order ID');
    //     }
    //   }
    // } catch (error) {
    //   console.error('Error finishing order:', error);
    //  alert('Error finishing order. Please try again.');
    // }
  };

  return (
    <>
      <Navbar />
      <div className="order-summary">
        <h2>Order Summary</h2>
        <ul>
          {store.cart.map((meal, index) => (
            <li key={index}>
              <div>{meal.name}</div>
              <div>x {meal.quantity}</div>
              <div className="butt">
                {meal.quantity === 1 ? (
                  <>
                    <button className='trash-icon' onClick={() => actions.removeItem(meal.id)}>
                      <i className="fa-solid fa-trash fa-xs"></i>
                    </button>
                    <button
                      className="butt1"
                      onClick={() => actions.addToCart(meal)}
                    >
                      +
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="butt1"
                      onClick={() => actions.removeFromCart(meal.id)}
                    >
                      −
                    </button>
                    <button
                      className="butt1"
                      onClick={() => actions.addToCart(meal)}
                    >
                      +
                    </button>
                  </>
                )}
              </div>

              <div>${(meal.price * meal.quantity).toFixed(2)}</div>
            </li>
          ))}
        </ul>
        <div className="total">
          <h5>Total Price: </h5>
          <h5>${totalPrice.toFixed(2)}</h5>
        </div>
        <div className="comments">
          <label htmlFor="comments">Comments:</label>
          <textarea
            id="comments"
            value={comment}
            onChange={handleCommentChange}
          ></textarea>
        </div>

        <div className="payment-method">
          <label htmlFor="payment">Payment Method:</label>
          <div className="payment-icons">
            <button className={paymentMethod === 'cash' ? 'selected' : ''} onClick={() => handlePaymentMethodChange('cash')}>
              <i className="fa-solid fa-money-bill"></i> Pay at Cashier
            </button>
            <button
              className={paymentMethod === "stripe" ? "selected" : ""}
              onClick={() => [handlePaymentMethodChange("stripe"), handleCheckout()]}
            >
              <i className="fa-solid fa-credit-card"></i> Pay with Card
            </button>
          </div>
        </div>
        <div className='order-finish'>
          <Link to={`/app/generate-qr/app/restaurants/${restaurantId}/tables/${tableId}/menu`}>
            <button className="button1">Menu</button>
          </Link>
          <button className='button1' onClick={handleFinishOrder}>Finish</button>
        </div>

      </div>
      <Footer />
    </>
  );

};

OrderSummary.propTypes = {
  match: PropTypes.object,
};