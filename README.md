# Second-Hand Book Exchange

A full-stack web application where users can list, discover, review, request, and sell pre-owned books with a wallet-backed purchase flow.

This project focuses on practical marketplace logic: ownership checks, authenticated actions, reviews, seller notifications, and wallet safety so users cannot place buy requests beyond available balance.

## Live Website

https://second-hand-book-exchange-b3os.onrender.com/

## Highlights

- User authentication with signup/login/logout (`Passport.js` + session-based auth)
- Create, edit, delete, and browse book listings
- Search books by title or author
- Review system with rating + comments
- Buyer-to-seller request workflow through notifications
- Wallet system with balance view and protected purchase logic
- Server-side validations using `Joi`
- Authorization middleware for owners and review authors
- Flash messages for success/error feedback

## Wallet & Buy Request Logic

The app includes marketplace wallet behavior to prevent invalid purchases:

- Every user starts with a default wallet balance (`1000`)
- On **Buy** request:
  - Buyer balance is checked and reserved before request creation
  - If balance is insufficient, request is blocked with an error message
- On **Sell** confirmation:
  - Seller wallet is credited
  - Buyer is not charged again (already reserved earlier)
- On **request removal/decline**:
  - Buyer reserved amount is refunded

This prevents negative balances and over-commitment across multiple buy attempts.

## Tech Stack

- Backend: `Node.js`, `Express`
- Database: `MongoDB`, `Mongoose`
- Templating/UI: `EJS`, `EJS-Mate`, `Bootstrap 5`, `Font Awesome`
- Authentication: `Passport`, `passport-local`, `passport-local-mongoose`
- Validation: `Joi`
- Sessions & Alerts: `express-session`, `connect-flash`

## Project Structure

```text
Second-hand-book-exchange/
  app.js
  middleware.js
  schema.js
  models/
    booklist.js
    review.js
    user.js
    buyAlert.js
  routes/
    booklist.js
    review.js
    user.js
  views/
    home.ejs
    notifications.ejs
    wallet.ejs
    booklistings/
    users/
    includes/
    layouts/
  public/
```

## Core Modules

- `booklist` model: title, author, description, price, image, owner, reviews, request status
- `user` model: email, auth credentials plugin, notifications, wallet
- `review` model: rating/comment with author reference
- `buyAlert` model: buyer + target listing references

## Key Routes

### Authentication

- `GET /signup` - signup page
- `POST /signup` - register new user
- `GET /login` - login page
- `POST /login` - authenticate user
- `GET /logout` - logout user

### Book Listings

- `GET /booklistings` - all books
- `GET /booklistings/new` - create form
- `POST /booklistings` - create listing
- `GET /booklistings/:id` - listing details
- `GET /booklistings/:id/edit` - edit form
- `PUT /booklistings/:id` - update listing
- `DELETE /booklistings/:id` - delete listing
- `POST /booklistings/search` - search by title/author
- `POST /booklistings/:ownerId/:currentUserId/:bookId/buy` - place buy request

### Reviews

- `POST /booklistings/:id/reviews` - add review
- `DELETE /booklistings/:id/reviews/:reviewId` - delete review

### Notifications & Wallet

- `GET /notifications` - seller buy request notifications
- `DELETE /notifications/:notificationId` - remove request + refund buyer
- `POST /notifications/:notificationId/:bookId/:buyerId/sell` - mark as sold
- `GET /wallet` - current user wallet

## Local Setup

### 1. Clone repository

```bash
git clone https://github.com/NandanNayak-dev/Second-hand-book-exchange.git
cd Second-hand-book-exchange
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start MongoDB

Make sure local MongoDB is running on:

```text
mongodb://127.0.0.1:27017/bookstore
```

If needed, update this connection string in `app.js`.

### 4. Run app

```bash
node app.js
```

### 5. Open in browser

```text
http://localhost:8080
```

## Validation & Authorization

- Request data validation via `Joi` schemas in `schema.js`
- Auth-required actions protected by `isLoggedIn`
- Listing edits/deletes protected by `isOwner`
- Review deletion protected by `isReviewAuthor`

## Current Status

This project is actively structured as a complete end-to-end academic/personal marketplace build with:

- authentication
- CRUD + search
- reviews
- wallet-backed transaction logic
- notification-driven selling workflow
