Hooks.once('init', async function() {
    game.settings.register("image-context", "advancedToChat", {
        name: "Show To Chat Configuration",
        hint: "If this option is disabled, the 'Send to Chat' button will immediatelly send the message to all players without confirmation",
        scope: "world",
        config: true,
        type: Boolean,
        default: true,
      });

});

Hooks.once('ready', async function() {
    if(game.user.isGM) {
        $(document).on("contextmenu", "img", ImageContext.onContextMenu);
        $(document).on("click", () => {$(".image-context").remove();});
        $(document).on("click", `li[data-tool="showurl"]`,async (e)=>{
            let src = await navigator.clipboard.readText();
            if(src){
                new ImageContext(src, e).showContextMenu()
            }else{
                ui.notifications.warn("No image found")
            }

        });
        Hooks.on("getSceneControlButtons", (buttons)=>{
            buttons.find(b => b.name === "tiles").tools.push({
                "name": "showurl",
                "title": "Show Copied URL",
                "icon": "fas fa-images",
                "button": true,
            })
        })
    }

    $(document).on("click", ".image-context-chat-message", (e) => {
        const src = $(e.currentTarget).attr('data-src');
        new ImagePopout(src, {shareable: game.user.isGM}).render(true);
    });

});