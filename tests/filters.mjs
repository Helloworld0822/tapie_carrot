import assert from 'node:assert/strict';
const base=process.env.TEST_BASE_URL||'http://localhost:3113';
const unique=crypto.randomUUID();
const r=await fetch(base+'/api/auth/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:`${unique}@test.com`,password:'password123',name:'필터검증'})});
assert.equal(r.status,201);const cookie=r.headers.get('set-cookie').split(';')[0];
for(let i=0;i<102;i++){const response=await fetch(base+'/api/items',{method:'POST',headers:{'Content-Type':'application/json',cookie},body:JSON.stringify({title:unique,price:i===0?0:i,location:i===0?'오래된동네':'새동네'})});assert.equal(response.status,201);}
const get=async params=>fetch(base+'/api/items?'+new URLSearchParams({q:unique,...params})).then(r=>r.json());
assert.equal((await get({price:'free'})).length,1);
assert.equal((await get({region:'오래된동네'})).length,1);
assert.equal((await get({sort:'low'}))[0].price,0);
assert.equal((await get({sort:'high'}))[0].price,101);
assert.ok((await fetch(base+'/api/items/regions').then(r=>r.json())).includes('오래된동네'));
console.log('PASS: 102개 상품에서 오래된 상품 지역/나눔 필터 및 가격 정렬');
