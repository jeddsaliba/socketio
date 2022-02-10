
# Socket.IO Node Server
This is a standalone Socket.IO service.
## Getting Started
Here are a few steps in order to integrate a working Socket.IO server on your cPanel:

1. Clone this repository to your project folder by using yout Terminal
2. In your Terminal, run `npm install` inside the folder (This will install all of the required dependencies)
~~~
npm install
~~~
3. Run `cp .env.example .env` in order to create a new .env file
~~~
cp .env.example .env
~~~
4. In your .env file, add the following:
    
    * APP_URL=
    * SSL_KEY=
    * SSL_CERT=
    * SSL_PORT=

    Example:
    * APP_URL=https://my-socket-io-website.com
    * SSL_KEY=/home/ssl/keys/<YOUR_SSL_KEY>.key
    * SSL_CERT=/home/ssl/certs/<YOUR_SSL_CERTIFICATE>.crt
    * SSL_PORT=3000

5. You can now host your Socket.IO server by running `node app` or `node app.js`

### Note
Once you have started to host the Socket.IO server via Terminal, it will automatically close when you exit your browser or close the tab where the terminal is running.

We recommend using Application Manager to automatically run the Socket.IO server without the need of running the command via Terminal.

### Donations

For donations, you may choose from the list below:

1. GCash - 09753560647
2. UnionBank - 1094 2102 3125