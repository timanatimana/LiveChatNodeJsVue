![addev live chat img](/public/addev-livechat.png)

# Live chat web app with Node.Js + Express - Socket.IO - Vue.Js 3 - Typescript - Mongoose (MongoDB)

This project is set up as a monorepo with the client written in Vue.Js 3 + Typescript located in `./src` folder and a Node.Js + Express + Typescript backend located in `./server` folder. Communication for the live chat is done with Socket.IO.

This was my first attempt to write a small app with a Node.Js backend. It was also my first time using MongoDB and Socket.IO. This project is not completed yet but it is operable with the most important things running. 

In the near future I'd like to add some tests, localization, and a more secure way of client-server communication. Layout could also be improved ^^.

## Try it out live

This project can be tested out live - I deployed the client on [Netlify](https://www.netlify.com/) and the backend on [render](https://dashboard.render.com/). 

Take a look at [addev - live chat](https://addev-livechatvue.netlify.app/).

You will need to create two accounts to be able to chat (or you are lucky and there is someone else online). I recommend to use temporary emails such as [temp-mail](https://temp-mail.org/) or [tempmailo](https://tempmailo.com/) to get registered. You can afterwards delete your account in the `/profile` section of the app. 

You can also use the following two accounts to quickly have a look, you can change avatar and username, but please don't delete these accounts: 
1. EmaiL: '7fd1a7a94d@fireboxmail.lol' / Password: 'password4321'
2. EmaiL: 'h7eidaawz@qiott.com' / Password: 'password4321'

## Try it out on your local machine

If you want to try it out locally, download the repository, set up a MongoDB test database, and define your `.env` file. Then run the following commands and scripts defined in `package.json`:

1. Run the following to install all required node modules

```sh
$ npm install
```

2. Run the following scripts

```sh
$ npm run build
$ npm run dev
```

If you want to build or start client or server seperatly, use the following scripts:

client
```sh
$ npm run build:client
$ npm run dev:server
```

server
```sh
$ npm run build:client
$ npm run dev:server
```

