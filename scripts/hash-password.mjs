import { scryptSync, randomBytes } from 'node:crypto'
import { stdin as input, stdout as output } from 'node:process'
if(!input.isTTY || !input.setRawMode){console.error('Run in an interactive private terminal; do not use command-line password arguments.');process.exit(1)}
output.write('Create Tondi admin password (hidden; at least 16 characters): ')
input.setRawMode(true);input.resume();input.setEncoding('utf8')
let password=''
try { password=await new Promise((resolve,reject)=>{
 const handler=(char)=>{
   if(char==='\u0003'){input.off('data',handler);reject(new Error('Cancelled'));return}
   if(char==='\r'||char==='\n'){input.off('data',handler);resolve(password);return}
   if(char==='\u007f'||char==='\b'){password=password.slice(0,-1);return}
   if(char.length===1&&char>=' '&&char<='~'){password+=char}
 };input.on('data',handler)
})}finally{input.setRawMode(false);input.pause();output.write('\n')}
if(password.length<16){console.error('Password too short: minimum 16 characters.');process.exit(1)}
const salt=randomBytes(24).toString('hex');const hash=scryptSync(password,salt,64).toString('hex');password='';console.log('Place ONLY this hash in Vercel environment variables:');console.log(`TONDI_ADMIN_PASSWORD_HASH=scrypt$${salt}$${hash}`)
