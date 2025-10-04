# Order Troubleshooting Guide

## ✅ Order System Fixed!

The order creation system has been improved with better error handling and validation.

## 🔧 What Was Fixed

### 1. **Better Error Messages**
Now you'll see specific error messages:
- "Product not found" - If product doesn't exist
- "Insufficient stock" - Shows available vs requested quantity
- "No products in order" - If cart is empty

### 2. **Improved Stock Validation**
- Validates each product before creating order
- Shows exact stock availability
- Prevents overselling

### 3. **Enhanced Logging**
Server now logs:
- Order creation attempts
- Product validation results
- Stock levels
- Success/failure reasons

## 🛠️ How to Place an Order

### Step 1: Make Sure You're Logged In
```
1. Go to http://localhost/
2. Click "Sign In" or "Register"
3. Login with your credentials
```

### Step 2: Add Products to Cart
```
1. Go to "Shop" page
2. Click "Add to Cart" on products you want
3. Check the cart icon in navbar
```

### Step 3: Checkout
```
1. Click the cart icon
2. Review your items
3. Click "Checkout" or "Place Order"
```

## 🐛 Common Issues & Solutions

### Issue 1: "Failed to place order"

**Possible Causes:**
1. **Not logged in**
   - Solution: Login first at http://localhost/

2. **Product out of stock**
   - Solution: Check product stock on shop page
   - The system now shows exact stock levels

3. **Network error**
   - Solution: Check if server is running
   ```powershell
   kubectl get pods -l app=dress-dock-server
   ```

### Issue 2: "Insufficient stock"

**What it means:**
You're trying to order more items than available.

**Solution:**
- Reduce quantity in cart
- Check product page for available stock
- The error message shows: "Available: X, Requested: Y"

### Issue 3: "Product not found"

**What it means:**
The product was deleted or doesn't exist.

**Solution:**
- Refresh the shop page
- Remove item from cart
- Try adding the product again

### Issue 4: "No products in order"

**What it means:**
Your cart is empty.

**Solution:**
- Add products to cart first
- Make sure cart isn't cleared

## 📊 Check Order Status

### View Server Logs
```powershell
kubectl logs -l app=dress-dock-server --tail=50
```

Look for:
- "Creating order for user: ..." - Order attempt
- "Order total: ..." - Calculated total
- "Order created successfully: ..." - Success
- "Order creation error: ..." - Failure reason

### Check Product Stock
```powershell
curl http://localhost/api/products
```

### Test Order API Directly
```powershell
# First, login and get token
$response = curl http://localhost/api/auth/login -Method POST -Body '{"email":"test@example.com","password":"password123"}' -ContentType 'application/json' | ConvertFrom-Json
$token = $response.token

# Then create order
$orderData = @{
  products = @(
    @{
      productId = "PRODUCT_ID_HERE"
      quantity = 1
    }
  )
} | ConvertTo-Json

curl http://localhost/api/orders -Method POST -Body $orderData -ContentType 'application/json' -Headers @{Authorization="Bearer $token"}
```

## 🔍 Debug Steps

### 1. Check if you're authenticated
```powershell
# Open browser DevTools (F12)
# Go to Application > Local Storage
# Look for 'auth_token'
```

### 2. Check server is running
```powershell
kubectl get pods
# dress-dock-server pods should be Running
```

### 3. Check MongoDB is running
```powershell
kubectl get pods -l app=mongodb
# Should show Running status
```

### 4. Test API health
```powershell
curl http://localhost/api/health
# Should return: {"status":"ok"}
```

### 5. Check products exist
```powershell
curl http://localhost/api/products
# Should return array of products
```

## 📝 Order API Endpoint

**Endpoint:** `POST /api/orders`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "products": [
    {
      "productId": "68e003d14bbfdc2182c48444",
      "quantity": 2
    }
  ]
}
```

**Success Response (201):**
```json
{
  "_id": "...",
  "user": "...",
  "products": [...],
  "total": 49.98,
  "status": "pending",
  "createdAt": "..."
}
```

**Error Responses:**

**400 - Bad Request:**
```json
{
  "message": "Insufficient stock for Men's T-Shirt. Available: 5, Requested: 10"
}
```

**404 - Not Found:**
```json
{
  "message": "Product 123abc not found"
}
```

**401 - Unauthorized:**
```json
{
  "message": "No token, authorization denied"
}
```

## ✅ Verification Steps

After the fix, orders should work if:

1. ✅ You're logged in (have valid JWT token)
2. ✅ Products exist in database
3. ✅ Products have sufficient stock
4. ✅ Server is running
5. ✅ MongoDB is connected

## 🎯 Test the Fix

1. **Login:**
   - Go to http://localhost/
   - Click "Sign In"
   - Use: test@example.com / password123

2. **Add to Cart:**
   - Go to Shop
   - Click "Add to Cart" on any product

3. **Place Order:**
   - Click cart icon
   - Click "Checkout" or "Place Order"
   - Should succeed!

## 📞 Still Having Issues?

Check the server logs for detailed error messages:

```powershell
kubectl logs -l app=dress-dock-server --tail=100
```

Look for lines starting with:
- "Creating order for user:" - Shows order attempt
- "Product not found:" - Product doesn't exist
- "Insufficient stock for:" - Not enough stock
- "Order created successfully:" - Success!
- "Order creation error:" - General error

## 🔄 Reset If Needed

If orders are still failing, try:

1. **Reseed products:**
```powershell
$podName = (kubectl get pods -l app=dress-dock-server -o jsonpath='{.items[0].metadata.name}')
kubectl exec $podName -- node seed.js
```

2. **Restart server:**
```powershell
kubectl rollout restart deployment dress-dock-server
```

3. **Clear browser cache and re-login**

---

**Your order system is now fixed with better error handling! Try placing an order at http://localhost/** 🎉
