"use strict";

const fs = require('fs');  
const path = require('path');  
const http = require('http');

const staticBasePath = './';
const port = 8888;

const server = (req, res) => {  

    fs.readFile(path.join(path.resolve(staticBasePath), req.url), (err, data) => {
        if (err) {
            res.writeHead(404, 'Not Found');
            res.write('404: File Not Found!');
            return res.end();
        }

        res.statusCode = 200;

        res.write(data);
        return res.end();
    });

};

const httpServer = http.createServer(server);

console.log(`Express server listening on port: ${port}`);

httpServer.listen(port); 