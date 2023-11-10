// ==UserScript==
// @name         IdlePixel Chat Overhaul
// @namespace    com.anwinity.idlepixel
// @version      1.0.0
// @description  Overhaul of chat UI and functionality.
// @author       Wynaan
// @license      MIT
// @match        *://idle-pixel.com/login/play*
// @require      https://greasyfork.org/scripts/441206-idlepixel/code/IdlePixel+.js?anticache=20220905
// @grant none
// ==/UserScript==

(function() {
    'use strict';

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
                #content.side-chat {
                    grid-template-columns: 2fr 10px minmax(300px, 4fr);
                }
                #game-chat {
                    position: sticky; 
                    top: calc(12pt + 34pt); 
                    right: 0;
                    height: calc(100vh - 24pt - 34pt); 
                    overflow: auto;
                    grid-column: 3;
                    margin: 12pt 12pt 12pt 0pt;
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
                    > img {
                        vertical-align: text-bottom;
                    }
                    > a.chat-username {
                        font-weight: bolder;
                        color: rgb(70, 70, 70);

                        &.highlighted {
                            color: #00258c;
                        }
                    }
                    &.dimmed {
                        color: #cfcfcf;
                        > span, a, .chat-username {
                            color: #cfcfcf;
                            border-color: #cfcfcf;
                            background-color: transparent;
                            box-shadow: none;
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
                .side-chat > * #chat-increase-size-button, #chat-decrease-size-button {
                    display: none;
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
                        const newElement = record.addedNodes[0].querySelector(".chat-username");
                        if(newElement) {
                            newElement.addEventListener("contextmenu", function(event) {
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
                                (newElement.textContent === currentlyHighlightedElements[0].textContent) ? newElement.classList.add("highlighted") : newElement.parentNode.classList.add("dimmed");
                            }
                        }
                    }
                });
            }).observe(chatArea, {
                childList: true,
                subtree: true
            });

            // Take all modals out of the game-chat div to prevent sticky chat area from breaking them
            const gameScreen = document.getElementById("game-screen");
            const gameChat = document.getElementById("game-chat");
            gameChat.querySelectorAll(".modal").forEach(modal => {
                const e = gameChat.removeChild(modal);
                $("#game-chat").after(e.outerHTML);
            });
            gameChat.classList.remove("m-3");

            // document.addEventListener("scroll", () => {
            //     const st = document.body.scrollTop;
            //     gameChat.style.height = `calc(100vh - 24pt - 34pt + min(${st}px, 34pt))`;
            //     gameChat.style.top = `calc(12pt + 34pt - min(${st}px, 34pt))`;
            // });

            // Add resize drag bar to the left of the chat
            $("#game-chat").before(`<div id="chat-resizer" class="resizer"></div>`);
            document.getElementById("chat-resizer").addEventListener("mousedown", initDrag, false);

            // Move top bar outside content so it goes over the chat
            $("#content").before(gameScreen.removeChild(document.getElementById("top-bar")).outerHTML);

            // Set initial size for the game div 
            gameScreen.style.width = "70vw";

            function initDrag(e) { 
                document.documentElement.addEventListener("mousemove", doDrag, false);
                document.documentElement.addEventListener("mouseup", stopDrag, false);
            }

            function doDrag(e) {
                gameScreen.style.width = e.clientX + "px";
                document.body.style.cursor = 'e-resize';
                e.preventDefault();
            }
        
            function stopDrag() {
                document.documentElement.removeEventListener("mousemove", doDrag, false);
                document.documentElement.removeEventListener("mouseup", stopDrag, false);
                document.body.style.cursor = '';
            }

            // Wrap switch_panels() to resize chat automatically if overlapping
            const original_switch_panels = _panel_switch_action;
            _panel_switch_action = function(id) {
                original_switch_panels(id);
                const rightLimit = document.getElementById(id).getBoundingClientRect().right;
                if(!/vw/.test(gameScreen.style.width) && rightLimit > parseInt(gameScreen.style.width.replace(/[^0-9]/, ""))) {
                    gameScreen.style.width = `${rightLimit + 24}px`;
                }
            }
        }
    }

    const plugin = new ChatPlugin();
    IdlePixelPlus.registerPlugin(plugin);

})();