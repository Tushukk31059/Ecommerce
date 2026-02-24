import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Toaster } from './components/ui/sonner'
import { Provider } from 'react-redux'
import store from './redux/store'
import { PersistGate } from 'redux-persist/integration/react'
import{ persistStore} from 'redux-persist'

// ✅ Stripe imports
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

let persistor = persistStore(store);

// ✅ Load Stripe using publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_KEY_ID);


createRoot(document.getElementById('root')).render(

  <StrictMode>
   <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <Elements stripe={stripePromise}>
     <App />
    <Toaster/>
    </Elements>
    </PersistGate>
   </Provider>
  </StrictMode>,
)
