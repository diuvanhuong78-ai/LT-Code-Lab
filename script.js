242.	    <script>
243.	        // API Configuration setup - provided by runtime environment
244.	        const apiKey = "AIzaSyAZH1NbImbwgkyQL8xveKQWJrPwWtd-0a8"; 
245.	 
246.	        const systemPrompt = `
247.	Bạn là một trợ lý AI chuyên dạy Tin học cho học sinh THPT Việt Nam.
248.	Mục tiêu:
249.	Giúp học sinh hiểu sâu thuật toán và ngôn ngữ lập trình.
250.	
251.	Đối tượng:
252.	- Học sinh THPT cơ bản.
253.	- Học sinh ôn thi học sinh giỏi Tin học.
254.	- Người mới bắt đầu học lập trình.
255.	
256.	Nhiệm vụ:
257.	1. Giải thích kiến thức Tin học rõ ràng, dùng ngôn ngữ dễ hiểu.
258.	2. Hướng dẫn chi tiết C++ và Python.
259.	3. Giải bài toán thuật toán.
260.	4. Dạy tư duy giải bài, không chỉ đưa code.
261.	
262.	Khi giải bài tập, CẦN theo cấu trúc sau (có thể linh hoạt bỏ qua nếu câu hỏi chỉ là lý thuyết ngắn):
263.	1. **Phân tích bài toán**: Nhận diện input, output, yêu cầu.
264.	2. **Ý tưởng giải**: Giải thích logic bằng lời văn dễ hiểu.
265.	3. **Thuật toán**: Mô tả các bước hoặc mã giả.
266.	4. **Code minh họa**: Cung cấp code C++ hoặc Python rõ ràng, có comment chi tiết từng dòng quan trọng.
267.	5. **Phân tích độ phức tạp**: Đánh giá Time (Thời gian) và Space (Không gian).
268.	6. **Ví dụ minh họa (Trace code)**: Chạy thử một ví dụ nhỏ.
269.	
270.	Phong cách:
271.	- Dễ hiểu, thân thiện, xưng "Thầy/Cô" hoặc "Tôi" và gọi "em/bạn".
272.	- Hướng dẫn từng bước.
273.	- Cực kỳ phù hợp với học sinh THPT.
274.	`;
275.	 
276.	        // Lịch sử trò chuyện để giữ ngữ cảnh (Context)
277.	        let chatHistory = [];
278.	
279.	        // Configure marked.js to use highlight.js for code blocks
280.	        marked.setOptions({
281.	            highlight: function(code, lang) {
282.	                const language = hljs.getLanguage(lang) ? lang : 'plaintext';
283.	                return hljs.highlight(code, { language }).value;
284.	            },
285.	            langPrefix: 'hljs language-',
286.	            breaks: true
287.	        });
288.	 
289.	        let isWaitingForResponse = false;
290.	        let currentAttachments = []; // Lưu trữ file đính kèm hiện tại
291.	 
292.	        // Sửa lỗi: Đã xóa phần lặp lại function toggleSidebar() bị dư thừa
293.	        function toggleSidebar() {
294.	            const sidebar = document.getElementById('sidebar');
295.	            const overlay = document.getElementById('sidebarOverlay');
296.	            sidebar.classList.toggle('-translate-x-full');
297.	            overlay.classList.toggle('hidden');
298.	        }
299.	
300.	        function handleFileSelect(event) {
301.	            const files = event.target.files;
302.	            if (!files || files.length === 0) return;
303.	
304.	            for (let file of files) {
305.	                const reader = new FileReader();
306.	                const isImage = file.type.startsWith('image/');
307.	
308.	                reader.onload = (e) => {
309.	                    if (isImage) {
310.	                        currentAttachments.push({
311.	                            name: file.name,
312.	                            isImage: true,
313.	                            mimeType: file.type,
314.	                            dataUrl: e.target.result,
315.	                            base64: e.target.result.split(',')[1]
316.	                        });
317.	                    } else {
318.	                        currentAttachments.push({
319.	                            name: file.name,
320.	                            isImage: false,
321.	                            text: e.target.result
322.	                        });
323.	                    }
324.	                    renderAttachmentPreview();
325.	                };
326.	
327.	                if (isImage) {
328.	                    reader.readAsDataURL(file);
329.	                } else {
330.	                    reader.readAsText(file);
331.	                }
332.	            }
333.	            event.target.value = ''; // Reset input
334.	        }
335.	
336.	        function renderAttachmentPreview() {
337.	            const previewContainer = document.getElementById('attachmentPreview');
338.	            previewContainer.innerHTML = '';
339.	            
340.	            currentAttachments.forEach((att, index) => {
341.	                const div = document.createElement('div');
342.	                div.className = 'relative flex items-center bg-slate-800 border border-slate-700 rounded-lg p-2 gap-2 text-sm max-w-[200px] overflow-hidden group shadow-md';
343.	                
344.	                let iconOrImg = '';
345.	                if (att.isImage) {
346.	                    iconOrImg = `<img src="${att.dataUrl}" class="w-8 h-8 object-cover rounded bg-slate-900" alt="preview">`;
347.	                } else {
348.	                    iconOrImg = `<i class="ph ph-file-code text-2xl text-indigo-400"></i>`;
349.	                }
350.	
351.	                div.innerHTML = `
352.	                    ${iconOrImg}
353.	                    <span class="truncate flex-1 text-slate-300 font-medium" title="${att.name}">${att.name}</span>
354.	                    <button onclick="removeAttachment(${index})" class="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition shadow-lg hover:bg-red-600">
355.	                        <i class="ph ph-x text-[10px] block"></i>
356.	                    </button>
357.	                `;
358.	                previewContainer.appendChild(div);
359.	            });
360.	        }
361.	
362.	        function removeAttachment(index) {
363.	            currentAttachments.splice(index, 1);
364.	            renderAttachmentPreview();
365.	        }
366.	 
367.	        function createMessageElement(type) {
368.	            const div = document.createElement("div");
369.	            div.className = "flex gap-4 items-start w-full max-w-3xl mx-auto opacity-0 transition-opacity duration-300";
370.	            
371.	            if (type === 'user') {
372.	                div.innerHTML = `
373.	                    <div class="flex-1 bg-indigo-600/20 text-indigo-100 rounded-2xl p-4 md:p-5 rounded-tr-none border border-indigo-500/30 shadow-sm ml-8 md:ml-12">
374.	                        <div class="prose prose-invert message-content whitespace-pre-wrap font-medium"></div>
375.	                    </div>
376.	                    <div class="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center shrink-0 border border-slate-600">
377.	                        <i class="ph ph-user text-xl text-slate-300"></i>
378.	                    </div>
379.	                `;
380.	            } else {
381.	                div.innerHTML = `
382.	                    <div class="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-900/20">
383.	                        <i class="ph ph-robot text-xl text-white"></i>
384.	                    </div>
385.	                    <div class="flex-1 bg-slate-800 rounded-2xl p-4 md:p-5 rounded-tl-none border border-slate-700 shadow-sm mr-2 md:mr-12 overflow-hidden">
386.	                        <div class="prose prose-invert max-w-none message-content text-slate-200"></div>
387.	                    </div>
388.	                `;
389.	            }
390.	            return div;
391.	        }
392.	 
393.	        function addMessage(text, type, isMarkdown = false, attachments = []) {
394.	            const chatBox = document.getElementById("chatBox");
395.	            const msgEl = createMessageElement(type);
396.	            const contentEl = msgEl.querySelector('.message-content');
397.	            
398.	            if (isMarkdown && type === 'ai') {
399.	                contentEl.innerHTML = marked.parse(text);
400.	            } else {
401.	                contentEl.textContent = text;
402.	            }
403.	
404.	            // Hiển thị file đính kèm trong tin nhắn của user
405.	            if (attachments && attachments.length > 0) {
406.	                let attachmentHTML = '<div class="flex flex-wrap gap-2 mt-3">';
407.	                attachments.forEach(att => {
408.	                    if (att.isImage) {
409.	                        attachmentHTML += `<img src="${att.dataUrl}" class="max-w-[200px] max-h-[200px] object-cover rounded-lg border border-slate-600/50 shadow-sm cursor-pointer hover:opacity-90 transition" onclick="window.open('${att.dataUrl}', '_blank')">`;
410.	                    } else {
411.	                        attachmentHTML += `
412.	                        <div class="flex items-center gap-2 bg-slate-800/80 p-2.5 rounded-lg border border-slate-600/50 text-sm shadow-sm">
413.	                            <i class="ph ph-file-code text-indigo-300 text-xl"></i>
414.	                            <span class="truncate max-w-[150px] text-slate-300 font-normal">${att.name}</span>
415.	                        </div>`;
416.	                    }
417.	                });
418.	                attachmentHTML += '</div>';
419.	                contentEl.insertAdjacentHTML('beforeend', attachmentHTML);
420.	            }
421.	 
422.	            chatBox.appendChild(msgEl);
423.	            
424.	            // Trigger reflow for fade-in animation
425.	            setTimeout(() => {
426.	                msgEl.classList.remove('opacity-0');
427.	                chatBox.scrollTop = chatBox.scrollHeight;
428.	            }, 50);
429.	        }
430.	 
431.	        function addTypingIndicator() {
432.	            const chatBox = document.getElementById("chatBox");
433.	            const div = document.createElement("div");
434.	            div.id = "typingIndicator";
435.	            div.className = "flex gap-4 items-start w-full max-w-3xl mx-auto opacity-0 transition-opacity duration-300";
436.	            div.innerHTML = `
437.	                <div class="w-10 h-10 rounded-full bg-indigo-600/50 flex items-center justify-center shrink-0">
438.	                    <i class="ph ph-robot text-xl text-white/70"></i>
439.	                </div>
440.	                <div class="bg-slate-800 rounded-2xl p-4 md:p-5 rounded-tl-none border border-slate-700 flex items-center gap-1 h-[56px]">
441.	                    <div class="w-2 h-2 bg-slate-400 rounded-full typing-dot"></div>
442.	                    <div class="w-2 h-2 bg-slate-400 rounded-full typing-dot"></div>
443.	                    <div class="w-2 h-2 bg-slate-400 rounded-full typing-dot"></div>
444.	                </div>
445.	            `;
446.	            chatBox.appendChild(div);
447.	            
448.	            setTimeout(() => {
449.	                div.classList.remove('opacity-0');
450.	                chatBox.scrollTop = chatBox.scrollHeight;
451.	            }, 50);
452.	        }
453.	 
454.	        function removeTypingIndicator() {
455.	            const indicator = document.getElementById("typingIndicator");
456.	            if (indicator) indicator.remove();
457.	        }
458.	 
459.	        function quickAsk(text) {
460.	            if (isWaitingForResponse) return;
461.	            const input = document.getElementById("userInput");
462.	            input.value = text;
463.	            
464.	            // Close sidebar on mobile after selecting
465.	            if (window.innerWidth < 768 && !document.getElementById('sidebar').classList.contains('-translate-x-full')) {
466.	                toggleSidebar();
467.	            }
468.	            
469.	            sendMessage();
470.	        }
471.	 
472.	        function handleKeyDown(event) {
473.	            if (event.key === 'Enter' && !event.shiftKey) {
474.	                event.preventDefault();
475.	                sendMessage();
476.	            }
477.	        }
478.	 
479.	        // Exponential backoff for API Calls
480.	        async function fetchWithBackoff(url, options, retries = 5) {
481.	            const delays = [1000, 2000, 4000, 8000, 16000];
482.	            for (let i = 0; i < retries; i++) {
483.	                try {
484.	                    const response = await fetch(url, options);
485.	                    if (!response.ok) {
486.	                        throw new Error(`HTTP Error: ${response.status}`);
487.	                    }
488.	                    return await response.json();
489.	                } catch (error) {
490.	                    if (i === retries - 1) throw error;
491.	                    await new Promise(resolve => setTimeout(resolve, delays[i]));
492.	                }
493.	            }
494.	        }
495.	 
496.	        async function sendMessage() {
497.	            if (isWaitingForResponse) return;
498.	 
499.	            const input = document.getElementById("userInput");
500.	            const sendBtn = document.getElementById("sendBtn");
501.	            const text = input.value.trim();
502.	            
503.	            if (!text && currentAttachments.length === 0) return;
504.	            
505.	            // Xây dựng payload với text và file đính kèm
506.	            const messageParts = [];
507.	            if (text) {
508.	                messageParts.push({ text: text });
509.	            }
510.	
511.	            // Sao chép lại mảng attachments để hiển thị UI
512.	            const attachmentsForChat = [...currentAttachments];
513.	            
514.	            for (const att of currentAttachments) {
515.	                if (att.isImage) {
516.	                    messageParts.push({
517.	                        inlineData: {
518.	                            mimeType: att.mimeType,
519.	                            data: att.base64
520.	                        }
521.	                    });
522.	                } else {
523.	                    messageParts.push({
524.	                        text: `\n\n--- Nội dung file đính kèm: ${att.name} ---\n\`\`\`\n${att.text}\n\`\`\`\n--- Kết thúc file ---`
525.	                    });
526.	                }
527.	            }
528.	
529.	            // Setup UI for loading
530.	            isWaitingForResponse = true;
531.	            input.value = "";
532.	            input.style.height = "auto";
533.	            input.disabled = true;
534.	            if (sendBtn) {
535.	                sendBtn.disabled = true;
536.	                sendBtn.innerHTML = '<i class="ph ph-spinner animate-spin text-lg"></i>';
537.	            }
538.	            
539.	            // Reset UI đính kèm
540.	            currentAttachments = [];
541.	            renderAttachmentPreview();
542.	
543.	            addMessage(text, "user", false, attachmentsForChat);
544.	            addTypingIndicator();
545.	            
546.	            // Thêm vào lịch sử hội thoại (User)
547.	            chatHistory.push({ role: "user", parts: messageParts });
548.	 
549.	            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
550.	            const body = {
551.	                contents: chatHistory,
552.	                systemInstruction: { parts: [{ text: systemPrompt }] }
553.	            };
554.	 
555.	            try {
556.	                const data = await fetchWithBackoff(url, {
557.	                    method: "POST",
558.	                    headers: { "Content-Type": "application/json" },
559.	                    body: JSON.stringify(body)
560.	                });
561.	 
562.	                removeTypingIndicator();
563.	 
564.	                if (data.candidates && data.candidates.length > 0) {
565.	                    const reply = data.candidates[0].content.parts[0].text;
566.	                    addMessage(reply, "ai", true);
567.	                    
568.	                    // Thêm vào lịch sử hội thoại (Model)
569.	                    chatHistory.push({ role: "model", parts: [{ text: reply }] });
570.	                } else {
571.	                    addMessage("Xin lỗi, thầy không thể tạo câu trả lời lúc này. Em hãy thử lại nhé.", "ai");
572.	                    // Xoá tin nhắn lỗi khỏi lịch sử để không ảnh hưởng context
573.	                    chatHistory.pop();
574.	                }
575.	            } catch (error) {
576.	                console.error("API Error:", error);
577.	                removeTypingIndicator();
578.	                addMessage("⚠️ Đã xảy ra lỗi kết nối mạng hoặc hệ thống. Vui lòng thử lại sau ít phút.", "ai");
579.	                chatHistory.pop();
580.	            } finally {
581.	                // Restore UI
582.	                isWaitingForResponse = false;
583.	                input.disabled = false;
584.	                if (sendBtn) {
585.	                    sendBtn.disabled = false;
586.	                    sendBtn.innerHTML = '<i class="ph-fill ph-paper-plane-right text-lg"></i>';
587.	                }
588.	                input.focus();
589.	            }
590.	        }
591.	 
592.	        function clearChat() {
593.	            const chatBox = document.getElementById("chatBox");
594.	            // Keep only the first welcome message
595.	            const firstChild = chatBox.firstElementChild;
596.	            chatBox.innerHTML = '';
597.	            chatBox.appendChild(firstChild);
598.	            
599.	            // Clear history array
600.	            chatHistory = [];
601.	            
602.	            if (window.innerWidth < 768 && !document.getElementById('sidebar').classList.contains('-translate-x-full')) {
603.	                toggleSidebar();
604.	            }
605.	        }
606.	    </script>
