/**
 * Module dependencies.
 */

var express = require('express'),
    app = express(),
    http = require('http'),
    server = http.createServer(app),
    path = require('path'),
    url = require('url'),
    util = require('util'),
    io = require('socket.io').listen(server);


// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
//app.use(express.logger('dev'));
//app.use(express.json());
//app.use(express.urlencoded());
//app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

app.get('/', function (req, res){
    res.render('index', {title: 'CoverFlow'});
});

io.sockets.on('connection', function (socket){
    socket.on('submit', function (path){
        var catalogId,
            matches,
            error = '{"errors": {"message": "%s"}}';
        //получаю код каталога
        if (matches = /(\d+)\/?$/.exec(path)) {
            catalogId = matches[1];
            http
                .get('http://megavisor.com/export/catalog.json?uuid=' + catalogId,function (res){
                    var data = '';

                    res.setEncoding('utf-8');
                    res.on('data', function (chunk){
                        data += chunk;
                    });
                    res.on('end', function (){
                        socket.emit('result', data);
                    });
                }).on('error', function (e){
                    console.error(e.message);
                    socket.emit('result', util.format(error, e.message));
                });
        } else {
            socket.emit('result', util.format(error, 'catalog id not found!'));
        }
    });
});
server.listen(app.get('port'), function (){
    console.log('Express server listening on port ' + app.get('port'));
});
