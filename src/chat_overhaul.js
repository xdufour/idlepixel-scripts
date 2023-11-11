// ==UserScript==
// @name         IdlePixel Chat Overhaul
// @namespace    com.anwinity.idlepixel
// @version      1.1.0
// @description  Overhaul of chat UI and functionality.
// @author       Wynaan
// @license      MIT
// @match        *://idle-pixel.com/login/play*
// @require      https://greasyfork.org/scripts/441206-idlepixel/code/IdlePixel+.js?anticache=20220905
// @grant none
// ==/UserScript==

(function() {
    'use strict';

    const CSS_VARIABLES_DEFAULTS = {
        "--chat-text-color": "0, 0, 0",
        "--chat-username-color": "70, 70, 70",
        "--chat-server-msg-tag-color": "0, 82, 71",
        "--chat-server-msg-color": "0, 0, 255",
        "--chat-timestamp-color": "0, 128, 0",
        "--chat-level-color": "128, 128, 128"
    };

    class ChatPlugin extends IdlePixelPlusPlugin {
        constructor() {
            super("chat_overhaul", {
                about: {
                    name: GM_info.script.name + " (ver: " + GM_info.script.version + ")",
                    version: GM_info.script.version,
                    author: GM_info.script.author,
                    description: GM_info.script.description
                },
                config: [
                    // {
                    //     id: "condensed",
                    //     label: "Condensed UI",
                    //     type: "boolean",
                    //     default: true
                    // }
                ]
            });
            this.autoScrolling = true;
        }

        onConfigsChanged() {
            this.applyCondensed(this.getConfig("condensed"));
        }

        applyCondensed(condensed) {

        }

        onLogin() {
            $("head").append(`
            <style id="styles-chat">
                :root {
                    ${"".concat(Object.entries(CSS_VARIABLES_DEFAULTS).map(([prop, rgb]) => `${prop}: ${rgb};\n`))}
                }
                #content.side-chat {
                    grid-template-columns: 2fr 10px minmax(300px, 4fr);
                    > * #chat-increase-size-button, #chat-decrease-size-button {
                        display: none;
                    }
                    > #game-chat {
                        position: sticky; 
                        top: calc(12pt + 34pt); 
                        right: 0;
                        height: calc(100vh - 24pt - 34pt); 
                        overflow: auto;
                        grid-column: 3;
                        margin: 12pt 12pt 12pt 0pt;
                    }
                }
                .resizer {
                    width: 16pt;
                    height: 100%;
                    background: transparent;
                    cursor: e-resize;
                    grid-column: 2;
                    margin: 0;
                }
                #chat-area > div {
                    font-size: 13pt;
                    font-family: 'montserrat', sans-serif;
                    font-weight: 500;
                    color: rgba(var(--chat-text-color), 1.0);
                    > img {
                        vertical-align: text-bottom;
                    }
                    > a.chat-username {
                        font-weight: bolder;
                        color: rgba(var(--chat-username-color), 1.0);

                        &.highlighted {
                            color: #00258c;
                        }
                    }
                    &:has(span.server_message) {
                        color: rgba(var(--chat-server-msg-color), 1.0);
                        > span.server_message {
                            color: rgba(var(--chat-server-msg-tag-color), 1.0);
                        }
                    }
                    > .color-green {
                        color: rgba(var(--chat-timestamp-color), 1.0);
                    }
                    > .color-grey {
                        color: rgba(var(--chat-level-color), 1.0);
                    }
                    &.dimmed {
                        color: rgba(var(--chat-text-color), 0.3);
                        > span, a {
                            color: rgba(var(--chat-text-color), 0.3);
                            border-color: rgba(var(--chat-text-color), 0.3);
                            background-color: transparent;
                            box-shadow: none;
                        }
                        > .chat-username {
                            color: rgba(var(--chat-username-color), 0.2);
                        }
                        > img {
                            opacity: 0.2;
                        }
                    }
                }
                #chat-area > div > span:not(:first-child):not(:empty) {
                    border-radius: 5pt;
                    display: inline-block;
                    height: 1.5em;
                    padding: 0px 4px 0px 4px;
                }
                div:has(> .chat-area-input) {
                    display: flex;
                    flex-wrap: nowrap;
                    > .chat-area-input {
                        flex-grow: 1;
                    }
                }
            </style>
            `);

            const autoScrollButton = document.getElementById("chat-auto-scroll-button");
            const chatClearButton = document.getElementById("chat-clear-button");

            const gameChat = document.getElementById("game-chat");
            const gameScreen = document.getElementById("game-screen");

            autoScrollButton.style.removeProperty("max-height");
            autoScrollButton.style.color = "green";
            autoScrollButton.style.marginRight = "0.3em";
            chatClearButton.style.removeProperty("color");
            
            // Autoscrolling detection
            const chatArea = document.getElementById("chat-area");
            chatArea.addEventListener("scroll", () => {
                const sh = chatArea.scrollHeight;
                const st = chatArea.scrollTop;
                const ht = chatArea.offsetHeight - 2; // Account for border width
                if(st == sh - ht) {
                    if(!this.autoScrolling) {
                        this.autoScrolling = true;
                        Chat.toggle_auto_scroll();
                    }
                }
                else {
                    if(this.autoScrolling) {
                        this.autoScrolling = false;
                        Chat.toggle_auto_scroll();
                    }
                }
            });

            document.querySelector("button[onclick='Chat.send()']").textContent = "\u27a4";
            document.querySelector(`button[onclick="switch_panels('panel-tags')"]`).innerHTML = `<img style="height: 24px;" src="https://d1xsc8x7nc5q8t.cloudfront.net/images/diamond.png"></img>`;
            document.querySelector(`button[onclick="switch_panels('panel-sigils')"]`).innerHTML = `<img style="height: 24px;" src="https://d1xsc8x7nc5q8t.cloudfront.net/images/forest_ent_sigil_chat.png">`;

            // Observer to modify chat messages as they come in
            new window.MutationObserver((mutationRecords) => {
                const usernameElements = chatArea.getElementsByClassName("chat-username");
                mutationRecords.forEach(record => {
                    if(record.addedNodes.length > 0 && record.addedNodes[0].nodeType == 1){
                        const newUserMessage = record.addedNodes[0].querySelector(".chat-username");
                        const newServerMessage = record.addedNodes[0].querySelector(".server_message");
                        if(newUserMessage) {
                            newUserMessage.addEventListener("contextmenu", function(event) {
                                const clickedElement = event.target;
                                const isHighlighted = clickedElement.classList.contains("highlighted");
                                Array.from(chatArea.getElementsByClassName("chat-username"))
                                    .map(e => { if(e.classList.contains("highlighted")) e.classList.remove("highlighted"); return e; })
                                    .map(e => { if(e.parentNode.classList.contains("dimmed")) e.parentNode.classList.remove("dimmed"); return e; })
                                    .map(e => { if(!isHighlighted) e.textContent === clickedElement.textContent ? e.classList.add("highlighted"): e.parentNode.classList.add("dimmed"); return e; });
                                event.preventDefault();
                                return false;
                            });
                            const currentlyHighlightedElements = Array.from(usernameElements).filter(e => e.classList.contains("highlighted"));
                            if(currentlyHighlightedElements.length > 0) {
                                // A username is currently highlighted, so highlight the new message if its the same name, or dim it otherwise
                                (newUserMessage.textContent === currentlyHighlightedElements[0].textContent) ? newUserMessage.classList.add("highlighted") : newUserMessage.parentNode.classList.add("dimmed");
                            }
                        }
                        if(newServerMessage) {
                            newServerMessage.parentNode.style.removeProperty("color");
                        }
                    }
                });
            }).observe(chatArea, {
                childList: true,
                subtree: true
            });

            // Observer to detect side-chat mode change
            new window.MutationObserver((mutationRecords) => {
                mutationRecords.forEach(record => {
                    if(record.type === "attributes" && record.attributeName === "class") {
                        //console.log(`Chat mode changed: ${record.target.classList.contains("side-chat") ? "Side" : "Bottom"}`);
                        this.configureChat(record.target.classList.contains("side-chat") ? "side" : "bottom");
                    }
                });
            }).observe(document.getElementById("content"), {
                attributes: true
            });

            // Take all modals out of the game-chat div to prevent sticky chat area from breaking them
            gameChat.querySelectorAll(".modal").forEach(modal => {
                const e = gameChat.removeChild(modal);
                $("#game-chat").after(e.outerHTML);
            });

            // Move top bar outside content so it goes over the chat
            $("#content").before(gameScreen.removeChild(document.getElementById("top-bar")).outerHTML);

            if(IdlePixelPlus.plugins["ui-tweaks"]) {
                this.applyUITweaksThemes();
                this.overrideUITweaksFunctions();
            }
         }

        configureChat(setting) {
            const gameScreen = document.getElementById("game-screen");
            const gameChat = document.getElementById("game-chat");

            // Add resize drag bar to the left of the chat
            if(setting === "side") {
                gameChat.classList.remove("m-3");
                $("#game-chat").before(`<div id="chat-resizer" class="resizer"></div>`);
                document.getElementById("chat-resizer").addEventListener("mousedown", initDrag, false);

                gameScreen.style.width = "70vw";
            }
            else {
                const resizerDiv = document.getElementById("chat-resizer");
                if(resizerDiv)
                    resizerDiv.remove();
                if(!gameChat.classList.contains("m-3"))
                    gameChat.classList.add("m-3");

                gameScreen.style.width = "100vw";
            }

            function initDrag(e) { 
                document.documentElement.addEventListener("mousemove", doDrag, false);
                document.documentElement.addEventListener("mouseup", stopDrag, false);
            }

            function doDrag(e) {
                if(e.clientX < window.innerWidth - 324)
                    gameScreen.style.width = e.clientX + "px";
                document.body.style.cursor = 'e-resize';
                e.preventDefault();
            }

            function stopDrag() {
                document.documentElement.removeEventListener("mousemove", doDrag, false);
                document.documentElement.removeEventListener("mouseup", stopDrag, false);
                document.body.style.cursor = '';
            }
        }

        onPanelChanged(_, panelAfter) {
            // Resize chat automatically if overlapping with the panel
            const gameScreen = document.getElementById("game-screen");
            const rightLimit = document.getElementById(`panel-${panelAfter}`).getBoundingClientRect().right;
            if(!/vw/.test(gameScreen.style.width) && rightLimit > parseInt(gameScreen.style.width.replace(/[^0-9]/g, ""))) {
                gameScreen.style.width = `${rightLimit + 24}px`;
            }
        }

        hexToRgb(hex) {
            const bigint = parseInt(hex.replace(/#/, ""), 16);
            const r = (bigint >> 16) & 255;
            const g = (bigint >> 8) & 255;
            const b = bigint & 255;
        
            return r + ", " + g + ", " + b;
        }

        applyUITweaksThemes() {
            const uitConfig = IdlePixelPlus.plugins["ui-tweaks"].config;
            const root = document.documentElement;
            console.log(uitConfig);

            const uitCustomizationConfigMap = [
                {enable: "font-color-enabled-chat-area-chat-username", config: "font-color-chat-area-chat-username", cssProperty: "--chat-username-color"},
                {enable: "font-color-enabled-chat-area", config: "font-color-chat-area", cssProperty: "--chat-text-color"},
                {enable: "font-color-enabled-chat-area-server_message", config: "font-color-chat-area-server_message", cssProperty: "--chat-server-msg-tag-color"},
                {enable: "serverMessageTextOverrideEnabled", config: "serverMessageTextOverrideColor", cssProperty: "--chat-server-msg-color"},
                {enable: "font-color-enabled-chat-area-color-green", config: "font-color-chat-area-color-green", cssProperty: "--chat-timestamp-color"},
                {enable: "font-color-enabled-chat-area-color-grey", config: "font-color-chat-area-color-grey", cssProperty: "--chat-level-color"}
            ];

            uitCustomizationConfigMap.forEach((customization) => {
                if(uitConfig[customization.enable])
                    root.style.setProperty(customization.cssProperty, this.hexToRgb(uitConfig[customization.config]));
                else
                    root.style.setProperty(customization.cssProperty, CSS_VARIABLES_DEFAULTS[customization.cssProperty]);
            });
        }

        overrideUITweaksFunctions() {
            // Wrap UIT's method for updating color schemes since it edits the direct style attributes
            // and therefore takes precedence over CSS classes
            const originalUpdateColors = IdlePixelPlus.plugins["ui-tweaks"].updateColors;
            IdlePixelPlus.plugins["ui-tweaks"].updateColors = function(filter) {
                if(!filter || filter.filter(f => /^#chat/.test(filter)).length > 0) {
                    return;
                }
                else {
                    originalUpdateColors.apply(this, arguments);
                }
            }
            // Wrap UIT's onConfigChanged to set css properties accordingly
            const originalOnConfigsChanged = IdlePixelPlus.plugins["ui-tweaks"].onConfigsChanged;
            IdlePixelPlus.plugins["ui-tweaks"].onConfigsChanged = function() {
                originalOnConfigsChanged.apply(this, arguments);
                IdlePixelPlus.plugins["chat_overhaul"].applyUITweaksThemes();
            }
        }
    }

    const plugin = new ChatPlugin();
    IdlePixelPlus.registerPlugin(plugin);

})();