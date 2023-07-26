require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const dns = require('node:dns');
const storedUrls = [];
let   count = 1;

const port = process.env.PORT || 3000;



app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

function isValidURL(string) {
  var res = string.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
  return (res !== null)
};

app.post('/api/shorturl', function(req, res) {
  let oriUrl = req.body['url'];
  console.log(oriUrl);
  if (!isValidURL(oriUrl))
    return res.json({"error": "Invalid URL"});

  const REPLACE_REGEX = /^https?:\/\//i;
  let   transfUrl = oriUrl.replace(REPLACE_REGEX, '');
  dns.lookup(transfUrl, (err, address, family) => {
    if (err)
    return res.json({"error": "Invalild URL"});
    else
    {
      if (storedUrls.filter(e => e.original_url == oriUrl).length == 0)
      {
        storedUrls.push({original_url: oriUrl, short_url: count});
        count++;
      }
      return res.json(storedUrls.find(e => e.original_url == oriUrl));
    }
  });
});

app.get('/api/shorturl/:id', (req, res) => {
  const findById = storedUrls.find(e => e.short_url == parseInt(req.params['id']));
  if (findById == undefined)
    res.json({"error": "No short URL found for the given input"});
  else
    res.redirect(findById.original_url);
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});