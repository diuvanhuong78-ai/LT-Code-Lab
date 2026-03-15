const apiKey = "AIzaSyAZH1NbImbwgkyQL8xveKQWJrPwWtd-0a8"; // điền API key

const systemPrompt = `
Bạn là gia sư tin học THPT.
Giải thích thuật toán dễ hiểu.
Ưu tiên C++ và Python.
`;

marked.setOptions({
highlight: function(code, lang) {
const language = hljs.getLanguage(lang) ? lang : 'plaintext';
return hljs.highlight(code, { language }).value;
},
breaks: true
});

let isWaiting = false;

function addMessage(text, type, markdown=false){

const chatBox = document.getElementById("chatBox");

const div = document.createElement("div");
div.className = `message ${type}`;

if(markdown && type==="ai"){
div.innerHTML = marked.parse(text);
}
else{
div.textContent = text;
}

chatBox.appendChild(div);
chatBox.scrollTop = chatBox.scrollHeight;

}

function addTyping(){

const chatBox = document.getElementById("chatBox");

const div = document.createElement("div");
div.id="typing";
div.className="message ai";
div.textContent="AI đang suy nghĩ...";

chatBox.appendChild(div);

}

function removeTyping(){
const t = document.getElementById("typing");
if(t) t.remove();
}

async function sendMessage(){

if(isWaiting) return;

const input = document.getElementById("userInput");
const text = input.value.trim();

if(!text) return;

addMessage(text,"user");

input.value="";

addTyping();

isWaiting=true;

const url =
`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

const body={
contents:[
{
parts:[
{ text:text }
]
}
],
systemInstruction:{
parts:[
{ text:systemPrompt }
]
}
};

try{

const res = await fetch(url,{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify(body)
});

const data = await res.json();

removeTyping();

if(data.candidates){

const reply =
data.candidates[0].content.parts[0].text;

addMessage(reply,"ai",true);

}else{

addMessage("AI không trả lời được.","ai");

}

}catch(e){

removeTyping();

addMessage("Lỗi kết nối API.","ai");

}

isWaiting=false;

}

document.getElementById("userInput")
.addEventListener("keydown",function(e){

if(e.key==="Enter" && !e.shiftKey){

e.preventDefault();

sendMessage();

}

});
