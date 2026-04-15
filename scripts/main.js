class ImageContext {
  constructor(src, e) {
    this.src = src;
    this.e = e;
  }

  static onContextMenu(e) {
    const html = $(e.target.outerHTML);
    const src = html.attr("src");
    new ImageContext(src, e).showContextMenu();
  }

  static show() {
    const src = $(this).attr("data-src");
    new ImagePopout(src, { shareable: true }).render(true);
    this.parentElement.remove();
  }

  static toChat() {
    const src = $(this).attr("data-src");
    this.parentElement.remove();
    if(game.settings.get("image-context", "advancedToChat")){
      ImageContext.toChatWithDialog(src);
      return;
    }

    ChatMessage.create({
      content: `<img class="image-context-chat-message" data-src="${src}" src="${src}">`,
    });

  }

  static toChatWithDialog(src) {
    
    new Dialog({
      title: "Send Image to Chat",
      content: ImageContext.getDialogContent(),
      buttons: {
        all: {
          icon: '<i class="fas fa-users"></i>',
          label: "Show to All",
          callback: () => {
            ChatMessage.create({
                content: `<img class="image-context-chat-message" data-src="${src}" src="${src}">`,
              });
          },
        },
        wisp: {
          icon: '<i class="fas fa-user-check"></i>',
          label: "Wisper",
          callback: (html) => {
            let players = [];
            html.find(".image-context-dialog-checkbox:checked").each((i, e) => players.push($(e).attr("data-player")));
            ChatMessage.create({
                content: `<img class="image-context-chat-message" data-src="${src}" src="${src}">`,
                whisper: players,
              });
          },
        },
        canc: {
            icon: '<i class="fas fa-times"></i>',
            label: "Cancel",
            callback: () => {},
          },
      },
      default: "canc",
      render: (html) => { html.on("click", "label", (e) => $(e.target).prev().click()); },
    }).render(true);
  }

  static getDialogContent() {
      const players = game.users.players;
      const container = $(`<div class="image-context-dialog-container"></div>`);
      container.append(`<div class="image-context-dialog-header"><strong>Send Image to:</strong></div>`);
        players.forEach((player) => {
            const checkbox = $(`<input type="checkbox" class="image-context-dialog-checkbox" data-player="${player.id}">`);
            const label = $(`<label class="image-context-dialog-label">${player.name}</label>`);
            const div = $(`<div class="image-context-dialog-player"></div>`);
            div.append(checkbox);
            div.append(label);
            container.append(div);
        });
        return container.html();
  }

  static copyURL() {
    const src = $(this).attr("data-src");
    navigator.clipboard.writeText(src);
    ui.notifications.info(`URL: '${src}'' copied to clipboard`);
    this.parentElement.remove();
  }

  showContextMenu() {
    $(".image-context").remove();
    const contextmenu = $(`<div class="image-context"></div>`);
    const buttons = ImageContext.getButtons();
    buttons.forEach((button) => {
      const buttonElement = $(
        `<div class="image-context-button" data-src="${this.src}">${button.icon} ${button.name}</div>`
      );
      buttonElement.click(button.callback);
      contextmenu.append(buttonElement);
    });
    contextmenu.css({
      top: this.e.clientY,
      left: this.e.clientX,
    });
    $("body").append(contextmenu);
  }

  static getButtons() {
    return [
      {
        name: "Show",
        icon: '<i class="fas fa-eye"></i>',
        callback: ImageContext.show,
      },
      {
        name: "Send to Chat",
        icon: '<i class="fas fa-share"></i>',
        callback: ImageContext.toChat,
      },
      {
        name: "Copy URL",
        icon: '<i class="fas fa-link"></i>',
        callback: ImageContext.copyURL,
      },
    ];
  }
}
