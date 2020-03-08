var path = require('path');

var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var http = require('http');
var port = process.env.PORT || 3001;

var app = express();

app.set('port', port);
app.set('views', __dirname);
app.engine('html', require('hogan-express'));
app.set('layout', 'index');
app.set('view engine', 'html');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

var oneDay = 86400000; // in milliseconds
app.use('/css', express.static(path.join(__dirname, './wwwroot/css'), { maxAge: oneDay }));
app.use('/fonts', express.static(path.join(__dirname, './wwwroot/fonts'), { maxAge: oneDay }));
app.use('/images', express.static(path.join(__dirname, './wwwroot/images'), { maxAge: oneDay }));
app.use('/js', express.static(path.join(__dirname, './wwwroot/js'), { maxAge: oneDay }));

app.use('/', function(req, res, next) {
    res.render(
        'index',
        function(err, html) {
            res.send(html);
        }
    );
});

var server = http.createServer(app);
server.listen(port);
server.on('listening', function() {
    var addr = server.address();
    var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
    console.log('Listening on ' + bind);
});