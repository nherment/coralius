# coralius

Your own website analytics

![coralius screenshot](/docs/screenshot.png)


# installation

```
git clone
cd
npm install
node server.js
```

## MongoDB

Change the username and password accordingly

```
  mongo
  > use coral;
  > db.addUser( { user: "coral", pwd: "coral", roles: ["readWrite"] });
```


# Features

## right now

- daily visitors
- monthly visitors

## in the pipeline

- page performance comparison
- respects browsers' "Do Not track" header