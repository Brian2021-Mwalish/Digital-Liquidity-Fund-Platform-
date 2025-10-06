# TODO: Fix ReferralHistoryView to return correct data structure

- [x] Update ReferralHistoryView in Backend/Liquidity/Users/views.py to query Referral.objects.filter(referrer=request.user).select_related("referred") and return {"referrals": list of dicts with referred_name, referred_email, mobile, created_at, status, reward}
- [x] Test the API response to ensure it matches frontend expectations
