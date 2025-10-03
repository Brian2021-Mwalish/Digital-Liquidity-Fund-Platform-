# TODO: Update Registration and Login for Better Error Handling and Strong Password Enforcement

## Tasks
- [x] Update RegisterSerializer in Backend/Liquidity/Users/serializers.py to include password strength validation
- [x] Update RegisterView in Backend/Liquidity/Users/views.py to use RegisterSerializer for consistent error handling
- [x] Verify that frontend Register.jsx properly displays all backend errors and success messages
- [x] Update LoginView and GoogleLoginView in Backend/Liquidity/Users/views.py to return "detail" instead of "error" for consistent error communication
- [x] Verify that frontend Login.jsx properly displays all backend errors and success messages

## Notes
- Frontend already has client-side validation and toast notifications for errors and success
- Backend will now enforce password strength server-side as well
- Ensure email uniqueness errors are properly communicated
