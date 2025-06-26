> 原生api
> Socket.io

+ [WebSockets原理，握手和代码实现！用Socket.io制作实时聊天室](https://www.bilibili.com/video/BV1n3411u7uf/?spm_id_from=333.337.search-card.all.click&vd_source=6997c0a04f6a78d03d30de86e9b949d9)
+ [nodejs 聊天室](https://www.bilibili.com/video/BV1cV4y1B7P4?spm_id_from=333.788.videopod.episodes&vd_source=6997c0a04f6a78d03d30de86e9b949d9&p=56)
# 原生 & Socket.io

+ 原生的api是只接受message事件的，socket.io可以解决这一点(自定义事件)
	+ 甚至还可以兼容低版本浏览器，降级到http长轮训
+ 但是如果你前端用了这个库，那么后端也需要使用，因为他是基于原生api封装了比较特殊的数据格式
+ 如果后端使用原生的api可能不好处理这个格式

# 聊天室

## 设计点

对于聊天室
+ client & server 相互通信
+ server对于其他client的广播
+ 由于socket其实也就是一个路由处理，所以还是需要在外部维护一个数据 记录需要的状态(房间名 人数什么的)

## 后端api

```js
import { Server } from 'socket.io'
import http from 'http'

const server = http.createServer(app)
const io = new Server(server, { cors: true }) //允许跨域 

io.on('connection', (socket) => {
	socket.on
	socket.emit
	socket.broadcast.emit // 全员
	socket.broadcast.to // 指定xx，但是自己收不到的
```

## code

```js
import http from 'http'
import { Server } from 'socket.io'
import express from 'express'

const app = express()
app.use('*', (req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");
    res.setHeader("Access-Control-Allow-Methods", "*");
    next()
})
const server = http.createServer(app)
const io = new Server(server, {
    cors: true //允许跨域
})
const groupList = {}
/**
 * [{1008:[{name,room,id}]}]
 */
io.on('connection', (socket) => {
    //加入房间
    socket.on('join', ({ name, room }) => {
        socket.join(room)
        if (groupList[room]) {
            groupList[room].push({ name, room, id: socket.id })
        } else {
            groupList[room] = [{ name, room, id: socket.id }]
        }
        socket.emit('message', { user: '管理员', text: `${name}进入了房间` })
        socket.emit('groupList', groupList)
        socket.broadcast.emit('groupList', groupList)
    })
    //发送消息
    socket.on('message', ({ text, room, user }) => {
        socket.broadcast.to(room).emit('message', {
            text,
            user
        })
    })
    //断开链接内置事件
    socket.on('disconnect', () => {
        Object.keys(groupList).forEach(key => {
            let leval = groupList[key].find(item => item.id === socket.id)
            if (leval) {
                socket.broadcast.to(leval.room).emit('message', { user: '管理员', text: `${leval.name}离开了房间` })
            }
            groupList[key] = groupList[key].filter(item => item.id !== socket.id)
        })
        socket.broadcast.emit('groupList', groupList)
    })
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});
```

```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
        * {
            padding: 0;
            margin: 0;
        }

        html,
        body,
        .room {
            height: 100%;
            width: 100%;
        }

        .room {
            display: flex;
        }

        .left {
            width: 300px;
            border-right: 0.5px solid #f5f5f5;
            background: #333;
        }

        .right {
            background: #1c1c1c;
            flex: 1;
            display: flex;
            flex-direction: column;
        }

        .header {
            background: #8d0eb0;
            color: white;
            padding: 10px;
            box-sizing: border-box;
            font-size: 20px;
        }

        .main {
            flex: 1;
            padding: 10px;
            box-sizing: border-box;
            font-size: 20px;
            overflow: auto;
        }

        .main-chat {
            color: green;
        }

        .footer {
            min-height: 200px;
            border-top: 1px solid green;
        }

        .footer .ipt {
            width: 100%;
            height: 100%;
            color: green;
            outline: none;
            font-size: 20px;
            padding: 10px;
            box-sizing: border-box;
        }

        .groupList {
            height: 100%;
            overflow: auto;
        }

        .groupList-items {
            height: 50px;
            width: 100%;
            background: #131313;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
        }
    </style>
</head>
<div class="room">
    <div class="left">
        <div class="groupList">

        </div>
    </div>
    <div class="right">
        <header class="header">聊天室</header>
        <main class="main">

        </main>
        <footer class="footer">
            <div class="ipt" contenteditable></div>
        </footer>
    </div>
</div>

<body>
    <script type="module">
        const sendMessage = (message) => {
            const div = document.createElement('div');
            div.className = 'main-chat';
            div.innerText = `${message.user}:${message.text}`;
            main.appendChild(div)
        }
        const groupEl = document.querySelector('.groupList');
        const main = document.querySelector('.main');
        import { io } from "https://cdn.socket.io/4.7.4/socket.io.esm.min.js";
        const name = prompt('请输入你的名字');
        const room = prompt('请输入房间号');
        const socket = io('ws://localhost:3000');
        //键盘按下发送消息
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const ipt = document.querySelector('.ipt');
                socket.emit('message', {
                    text: ipt.innerText,
                    room: room,
                    user: name
                });
                sendMessage({
                    text: ipt.innerText,
                    user: name,
                })
                ipt.innerText = '';
                
            }
        })
        //连接成功socket
        socket.on('connect', () => {
            socket.emit('join', { name, room });//加入一个房间
            socket.on('message', (message) => {
                sendMessage(message)
            })
            socket.on('groupList', (groupList) => {
                console.log(groupList);
                groupEl.innerHTML = ''
                Object.keys(groupList).forEach(key => {
                    const item = document.createElement('div');
                    item.className = 'groupList-items';
                    item.innerText = `房间名称:${key} 房间人数:${groupList[key].length}`
                    groupEl.appendChild(item)
                })
            })
        })
    </script>
</body>

</html>
```