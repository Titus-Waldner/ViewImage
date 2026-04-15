Hooks.on("createChatMessage", chatmessage => {
    if(!game.user.isGM) return;
    let content = chatmessage.content;
    //isolate urls in the message content, excluding those that are already in an img tag
    let urls = [...new Set(content.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g))];
    const imgExtensions = ["jpg", "jpeg", "png", "gif", "svg", "webp"];
    for (let url of urls) {
        let ext = url.split(".").pop();
        if(!imgExtensions.includes(ext) || !url.includes("/")) continue;
        let img = new Image();
            img.src = url;
            img.onload = function() {
                const msg = game.messages.get(chatmessage.id);
                const isBgUrl = msg.content.replaceAll(" ", "").replaceAll("'", `"`).includes(`url("${url}")`);
                if (isBgUrl) return;
                const imgDiv = document.createElement("div");
                imgDiv.innerHTML = msg.content;
                const imgEls = Array.from(imgDiv.querySelectorAll("img"));
                const isImg = imgEls.length && imgEls.some(e => e.getAttribute("src") == url);
                if(isImg) return;
                let oldContent = msg.content;
                let newContent = oldContent.replace(url, `<img src="${url}" class="image-context-chat-message" data-src="${url}">`);
                msg.update({ content: newContent });
            };
    }
})