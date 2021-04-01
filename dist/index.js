"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const socketIo = __importStar(require("socket.io"));
const http_1 = __importDefault(require("http"));
const path_1 = __importDefault(require("path"));
const bad_words_1 = __importDefault(require("bad-words"));
const moment_1 = __importDefault(require("moment"));
const app = express_1.default();
const server = http_1.default.createServer(app);
const io = new socketIo.Server(server);
const filter = new bad_words_1.default();
const port = 4000 || process.env.PORT;
const publicPath = path_1.default.resolve(__dirname, '../public');
app.use(express_1.default.static(publicPath));
io.on('connection', (socket) => {
    socket.on('typing', (user) => {
        socket.broadcast.emit('typing', user);
    });
    socket.broadcast.emit('message', 'A new user connected!');
    socket.on('chat', (msg, callback) => {
        msg.time = moment_1.default(msg.time).format('h:mm A');
        io.emit('chat', msg);
        callback();
    });
    socket.on('disconnect', () => {
        io.emit('message', 'User disconnected!');
    });
});
server.listen(port, () => {
    console.log('in');
});
