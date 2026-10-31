import next from 'next';
import { createServer } from 'node:http';
import { WebSocketServer, WebSocket } from 'ws';
import { db, user } from './lib/server.ts';
const dev=process.argv.includes('--dev');
const port=Number(process.env.PORT||3000);
const app=next({dev});
await app.prepare();
const handler=app.getRequestHandler();
const server=createServer((req,res)=>handler(req,res));
const wss=new WebSocketServer({noServer:true,maxPayload:8192});
const peers=new Map();
server.on('upgrade',(req,socket,head)=>{
 const url=new URL(req.url,'http://localhost');
 if(url.pathname!=='/ws/chat'){if(dev)app.getUpgradeHandler()(req,socket,head);else socket.destroy();return;}
 const origin=req.headers.origin;
 if(!origin||new URL(origin).host!==req.headers.host){socket.destroy();return;}
 const account=user(new Request('http://localhost',{headers:{cookie:req.headers.cookie||''}}));
 const id=Number(url.searchParams.get('chatId'));
 if(!account||!Number.isSafeInteger(id)||!db.prepare('SELECT id FROM chats WHERE id=? AND (buyer_id=? OR seller_id=?)').get(id,account.id,account.id)){socket.destroy();return;}
 wss.handleUpgrade(req,socket,head,ws=>{
  peers.set(ws,{id,account,cookie:req.headers.cookie||''});
  const history=db.prepare('SELECT id,sender_id,text,created_at FROM messages WHERE chat_id=? ORDER BY id').all(id);
  ws.send(JSON.stringify({type:'history',messages:history}));
  ws.on('message',raw=>{
   try{
    if(!user(new Request('http://localhost',{headers:{cookie:req.headers.cookie||''}}))){ws.close(1008,'로그인이 필요해요.');return;}
    const input=JSON.parse(raw.toString());
    if(typeof input.text!=='string'||!input.text.trim()||input.text.trim().length>2000){ws.send(JSON.stringify({type:'error',error:'메시지는 1~2000자로 입력해주세요.'}));return;}
    const result=db.prepare('INSERT INTO messages(chat_id,sender_id,text) VALUES(?,?,?)').run(id,account.id,input.text.trim());
    const message=db.prepare('SELECT id,sender_id,text,created_at FROM messages WHERE id=?').get(result.lastInsertRowid);
    for(const [peer,meta] of peers){if(meta.id!==id||peer.readyState!==WebSocket.OPEN)continue;if(!user(new Request('http://localhost',{headers:{cookie:meta.cookie}}))){peer.close(1008);continue;}peer.send(JSON.stringify({type:'message',message}));}
   }catch{ws.send(JSON.stringify({type:'error',error:'메시지를 처리하지 못했어요.'}));}
  });
  ws.on('close',()=>peers.delete(ws));
  ws.on('error',()=>peers.delete(ws));
 });
});
server.listen(port,()=>console.log(`Ready on http://localhost:${port}`));
