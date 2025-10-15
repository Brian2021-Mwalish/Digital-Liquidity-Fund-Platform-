# TODO: Update Rental Duration to 20 Days

## Backend Changes
- [x] Add `duration_days`, `end_date`, and `unique_id` fields to Rental model
- [x] Run migrations for new fields
- [x] Update payment/views.py to set end_date and unique_id when creating rental
- [x] Create management command to complete rentals after 20 days
- [x] Update rentals/views.py to include new fields in responses

## Frontend Changes
- [x] Update ClientDashboard.jsx text from "24 hours" to "20 days"
- [x] Add display for rental duration, end_date, and unique_id in rentals tab
- [x] Add unique process indicator (loading circular, mining animation) for active rentals

## Testing
- [x] Test rental creation with new duration
- [x] Test management command for completing rentals
- [ ] Test frontend display and uniqueness indicator
