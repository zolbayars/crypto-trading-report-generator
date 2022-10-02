# crypto-trading-report-generator

Currently it shows an arbitrary last week trade activity from Binance Futures. You can copy-paste the report table data into your own trading journal sheet.

_In future, we might add other exchanges._

## Running locally

Clone the repo first.

```
git clone https://github.com/zolbayars/crypto-trading-report-generator
cd crypto-trading-report-generator
```

### Backend

You need to create a `.env` file by copying `.env.sample` file inside `/backend` and provide your Binance API credentials. Please only enable reading access for your API key!

```
cd backend
yarn start:dev
```

### Frontend

You need to create a `.env.local` file by copying `.env.local.sample` file inside `/frontend` and provide everything detailed in there.

```
cd frontend
yarn start
```

## Screenshots

**v0.1**

![image](https://user-images.githubusercontent.com/3589907/193196358-721af7e2-ca05-4f49-a5ce-3d949f813388.png)
