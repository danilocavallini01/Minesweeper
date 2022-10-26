var express = require("express");

var app = express();

app.use(express.static('public'));

app.use('/css', express.static(__dirname + '/public/css'));
app.use('/js', express.static(__dirname + '/public/js'));
app.use('/images', express.static(__dirname + '/public/images'));

app.get('/', (req, res) => {
    res
      .status(200)
      .send('Hello server is running')
      .end();
  });
   
// Start the server
const PORT = process.env.PORT || 8080;
    app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
    console.log('Press Ctrl+C to quit.');
});