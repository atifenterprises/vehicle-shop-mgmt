# TODO: Implement Auto-Incrementing Sl.No for Batteries

## Changes Required

### Frontend Changes
- [ ] Update Battery.jsx table to display auto-incrementing Sl.No (index + 1)
- [ ] Change edit/delete operations to use serialNumber instead of id
- [ ] Remove id from formData in Battery.jsx
- [ ] Update BatterySaleForm.jsx to use serialNumber for battery selection and updates

### Backend Changes
- [ ] Update battery API routes to use serialNumber as primary key identifier
- [ ] Change /api/batteries/:id to /api/batteries/:serialNumber
- [ ] Update all CRUD operations to use serialNumber for queries
- [ ] Update BatterySaleForm backend calls to use serialNumber

## Files to Modify
- VehicleShopMgmt/frontend/VechileShowroom/src/components/Battery.jsx
- VehicleShopMgmt/frontend/VechileShowroom/src/components/BatterySaleForm.jsx
- VehicleShopMgmt/backend/server.js

## Testing
- [ ] Test adding new batteries - Sl.No should auto-increment
- [ ] Test editing batteries using serialNumber
- [ ] Test deleting batteries using serialNumber
- [ ] Test battery sales form functionality
