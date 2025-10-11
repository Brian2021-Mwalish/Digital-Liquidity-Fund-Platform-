# TODO: Implement Missing Endpoints for Earnings and Pending Returns

- [x] Create rentals Django app structure (models.py, views.py, urls.py, apps.py, __init__.py, migrations/__init__.py)
- [ ] Define Rental model in rentals/models.py (user, currency, amount, expected_return, status, created_at)
- [ ] Create PendingReturnsView in rentals/views.py (sum expected_return for active rentals)
- [ ] Set up rentals/urls.py with pending-returns/ path
- [ ] Add "rentals" to INSTALLED_APPS in settings.py
- [ ] Include api/rentals/ in main urls.py
- [ ] Add EarningsView to payment/views.py (sum amount_deducted for completed payments this month)
- [ ] Add earnings/ path to payment/urls.py
- [x] Modify MpesaPaymentView and MpesaCallbackView to create Rental instances on payment completion
- [ ] Run makemigrations and migrate for rentals app
- [ ] Test endpoints to ensure correct data return
