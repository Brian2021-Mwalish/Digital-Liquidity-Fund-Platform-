# TODO: Implement Referral Reward on Currency Rental

## Tasks
- [x] Modify MpesaCallbackView in Backend/Liquidity/payment/views.py to award half the rental amount to the referrer when a referred user makes a payment.
- [x] Import Referral model from Users.models in payment/views.py.
- [x] In the callback, after updating the user's wallet, check if user.referred_by exists.
- [x] Calculate half_amount = amount / 2.
- [x] Update referrer's wallet balance by adding half_amount.
- [x] Find or create the Referral object and update the reward field by adding half_amount.
- [x] Test the implementation by running Django check for syntax errors.
- [x] Verify that the code has no import or syntax issues.
