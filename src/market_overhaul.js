// ==UserScript==
// @name         IdlePixel Market Overhaul - Wynaan Fork
// @namespace    com.anwinity.idlepixel
// @version      1.3.5
// @description  Overhaul of market UI and functionality.
// @author       Original Author: Anwinity || Modded By: GodofNades/Zlef/Wynaan
// @license      MIT
// @match        *://idle-pixel.com/login/play*
// @require      https://greasyfork.org/scripts/441206-idlepixel/code/IdlePixel+.js?anticache=20220905
// @require      https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.5.1/chart.min.js
// @grant none
// ==/UserScript==

(function() {
    'use strict';
    let marketTimer;
    let marketWatcherTimer;
    var marketRunning = false;

    const LOCAL_STORAGE_KEY = "plugin_market_watchers";

    const XP_PER = {
        stone: 0.1,
        copper: 1,
        iron: 5,
        silver: 10,
        gold: 20,
        promethium: 100,
        titanium: 300,

        bronze_bar: 5,
        iron_bar: 25,
        silver_bar: 50,
        gold_bar: 100,
        promethium_bar: 500,
        titanium_bar: 2000,
        ancient_bar: 5000
    };

    const BONEMEAL_PER = {
        bones: 1,
        big_bones: 2,
        ice_bones: 3,
        ashes: 2,
        blood_bones: 4
    };

    const LEVEL_REQ = {
        // net
        raw_shrimp: "Cooking: 1",
        raw_anchovy: "Cooking: 5",
        raw_sardine: "Cooking: 10",
        raw_crab: "Cooking: 35",
        raw_piranha: "Cooking: 50",

        // rod
        raw_salmon: "Cooking: 10",
        raw_trout: "Cooking: 20",
        raw_pike: "Cooking: 35",
        raw_eel: "Cooking: 55",
        raw_rainbow_fish: "Cooking: 70",

        // harpoon
        raw_tuna: "Cooking: 35",
        raw_swordfish: "Cooking: 50",
        raw_manta_ray: "Cooking: 75",
        raw_shark: "Cooking: 82",
        raw_whale: "Cooking: 90",

        // plant seeds
        dotted_green_leaf_seeds: "Farming: 1<br/>Stop Dying: 15",
        red_mushroom_seeds: "Farming: 1<br/>Cant Die",
        stardust_seeds: "Farming: 8<br/>Cant Die",
        green_leaf_seeds: "Farming: 10<br/>Stop Dying: 25",
        lime_leaf_seeds: "Farming: 25<br/>Stop Dying: 40",
        gold_leaf_seeds: "Farming: 50<br/>Stop Dying: 60",
        crystal_leaf_seeds: "Farming: 70<br/>Stop Dying: 80",

        // tree seeds
        tree_seeds: "Farming: 10<br/>Stop Dying: 25",
        oak_tree_seeds: "Farming: 25<br/>Stop Dying: 40",
        willow_tree_seeds: "Farming: 37<br/>Stop Dying: 55",
        maple_tree_seeds: "Farming: 50<br/>Stop Dying: 65",
        stardust_tree_seeds: "Farming: 65<br/>Stop Dying: 80",
        pine_tree_seeds: "Farming: 70<br/>Stop Dying: 85",
        redwood_tree_seeds: "Farming: 80<br/>Stop Dying: 92",

        // bows
        long_bow: "Archery: 25",

        // melee
        stinger: "Melee: 5 <br /> Invent: 10",
        iron_dagger: "Melee: 10 <br /> Invent: 20",
        skeleton_sword: "Melee: 20 <br /> Invent: 30",
        club: "Melee: 30",
        spiked_club: "Melee: 30",
        scythe: "Melee: 40",
        trident: "Melee: 70",
        rapier: "Melee: 90",

        // other equipment
        bone_amulet: "Invent: 40",

        // armour
        skeleton_shield: "Melee: 20",

        // logs conver rate
        logs: "5% <br/> Convert to Charcoal",
        oak_logs: "10% <br/> Convert to Charcoal",
        willow_logs: "15% <br/> Convert to Charcoal",
        maple_logs: "20% <br/> Convert to Charcoal",
        stardust_logs: "25% <br/> Convert to Charcoal",
        pine_logs: "30% <br/> Convert to Charcoal",
        redwood_logs: "35% <br/> Convert to Charcoal"
    };

    const HEAT_PER = {
        raw_chicken: 10,
        raw_meat: 40,

        // net
        raw_shrimp: 10,
        raw_anchovy: 20,
        raw_sardine: 40,
        raw_crab: 75,
        raw_piranha: 120,

        // rod
        raw_salmon: 20,
        raw_trout: 40,
        raw_pike: 110,
        raw_eel: 280,
        raw_rainbow_fish: 840,

        // harpoon
        raw_tuna: 75,
        raw_swordfish: 220,
        raw_manta_ray: 1200,
        raw_shark: 3000,
        raw_whale: 5000,

        // net (shiny)
        raw_shrimp_shiny: 10,
        raw_anchovy_shiny: 20,
        raw_sardine_shiny: 40,
        raw_crab_shiny: 75,
        raw_piranha_shiny: 120,

        // rod (shiny)
        raw_salmon_shiny: 20,
        raw_trout_shiny: 40,
        raw_pike_shiny: 110,
        raw_eel_shiny: 280,
        raw_rainbow_fish_shiny: 840,

        // harpoon (shiny)
        raw_tuna_shiny: 75,
        raw_swordfish_shiny: 220,
        raw_manta_ray_shiny: 1200,
        raw_shark_shiny: 3000,
        raw_whale_shiny: 5000,

        // net (mega shiny)
        raw_shrimp_mega_shiny: 10,
        raw_anchovy_mega_shiny: 20,
        raw_sardine_mega_shiny: 40,
        raw_crab_mega_shiny: 75,
        raw_piranha_mega_shiny: 120,

        // rod (mega shiny)
        raw_salmon_mega_shiny: 20,
        raw_trout_mega_shiny: 40,
        raw_pike_mega_shiny: 110,
        raw_eel_mega_shiny: 280,
        raw_rainbow_fish_mega_shiny: 840,

        // harpoon (mega shiny)
        raw_tuna_mega_shiny: 75,
        raw_swordfish_mega_shiny: 220,
        raw_manta_ray_mega_shiny: 1200,
        raw_shark_mega_shiny: 3000,
        raw_whale_mega_shiny: 5000,

        //stardust fish
        raw_small_stardust_fish: 300,
        raw_medium_stardust_fish: 600,
        raw_large_stardust_fish: 2000
    };

    const CHARCOAL_PERC = {
        logs: 0.05,
        oak_logs: 0.1,
        willow_logs: 0.15,
        maple_logs: 0.2,
        stardust_logs: 0.25,
        pine_logs: 0.3,
        redwood_logs: 0.35
    };

    const CATEGORY_RATIOS = {
        ores: ["Coins/XP"],
        bars: ["Coins/XP"],
        bones: ["Coins/Bonemeal"],
        logs: ["Coins/Heat", "Coins/Charcoal"],
        raw_fish: ["Coins/Energy", "Energy/Heat", "Coins/Heat/Energy"],
        cooked_fish: ["Coins/Energy"]
    };

    class MarketPlugin extends IdlePixelPlusPlugin {
        constructor() {
            super("market", {
                about: {
                    name: GM_info.script.name + " (ver: " + GM_info.script.version + ")",
                    version: GM_info.script.version,
                    author: GM_info.script.author,
                    description: GM_info.script.description
                },
                config: [
                    {
                        id: "condensed",
                        label: "Condensed UI",
                        type: "boolean",
                        default: true
                    },
                    {
                        id: "highlightBest",
                        label: "Highlight Best",
                        type: "boolean",
                        default: true
                    },
                    {
                        id: "autoMax",
                        label: "Autofill Max Buy",
                        type: "boolean",
                        default: false
                    },
                    {
                        id: "marketSoldNotification",
                        label: "Show a notification when you have items to collect in the market.",
                        type: "boolean",
                        default: true
                    },
                    {
                        id: "altIDList",
                        label: "List the player ID of alts you dont want to see in the player market.",
                        type: "string",
                        max: 200000,
                        default: "PlaceIDsHere"
                    },
                    //Zlef
                    {
                        id: "clickBrewIng",
                        label: "Click on a brewing ingredient to go to player market page.",
                        type: "boolean",
                        default: true
                    },
                    //End Zlef
                    {
                        id: "marketGraph",
                        label: "Show a 7-days price history when browsing items.",
                        type: "boolean",
                        default: true
                    }
                ]
            });
            this.lastBrowsedItem = "all";
            this.lastCategoryFilter = "all";
            this.historyChart = undefined;
            this.currentTableData = undefined;
            this.lastSortIndex = 0;
        }

        onConfigsChanged() {
            this.applyCondensed(this.getConfig("condensed"));
            if(this.getConfig("marketSoldNotification")) {
                this.updateMarketNotifications();
            } else {
                clearInterval(marketTimer);
                clearInterval(marketWatcherTimer);
                marketRunning = false;
                $("#market-sidecar").hide();
            }

            if(this.getConfig("marketGraph")) {
                $("#history-chart").hide();
            }
        }

        addMarketNotifications() {
            const sideCar = document.createElement('span');
            sideCar.id = `market-sidecar`;
            sideCar.onclick = function () {
                IdlePixelPlus.plugins.market.collectMarketButton();
            }
            sideCar.style='margin-right: 4px; margin-bottom: 4px; display: none';

            var elem = document.createElement("img");
            elem.setAttribute("src", "https://idlepixel.s3.us-east-2.amazonaws.com/images/player_market.png");
            const sideCarIcon = elem;
            sideCarIcon.className = "w20";

            const sideCarDivLabel = document.createElement('span');
            sideCarDivLabel.id = `market-sidecar-coins`;
            sideCarDivLabel.innerText = ' 0';
            sideCarDivLabel.className = 'color-white'

            sideCar.append("  (", sideCarIcon, sideCarDivLabel, ")");
            document.querySelector('#item-display-coins').after(sideCar);
            $("#market-sidecar").hide();
        };

        collectMarketButton() {
            $("#market-sidecar").hide();
            [1, 2, 3].forEach(n => {
                const button = $(`button#player-market-slot-collect-amount-${n}`);
                const collect = parseInt(button.text().replace(/[^0-9]/g,''));
                if(collect > 0){
                    websocket.send(`MARKET_COLLECT=${n}`);
                    button.text(button.text().replace(/[0-9,]+/, '0'));
                }
            });
        }

        updateMarketNotifications() {
            if(!marketRunning) {
                marketRunning = true;
                marketTimer = setInterval(function() {
                    websocket.send("MARKET_REFRESH_SLOTS");

                    setTimeout(function() {
                        const total = [1, 2, 3].map(n => {
                            const collect = parseInt($(`button#player-market-slot-collect-amount-${n}`).text().replace(/\D/g,''));
                            return isNaN(collect) ? 0 : collect;
                        }).reduce((a, b) => a + b, 0);
                        if(total > 0) {
                            $("#market-sidecar-coins").text(" " + total.toLocaleString());
                            $("#market-sidecar").show();
                        } else {
                            $("#market-sidecar-coins").text(" " + total.toLocaleString());
                            $("#market-sidecar").hide();
                        }
                    }, 50);
                }, 10000);
                marketWatcherTimer = setInterval(function() {
                    IdlePixelPlus.plugins.market.checkWatchers();
                }, 30000);
            }
        }

        applyCondensed(condensed) {
            if(condensed) {
                $("#panel-player-market").addClass("condensed");
                $("#modal-market-select-item").addClass("condensed");
                // Make sell slots total width the same as the rest of the UI without changing the panel's center style
                document.getElementsByClassName("player-market-slot-base").item(0).parentNode.style.justifyContent = "space-between";
            }
            else {
                $("#panel-player-market").removeClass("condensed");
                $("#modal-market-select-item").removeClass("condensed");
            }
        }

        onLogin() {
            this.addMarketNotifications();
            if(this.getConfig("marketSoldNotification")) {
                this.updateMarketNotifications();
            }
            const self = this;

            $("head").append(`
            <style id="styles-market">

              #market-table {
                  margin-top: 0.5em !important;
              }
              #market-table tr.cheaper {
                  background-color: rgb(50, 205, 50, 0.25);
              }
              #market-table tr.cheaper > td {
                  background-color: rgb(50, 205, 50, 0.25);
              }
              #panel-player-market.condensed > center {
                  display: flex;
                  flex-direction: row;
                  justify-content: center;
              }
              #panel-player-market.condensed div.player-market-slot-base {
              	  height: 400px;
              }
              #panel-player-market.condensed div.player-market-slot-base hr {
                  margin-top: 2px;
                  margin-bottom: 4px;
              }
              #panel-player-market.condensed div.player-market-slot-base br + #panel-player-market.condensed div.player-market-slot-base br {
                  display: none;
              }
              #panel-player-market.condensed div.player-market-slot-base[id^="player-market-slot-occupied"] button {
                  padding: 2px;
              }

              #panel-player-market.condensed #market-table th {
              	padding: 2px 4px;
              }

              #panel-player-market.condensed #market-table td {
              	padding: 2px 4px;
              }

              #modal-market-select-item.condensed #modal-market-select-item-section .select-item-tradables-catagory {
                margin: 6px 6px;
                padding: 6px 6px;
              }
              #modal-market-select-item.condensed #modal-market-select-item-section .select-item-tradables-catagory:hover {
                box-shadow: 4px 4px 8px #0e0e0e;
                border-color: #252525;
                cursor: pointer;
              }

              #modal-market-select-item.condensed #modal-market-select-item-section .select-item-tradables-catagory hr {
                margin-top: 2px;
                margin-bottom: 2px;
              }
              .hide {
                display: none;
              }
              .bold {
                font-weight: bold;
              }
              .select-item-tradables-catagory {
                border-radius: 5pt;
              }
              #market-table th.actions:hover {
                color: gray;
                cursor: pointer;
              }
              .context-menu { 
                position: absolute; 
              } 
              .menu {
                display: flex;
                flex-direction: column;
                background-color: rgb(240, 240, 240);
                border-radius: 5pt;
                box-shadow: 4px 4px 8px #0e0e0e;
                padding: 10px 0;
                list-style-type: none;
              }
              .menu > li {
                font: inherit;
                border: 0;
                padding: 4px 36px 4px 16px;
                width: 100%;
                display: flex;
                align-items: center;
                position: relative;
                text-decoration: unset;
                color: #000;
                transition: 0.5s linear;
                -webkit-transition: 0.5s linear;
                -moz-transition: 0.5s linear;
                -ms-transition: 0.5s linear;
                -o-transition: 0.5s linear;
              }
              .menu > li:hover {
                background:#afafaf;
                color: #15156d;
                cursor: pointer;
              }
              .menu > li > span:not(:first-child) {
                position: absolute;
                right: 12px;
              }
            </style>
            `);

            // Market watcher modal
            $("#modal-item-input").after(`
            <div class="modal modal-dim" id="modal-market-configure-item-watcher" tabindex="-1" style="top: 0px; display: none;" aria-modal="true" role="dialog">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title text-secondary">ITEM WATCHER</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="center">
                                <div class="modal-market-sell-image p-2 hard-shadow">
                                    <h2 id="modal-market-configure-item-watcher-label"></h2>
                                    <img id="modal-market-configure-item-watcher-image" width="50px" height="50px" original-width="50px" original-height="50px" src="">
                                </div>
                                <br>
                                <input type="hidden" id="modal-market-configure-item-watcher">
                                <div class="modal-market-watcher-inputs font-small color-grey p-2 shadow">
                                    <br>
                                    <br>
                                    Limit:
                                    <span class="color-gold" id="modal-market-configure-item-watcher-low-limit">N/A</span>
                                    -
                                    <span class="color-gold" id="modal-market-configure-item-watcher-high-limit">N/A</span>
                                    <span class="color-gold"> each</span>
                                    <br>
                                    <img src="https://d1xsc8x7nc5q8t.cloudfront.net/images/coins.png" title="coins">
                                    <input type="text" id="modal-market-configure-item-watcher-price-each" width="30%" placeholder="Price Each" original-width="30%">
                                    <select id="modal-market-configure-item-watcher-mode">
                                    <option value="1">Less than</option>
                                    <option value="2">At least</option>
                                    </select>
                                    <br>
                                    <br>
                                    <br>
                                    <br>
                                    <div>
                                        <input type="button" id="modal-market-configure-item-watcher-cancel-button" data-bs-dismiss="modal" value="Cancel">
                                        <input type="button" id="modal-market-configure-item-watcher-ok-button" onclick="IdlePixelPlus.plugins.market.createMarketWatcher()" class="background-primary hover" value="Create Watcher">
                                        <u class="hover" onclick="alert(&quot;You will get a notification when the price crosses the specified threshold.&quot;)">?</u>
                                    </div>
                                    <br>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`);
            
            // Market table sort menu
            
            $("#panel-player-market").append(`
            <div id="market-sort-context-menu" class="context-menu" style="display: none"> 
                <ul class="menu"> 
                    <li id="context-menu-price-each-item" onclick='IdlePixelPlus.plugins.market.contextMenuSelectOnClick(\"context-menu-price-each-item\");'>
                        <span> Price Each</span>
                    </li> 
                </ul> 
            </div>`);

            // modal-market-configure-item-to-sell-amount
            const sellModal = $("#modal-market-configure-item-to-sell");
            const sellAmountInput = sellModal.find("#modal-market-configure-item-to-sell-amount");
            sellAmountInput.after(`
              <button type="button" onclick="IdlePixelPlus.plugins.market.applyOneAmountSell()">1</button>
              <button type="button" onclick="IdlePixelPlus.plugins.market.applyMaxAmountSell()">max</button>
              <button type="button" onclick="IdlePixelPlus.plugins.market.applyMaxAmountSell(true)">max-1</button>
            `);
            const sellPriceInput = sellModal.find("#modal-market-configure-item-to-sell-price-each").after(`
              <button type="button" onclick="IdlePixelPlus.plugins.market.applyMinPriceSell()">min</button>
              <button type="button" onclick="IdlePixelPlus.plugins.market.applyLowestPriceSell()">lowest</button>
              <button type="button" onclick="IdlePixelPlus.plugins.market.applyMidPriceSell()">mid</button>
              <button type="button" onclick="IdlePixelPlus.plugins.market.applyMaxPriceSell()">max</button>
              <br /><br />
              Total: <span id="modal-market-configure-item-to-sell-total"></span>
            `);

            // Add See Market button
            [1, 2, 3].forEach(n => {
                $(`#player-market-slot-collect-amount-${n}`).next().remove();
                $(`#player-market-slot-collect-amount-${n}`)
                    .after(`<button type="button" style="width: 90%; margin-top: 0.5em; margin-bottom: 0.5em; background-color: rgb(46, 137, 221);" onclick="IdlePixelPlus.plugins.market.seeMarketOnClick(${n})">See Market</button>`);
                $(`#player-market-slot-expires-${n}`).prev().remove();
            });

            sellAmountInput.on("input change", () => this.applyTotalSell());
            sellPriceInput.on("input change", () => this.applyTotalSell());

            // Zlef
            // Add buttons to brewing ingredients
            const parentDiv = document.getElementById("panel-brewing");

            // Loop through all itembox elements within the parent div
            parentDiv.querySelectorAll('itembox').forEach((itemBox) => {
                // Check if it contains 'Primary Ingredient' or 'Secondary Ingredient'
                const tooltip = itemBox.getAttribute("data-bs-original-title");
                if (tooltip && (tooltip.includes("Primary Ingredient") || tooltip.includes("Secondary Ingredient"))) {
                    // Add click event to the itembox
                    itemBox.addEventListener("click", () => this.brewingIngClicked(itemBox));
                }
            });
            //End Zlef

            // Add event to reset collection button
            [1, 2, 3].forEach(n => {
                $(`button#player-market-slot-collect-amount-${n}`).on("click", function() {
                    $(this).text($(this).text().replace(/[0-9,]+/, '0'));
                    $("#market-sidecar").hide();
                });
            });

            const buyModal = $("#modal-market-purchase-item");
            const buyAmountInput = buyModal.find("#modal-market-purchase-item-amount-input");
            // Added by Zlef ->
            $(document).on('click', '[onclick*="Modals.market_purchase_item"]', this.handlePurchaseClick.bind(this));
            // <-
            buyAmountInput.after(`
              <button type="button" onclick="IdlePixelPlus.plugins.market.applyOneAmountBuy()">1</button>
              <button type="button" onclick="IdlePixelPlus.plugins.market.applyMaxAmountBuy()">max</button>
              <br /><br />
              Total: <span id="modal-market-purchase-item-total"></span>
              <br />
              Owned: <item-display data-format="number" data-key="coins"></item-display>
            `);
            buyAmountInput.on("input change", () => this.applyTotalBuy());

            // wrap Market.browse_get_table to capture last selected
            const original_market_browse = Market.browse_get_table;
            Market.browse_get_table = function(item) {
                return self.browseGetTable(item);
            }

            $("#market-table").css("margin-top", "24px");

            // wrap Market.load_tradables to populate category filters
            const original_load_tradables = Market.load_tradables;
            Market.load_tradables = function(data) {
                original_load_tradables.apply(this, arguments);
            }
            // Temporarily overwrite market_select_tradable_item to bypass the browse button
            // websocket message opening the tradable modal after calling load_tradables()
            const original_market_select_tradable_item = Modals.market_select_tradable_item;
            Modals.market_select_tradable_item = function(data) {
                Modals.market_select_tradable_item = original_market_select_tradable_item;
            }
            websocket.send("MARKET_BROWSE_BUTTON_CLICKED");

            // Extra buttons beside <BROWSE PLAYER MARKET>
            $(`#panel-player-market button[onclick^="Market.clicks_browse_player_market_button"]`)
                .first()
                .after(`<div id="heat-pot-div">
                           <label for "heat-pot" style="margin-left: 1em; margin-top: 0.6em"> Use Heat Potion:</label>
                           <input id="heat-pot-checkbox" type="checkbox" style="margin-left: 0.5em" name="heat-pot" onclick="IdlePixelPlus.plugins.market.refreshMarket(false);" checked>
                       </div>`)
                .after(`<button id="refresh-market-table-button" type="button" style="height: 44px; margin-left: 0.5em" onclick="IdlePixelPlus.plugins.market.refreshMarket(true);">
                            Refresh
                        </button>`)
                .after(`<button id="watch-market-item-button" type="button" style="height: 44px; margin-left: 0.5em" onclick="IdlePixelPlus.plugins.market.watchItemOnClick()">
                            Watch Item
                        </button>`);;

            // Edit tradables modal category names
            new window.MutationObserver((mutationRecords) => {
                const childList = mutationRecords.filter(record => record.type === "childList")[0];
                if(childList && childList.target && childList.target.id === "modal-market-select-item-section") {
                    const elements = document.getElementById(childList.target.id).querySelectorAll(".select-item-tradables-catagory");
                    elements.forEach(e => {
                        e.classList.add("bold");
                        e.onclick = () => this.filterButtonOnClick(e.textContent.toLowerCase().replace(" ", "_"));
                        e.innerHTML = e.innerHTML.replace(/[a-zA-Z_]+<hr>/, e.textContent.split("_").map(w => w[0].toUpperCase() + w.slice(1).toLowerCase()).join(" ") + "<hr>");

                        e.querySelectorAll("div").forEach(d => {
                            d.addEventListener("click", function(event) {
                                event.stopPropagation();
                            });
                        });
                    });
                }
            }).observe(document.getElementById("modal-market-select-item"), {
                childList: true,
                subtree: true
            });

            // History chart
            $(`#panel-player-market button[onclick^="Market.clicks_browse_player_market_button"]`).parent()
                .before(`<canvas id="history-chart" style="display:block; margin-bottom: 0.5em; width: 90%; height: 200px;">`);
            Chart.defaults.datasets.line.tension = 0.3;
            Chart.defaults.datasets.line.fill = false;
            Chart.defaults.datasets.line.borderWidth = 2;

            // Player ID display
            this.onConfigsChanged();
            var playerID = var_player_id;
            $(`#search-username-hiscores`).after(`<span id="player_id">(ID: ${playerID})</span>`);

            // Market watcher
            $("#notifications-area").children().last().after(`
                <div id="notification-market-watcher" class="notification hover hide" onclick='highlight_panel_left(document.getElementById(\"left-panel-item_panel-market\")); switch_panels(\"panel-player-market\");' style="margin-right: 4px; margin-bottom: 4px; background-color: rgb(183, 68, 14);">
                     <img src="https://idlepixel.s3.us-east-2.amazonaws.com/images/player_market.png" class="w20" title="market_alert">
                     <span id="notification-market-item-label" class="color-white"> Market Alert</span>
                </div>`);
            $("#history-chart").prev().before(`
                <center>
                <div id="market-watcher-div" class="select-item-tradables-catagory shadow" align="left" style="width: 100%; margin: 0px; padding: 10pt; background-color: rgb(254, 254, 254); display: none;">
                    <span class="bold">Active watchers</span>
                    <hr style="margin-top: 2px; margin-bottom: 4px;">
                </div>
                </center>`);

            this.applyLocalStorage();
            this.checkWatchers();
        }

        browseGetTable(item) {
            const self = this;
            this.lastBrowsedItem = item;
            if(item != "all") {
                self.lastCategoryFilter = "all";
                self.lastSortIndex = 0;
            }
            if(item == "all") {
                $("#watch-market-item-button").hide();
                $("#history-chart").hide();
            }
            else {
                $("#watch-market-item-button").show();
                $("#modal-market-configure-item-watcher-image").attr("src", `https://idlepixel.s3.us-east-2.amazonaws.com/images/${item}.png`);
                $("#modal-market-configure-item-watcher-label").text(item.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" "));

                try {
                    if(this.getConfig("marketGraph")) {
                        self.fetchMarketHistory(item);
                    }
                } catch(err) {
                    console.log(err);
                }
            }

            // A good chunk of this is taking directly from Market.browse_get_table
            //hide_element("market-table");
            //show_element("market-loading");
            let best = {};
            let bestList = {};
            return $.get(`../../market/browse/${item}/`).done(function(data) {
                const xpMultiplier = DonorShop.has_donor_active(IdlePixelPlus.getVar("donor_bonus_xp_timestamp")) ? 1.1 : 1;
                //console.log(data);

                const listofAlts = IdlePixelPlus.plugins.market.getConfig("altIDList").replace(";",",").replace(/\s?,\s?/g, ",").toLowerCase().split(',').map(altId => parseInt(altId));
                const useHeatPot = $("#heat-pot-checkbox").is(':checked');

                if(data.filter(datum => ["logs", "raw_fish"].includes(datum.market_item_category)).length == 0) {
                    $("#heat-pot-div").hide();
                } else {
                    $("#heat-pot-div").show();
                    var coinsPerHeat = 100000;
                    $.ajax({url: `../../market/browse/logs/`, type: "get", async: false, success: function(data) {
                        coinsPerHeat = 1.01 * Math.min(...data.map(datum => datum.market_item_price_each / Cooking.getHeatPerLog(datum.market_item_name)));
                    }});
                }

                // Removes the alts listing from market and calculations
                data = data.filter(datum => listofAlts.indexOf(parseInt(datum.player_id)) == -1);

                data.forEach(datum => {
                    //console.log(datum);
                    const priceAfterTax = datum.market_item_price_each * 1.01;
                    switch(datum.market_item_category) {
                        case "bars":
                        case "ores": {
                            let perCoin = (priceAfterTax / (xpMultiplier*XP_PER[datum.market_item_name]));
                            datum.perCoin = perCoin;
                            datum.perCoinLabel = `${perCoin.toFixed(perCoin < 10 ? 2 : 1)} coins/xp`;
                            datum.levelReq = "N/A";
                            datum.ratios = [perCoin];
                            if(!best[datum.market_item_category]) {
                                best[datum.market_item_category] = perCoin;
                                bestList[datum.market_item_category] = [datum];
                            }
                            else {
                                if(perCoin == best[datum.market_item_category]) {
                                    bestList[datum.market_item_category].push(datum);
                                }
                                else if(perCoin < best[datum.market_item_category]) {
                                    bestList[datum.market_item_category] = [datum];
                                    best[datum.market_item_category] = perCoin;
                                }
                            }
                            break;
                        }
                        case "logs": {
                            let perCoin = (priceAfterTax / (Cooking.getHeatPerLog(datum.market_item_name) * (useHeatPot ? 2 : 1)));
                            let sDPerCoin = (3500 / priceAfterTax);
                            let charPerCoin = ((priceAfterTax / CHARCOAL_PERC[datum.market_item_name]) / 2);
                            let levelReq = (LEVEL_REQ[datum.market_item_name]);
                            datum.perCoin = perCoin;
                            datum.levelReq = levelReq;
                            datum.sDPerCoin = sDPerCoin;
                            datum.charPerCoin = charPerCoin;
                            datum.ratios = [perCoin, charPerCoin];
                            if (datum.market_item_name == 'stardust_logs') {
                                datum.perCoinLabel = `${perCoin.toFixed(perCoin < 10 ? 2 : 1)} coins/heat<br />${sDPerCoin.toFixed(sDPerCoin < 10 ? 2 : 1)} ~SD/coin<br/>${charPerCoin.toFixed(charPerCoin < 10 ? 2: 1)} coin/charcoal convert rate`;
                            }
                            else {
                                datum.perCoinLabel = `${perCoin.toFixed(perCoin < 10 ? 2 : 1)} coins/heat<br/>${charPerCoin.toFixed(charPerCoin < 10 ? 2: 1)} coin/charcoal convert rate`;
                            }
                            if(!best[datum.market_item_category]) {
                                best[datum.market_item_category] = perCoin;
                                bestList[datum.market_item_category] = [datum];
                            }
                            else {
                                if(perCoin == best[datum.market_item_category]) {
                                    bestList[datum.market_item_category].push(datum);
                                }
                                else if(perCoin < best[datum.market_item_category]) {
                                    bestList[datum.market_item_category] = [datum];
                                    best[datum.market_item_category] = perCoin;
                                }
                            }
                            break;
                        }
                        case "raw_fish":{
                            let perCoin = (priceAfterTax / Cooking.get_energy(datum.market_item_name));
                            let energy = (Cooking.get_energy(datum.market_item_name));
                            let heat = (HEAT_PER[datum.market_item_name]);
                            let perHeat = (energy / heat);
                            let comboCoinEnergyHeat = ((priceAfterTax + (heat * coinsPerHeat / (useHeatPot ? 2 : 1))) / energy);
                            let levelReq = (LEVEL_REQ[datum.market_item_name]);
                            datum.perCoin = comboCoinEnergyHeat;
                            datum.perHeat = perHeat;
                            datum.perCoinLabel = `${perCoin.toFixed(perCoin < 10 ? 2 : 1)} coins/energy || ${perHeat.toFixed(perHeat < 10 ? 2 : 1)} energy/heat<br />${comboCoinEnergyHeat.toFixed(comboCoinEnergyHeat < 10 ? 4 : 1)} coins/heat/energy`;
                            datum.levelReq = levelReq;
                            datum.ratios = [perCoin, perHeat, comboCoinEnergyHeat];
                            if(!best[datum.market_item_category]) {
                                best[datum.market_item_category] = perCoin;
                                bestList[datum.market_item_category] = [datum];
                            }
                            else {
                                if(perCoin == best[datum.market_item_category]) {
                                    bestList[datum.market_item_category].push(datum);
                                }
                                else if(perCoin < best[datum.market_item_category]) {
                                    bestList[datum.market_item_category] = [datum];
                                    best[datum.market_item_category] = perCoin;
                                }
                            }
                            break;
                        }
                        case "cooked_fish":{
                            let perCoin = (priceAfterTax / Cooking.get_energy(datum.market_item_name));
                            datum.perCoin = perCoin;
                            datum.perCoinLabel = `${perCoin.toFixed(perCoin < 10 ? 2 : 1)} coins/energy`;
                            datum.levelReq = "N/A";
                            datum.ratios = [perCoin];
                            if(!best[datum.market_item_category]) {
                                best[datum.market_item_category] = perCoin;
                                bestList[datum.market_item_category] = [datum];
                            }
                            else {
                                if(perCoin == best[datum.market_item_category]) {
                                    bestList[datum.market_item_category].push(datum);
                                }
                                else if(perCoin < best[datum.market_item_category]) {
                                    bestList[datum.market_item_category] = [datum];
                                    best[datum.market_item_category] = perCoin;
                                }
                            }
                            break;
                        }
                        case "bones": {
                            let perCoin = (priceAfterTax / BONEMEAL_PER[datum.market_item_name]);
                            datum.perCoin = perCoin;
                            datum.perCoinLabel = `${perCoin.toFixed(perCoin < 10 ? 2 : 1)} coins/bonemeal`;
                            datum.levelReq = "N/A";
                            datum.ratios = [perCoin];
                            if(!best[datum.market_item_category]) {
                                best[datum.market_item_category] = perCoin;
                                bestList[datum.market_item_category] = [datum];
                            }
                            else {
                                if(perCoin == best[datum.market_item_category]) {
                                    bestList[datum.market_item_category].push(datum);
                                }
                                else if(perCoin < best[datum.market_item_category]) {
                                    bestList[datum.market_item_category] = [datum];
                                    best[datum.market_item_category] = perCoin;
                                }
                            }
                            break;
                        }
                        case "seeds": {
                            datum.perCoin = Number.MAX_SAFE_INTEGER;
                            let levelReq = (LEVEL_REQ[datum.market_item_name]);
                            let sDPerCoin = (14000 / priceAfterTax);
                            datum.levelReq = levelReq;
                            datum.sDPerCoin = sDPerCoin;
                            if (datum.market_item_name == "stardust_seeds") {
                                datum.perCoinLabel = `${sDPerCoin.toFixed(sDPerCoin < 10 ? 2 : 1)} ~SD/Coin`;
                            }
                            else{
                                datum.perCoinLabel = "";
                            }
                            //console.log(levelReq);
                            break;
                        }
                        case "weapons": {
                            datum.perCoin = Number.MAX_SAFE_INTEGER;
                            datum.perCoinLabel = "";
                            let levelReq = "N/A";
                            if (LEVEL_REQ[datum.market_item_name]) {
                                levelReq = (LEVEL_REQ[datum.market_item_name]);
                                datum.levelReq = levelReq;
                            }
                            else {
                                datum.levelReq = "N/A";
                            }
                            //console.log(levelReq);
                            break;
                        }
                        case "other_equipment": {
                            datum.perCoin = Number.MAX_SAFE_INTEGER;
                            datum.perCoinLabel = "";
                            let levelReq = (LEVEL_REQ[datum.market_item_name]);
                            datum.levelReq = levelReq;
                            //console.log(levelReq);
                            break;
                        }
                        case "armour": {
                            datum.perCoin = Number.MAX_SAFE_INTEGER;
                            datum.perCoinLabel = "";
                            let levelReq = "N/A";
                            if (LEVEL_REQ[datum.market_item_name]) {
                                levelReq = (LEVEL_REQ[datum.market_item_name]);
                                datum.levelReq = levelReq;
                            }
                            else {
                                datum.levelReq = "N/A";
                            }
                            //console.log(levelReq);
                            break;
                        }
                        default: {
                            datum.perCoin = Number.MAX_SAFE_INTEGER;
                            datum.perCoinLabel = "";
                            datum.levelReq = "N/A";
                            break;
                        }
                    }
                });
                Object.values(bestList).forEach(bestCatList => bestCatList.forEach(datum => datum.best=true));

                //console.log(self.lastCategoryFilter);
                //console.log(self.lastSortIndex);
                //console.log(self.lastBrowsedItem);
                if(item !== self.lastBrowsedItem)
                    self.lastSortIndex = 0;
                self.currentTableData = data;
                self.filterTable(item === "all" ? self.lastCategoryFilter : data[0].market_item_category);
                
                hide_element("market-loading");
                show_element("market-table");
            });

        }

        updateTable() {
            let html = `<tr>
                            <th>ITEM</th>
                            <th></th>
                            <th>AMOUNT</th>
                            <th class="actions" onclick="IdlePixelPlus.plugins.market.marketHeaderOnClick(event);">PRICE EACH</th>
                            <th>EXTRA INFO</th>
                            <th>CATEGORY</th>
                            <th>EXPIRES IN</th>
                        </tr>`;
            // in case you want to add any extra data to the table but still use this script
            if(typeof window.ModifyMarketDataHeader === "function") {
                html = window.ModifyMarketDataHeader(html);
            }

            this.currentTableData.forEach(datum => {
                if(!datum.hidden) {
                    let market_id = datum.market_id;
                    let player_id = datum.player_id;
                    let item_name = datum.market_item_name;
                    let amount = datum.market_item_amount;
                    let price_each = datum.market_item_price_each;
                    let category = datum.market_item_category;
                    let timestamp = datum.market_item_post_timestamp;
                    let perCoinLabel = datum.perCoinLabel;
                    let best = datum.best && this.getConfig("highlightBest");
                    let levelReq = datum.levelReq;
                    let your_entry = "";

                    if(Items.getItem("player_id") == player_id) {
                        your_entry = "<span class='color-grey font-small'><br /><br />(Your Item)</span>";
                    }

                    let rowHtml = "";
                    rowHtml += `<tr onclick="Modals.market_purchase_item('${market_id}', '${item_name}', '${amount}', '${price_each}'); IdlePixelPlus.plugins.market.applyMaxAmountBuyIfConfigured();" class="hover${ best ? ' cheaper' : '' }">`;
                    rowHtml += `<td>${Items.get_pretty_item_name(item_name)}${your_entry}</td>`;
                    rowHtml += `<td><img src="https://d1xsc8x7nc5q8t.cloudfront.net/images/${item_name}.png" /></td>`;
                    rowHtml += `<td>${amount}</td>`;
                    rowHtml += `<td><img src="https://d1xsc8x7nc5q8t.cloudfront.net/images/coins.png" /> ${Market.get_price_after_tax(price_each)}`;
                    if(perCoinLabel) {
                        rowHtml += `<br /><span style="font-size: 80%; opacity: 0.8">${perCoinLabel}</span>`;
                    }
                    rowHtml += `</td>`;
                    rowHtml += `<td>${levelReq}</td>`;
                    rowHtml += `<td>${category}</td>`;
                    rowHtml += `<td>${Market._get_expire_time(timestamp)}</td>`;
                    rowHtml += `</tr>`;

                    // in case you want to add any extra data to the table but still use this script
                    if(typeof window.ModifyMarketDataRow === "function") {
                        rowHtml = window.ModifyMarketDataRow(datum, rowHtml);
                    }
                    html += rowHtml;
                }
            });
            document.getElementById("market-table").innerHTML = html;
        }

        filterButtonOnClick(category) {
            this.lastSortIndex = 0;
            this.lastCategoryFilter = category;
            this.browseGetTable("all");
            Modals.toggle("modal-market-select-item");
        }

        filterTable(category) {
            if(category) {
                this.lastCategoryFilter = category;
            }
            else {
                category = this.lastCategoryFilter || "all";
            }

            this.configureTableContextMenu(category);

            this.currentTableData.forEach(datum => {
                if(category === "all")
                    datum.hidden = false;
                else
                    datum.hidden = !(category === datum.market_item_category);
            });

            this.sortTable(this.lastSortIndex);
            this.updateTable();
        }

        sortTable(sortDataIndex) {
            // Split the table data into a visible and hidden array in order to sort the visible one
            const visible = this.currentTableData.filter(datum => !datum.hidden);
            const hidden = this.currentTableData.filter(datum => datum.hidden);
            visible.sort((a, b) => {
                switch(sortDataIndex) {
                    case 0: return a.market_item_price_each - b.market_item_price_each;
                    default: return a.ratios[sortDataIndex - 1] - b.ratios[sortDataIndex - 1];
                }
            });
            this.currentTableData = visible.concat(hidden);
            this.lastSortIndex = sortDataIndex;
        }

        refreshMarket(disableButtonForABit) {
            if(this.lastBrowsedItem) {
                Market.browse_get_table(this.lastBrowsedItem);
                if(disableButtonForABit) { // prevent spam clicking it
                    $("#refresh-market-table-button").prop("disabled", true);
                    setTimeout(() => {
                        $("#refresh-market-table-button").prop("disabled", false);
                    }, 700);
                }
            }
        }

        applyOneAmountBuy() {
            $("#modal-market-purchase-item #modal-market-purchase-item-amount-input").val(1);
            this.applyTotalBuy();
        }

        applyMaxAmountBuyIfConfigured() {
            if(this.getConfig("autoMax")) {
                this.applyMaxAmountBuy();
            }
        }

        applyMaxAmountBuy(minus1=false) {
            const coinsOwned = IdlePixelPlus.getVarOrDefault("coins", 0, "int");
            const price = parseInt($("#modal-market-purchase-item #modal-market-purchase-item-price-each").val().replace(/[^\d]+/g, ""));
            const maxAffordable = Math.floor(coinsOwned / price);
            const maxAvailable = parseInt($("#modal-market-purchase-item #modal-market-purchase-item-amount-left").val().replace(/[^\d]+/g, ""));
            let max = Math.min(maxAffordable, maxAvailable);
            if(minus1) {
                max--;
            }
            if(max < 0) {
                max = 0;
            }
            $("#modal-market-purchase-item #modal-market-purchase-item-amount-input").val(max);
            this.applyTotalBuy();
        }

        parseIntKMBT(s) {
            if(typeof s === "number") {
                return Math.floor(s);
            }
            s = s.toUpperCase().replace(/[^\dKMBT]+/g, "");
            if(s.endsWith("K")) {
                s = s.replace(/K$/, "000");
            }
            else if(s.endsWith("M")) {
                s = s.replace(/M$/, "000000");
            }
            else if(s.endsWith("B")) {
                s = s.replace(/B$/, "000000000");
            }
            else if(s.endsWith("T")) {
                s = s.replace(/T$/, "000000000000");
            }
            return parseInt(s);
        }

        // Added by Zlef ->
        handlePurchaseClick() {
            setTimeout(this.displayOwnedInPurchase.bind(this), 100);
        }

        displayOwnedInPurchase() {
            const itemNameElement = $("#modal-market-purchase-item-label");
            const itemName = itemNameElement.text();

            if (!itemName) {
                return;
            }

            const itemNameForQuery = itemName.toLowerCase().replace(/\s/g, '_');
            let itemVar = IdlePixelPlus.getVar(itemNameForQuery);

            if (itemVar === undefined) {
                itemVar = "0";
            }

            const containerElement = $("#modal-market-purchase-item-image").parent();

            // Check if the element already exists before appending
            if (!containerElement.find("#amount-owned").length) {
                containerElement.append(`<p id="amount-owned">You own: ${itemVar}</p>`);
            } else {
                // Update the existing element
                containerElement.find("#amount-owned").text(`You own: ${itemVar}`);
            }
        }
        // <-

        //Zlef
        brewingIngClicked(itemBox) {
            // Define the ingredient blacklist
            const ingredientBlacklist = ["stranger_leaf"];

            if (this.getConfig("clickBrewIng")) {
                // Get data-item attribute
                const dataItem = itemBox.getAttribute("data-item").toLowerCase();

                // Check if dataItem is in the ingredient blacklist
                if (ingredientBlacklist.includes(dataItem)) {
                    console.log("in blacklist");
                    return;
                }

                // Call the function to open the market to the specified item
                this.openMarketToItem(dataItem);
            }
        }

        // Function for opening the market to a specific item
        openMarketToItem(dataItem) {
            // Simulate clicking the Player Market panel
            const playerMarketPanel = document.getElementById("left-panel-item_panel-market");
            if (playerMarketPanel) {
                playerMarketPanel.click();
            }

            // Make sure to switch to the player market panel (annoys the shit out of me that the notification buttons don't do this)
            highlight_panel_left(playerMarketPanel);
            switch_panels('panel-player-market');

            const intervalId = setInterval(() => {
                // Check if the market table element is present
                const marketTable = document.getElementById("market-table");
                if (marketTable) {
                    // If it's present, clear the interval and execute function
                    clearInterval(intervalId);
                    Market.browse_get_table(dataItem);
                }
            }, 100);
        }
        //End Zlef

        applyTotalBuy() {
            const amount = this.parseIntKMBT($("#modal-market-purchase-item #modal-market-purchase-item-amount-input").val());
            const price = this.parseIntKMBT($("#modal-market-purchase-item #modal-market-purchase-item-price-each").val().replace("Price each: ", ""));
            const total = amount*price;
            const totalElement = $("#modal-market-purchase-item-total");
            if(isNaN(total)) {
                totalElement.text("");
            }
            else {
                totalElement.text(total.toLocaleString());
                const coinsOwned = IdlePixelPlus.getVarOrDefault("coins", 0, "int");
                if(total > coinsOwned) {
                    totalElement.css("color", "red");
                }
                else {
                    totalElement.css("color", "");
                }
            }
        }

        currentItemSell() {
            return $("#modal-market-configure-item-to-sell").val();
        }

        applyOneAmountSell() {
            const item = this.currentItemSell();
            const owned = IdlePixelPlus.getVarOrDefault(item, 0, "int");
            $("#modal-market-configure-item-to-sell-amount").val(Math.min(owned, 1));
            this.applyTotalSell();
        }

        applyMaxAmountSell(minus1=false) {
            const item = this.currentItemSell();
            let max = IdlePixelPlus.getVarOrDefault(item, 0, "int");
            if(minus1) {
                max--;
            }
            if(max < 0) {
                max = 0;
            }
            $("#modal-market-configure-item-to-sell-amount").val(max);
            this.applyTotalSell();
        }

        applyMinPriceSell() {
            const min = parseInt($("#modal-market-configure-item-to-sell-label-lower-limit").text().replace(/[^\d]/g, ""));
            $("#modal-market-configure-item-to-sell-price-each").val(min);
            this.applyTotalSell();
        }

        applyLowestPriceSell() {
            var lowest = 100000000000;
            const min = parseInt($("#modal-market-configure-item-to-sell-label-lower-limit").text().replace(/[^\d]/g, ""));
            const max = parseInt($("#modal-market-configure-item-to-sell-label-upper-limit").text().replace(/[^\d]/g, ""));
            const item = $("#modal-market-configure-item-to-sell-image").attr("src").match(/\/([a-zA-Z0-9_]+)\.png$/)[1];
            $.ajax({url: `../../market/browse/${item}/`, type: "get", async: false, success: function(data) {
                lowest = Math.min(...data.map(datum => datum.market_item_price_each));
            }});
            $("#modal-market-configure-item-to-sell-price-each").val(Math.max(Math.min(lowest - 1, max), min));
            this.applyTotalSell();
        }

        applyMidPriceSell() {
            const min = parseInt($("#modal-market-configure-item-to-sell-label-lower-limit").text().replace(/[^\d]/g, ""));
            const max = parseInt($("#modal-market-configure-item-to-sell-label-upper-limit").text().replace(/[^\d]/g, ""));
            const mid = Math.floor((min+max)/2);
            $("#modal-market-configure-item-to-sell-price-each").val(mid);
            this.applyTotalSell();
        }

        applyMaxPriceSell() {
            const max = parseInt($("#modal-market-configure-item-to-sell-label-upper-limit").text().replace(/[^\d]/g, ""));
            $("#modal-market-configure-item-to-sell-price-each").val(max);
            this.applyTotalSell();
        }

        applyTotalSell() {
            const amount = this.parseIntKMBT($("#modal-market-configure-item-to-sell-amount").val());
            const price = this.parseIntKMBT($("#modal-market-configure-item-to-sell-price-each").val());
            const total = amount*price;
            if(isNaN(total)) {
                $("#modal-market-configure-item-to-sell-total").text("");
            }
            else {
                $("#modal-market-configure-item-to-sell-total").text(total.toLocaleString());
            }
            // TODO total w/ tax
        }

        seeMarketOnClick(sellSlotIndex) {
            try {
                const item = $(`#player-market-slot-item-image-${sellSlotIndex}`).attr("src").match(/\/([a-zA-Z0-9_]+)\.png$/)[1];
                this.browseGetTable(item);
            } catch(err) {
                console.error(err);
            }
        }

        async fetchMarketHistory(item) {
            const response = await fetch(`https://data.idle-pixel.com/market/api/getMarketHistory.php?item=${item}&range=7d`);
            const data = await response.json();
            //console.log("Fetched data: ", data); // Debugging line
            const dataByDay = this.splitHistoryDataByDays(data);

            $("#history-chart").show();
            if(this.historyChart === undefined){
                this.historyChart = new Chart($("#history-chart"), {
                    type: 'line',
                    options: {
                        scales: {
                            y: {
                                beginAtZero: false
                            }
                        },
                        interaction: {
                            intersect: false,
                            mode: 'index',
                        }
                    }
                });
            }
            this.updateHistoryChart(dataByDay);
        }

        updateHistoryChart(dataByDay) {
            const averagePrices = dataByDay.map(datum => Math.round(datum.data.map(d => d.price * d.amount)
                                                                              .reduce((a, b) => a + b, 0) / datum.data.map(d => d.amount)
                                                                                                                      .reduce((a, b) => a + b, 0)));
            
            this.historyChart.options.plugins.tooltip.callbacks.footer = (tooltipItems) => {
                const amountsSum = dataByDay[tooltipItems[0].dataIndex].data.map(datum => datum.amount).reduce((a, b) => a + b, 0);
                return `Transaction Volume: ${amountsSum}`;
            }
            this.historyChart.data = {
                labels: dataByDay.map(datum => datum.date.toString().match(/^[a-zA-Z]+\s([a-zA-Z]+\s[0-9]{1,2})\s/)[1]),
                datasets: [{
                    label: 'Lowest Price',
                    data: dataByDay.map(datum => Math.min(...datum.data.map(d => d.price))),
                    borderColor: 'rgb(80, 145, 37)',
                },
                {
                    label: 'Average Price',
                    data: averagePrices,
                    borderColor: 'rgb(15, 47, 137)',
                },
                {
                    label: 'Highest Price',
                    data: dataByDay.map(datum => Math.max(...datum.data.map(d => d.price))),
                    borderColor: 'rgb(147, 10, 10)',
                }]
            };
            this.historyChart.update();
        }

        splitHistoryDataByDays(data) {
            var daysData = [];
            data.history.forEach(datum => {
                let match = daysData.filter(dd => dd.date.getDate() === (new Date(datum.datetime)).getDate());
                if(match.length == 0) {
                    daysData.push({
                        date: new Date(datum.datetime),
                        data: [{price: datum.price, amount: datum.amount}]
                    });
                } else {
                    match[0].data.push({price: datum.price, amount: datum.amount});
                }
            });
            return daysData;
        }

        createMarketWatcher() {
            const item = $("#modal-market-configure-item-watcher-label").text().toLowerCase().replace(/\s/g, "_");
            const value = $("#modal-market-configure-item-watcher-price-each").val();
            const lt_gt = $("#modal-market-configure-item-watcher-mode").val() == "1" ? "<" : ">";

            Modals.toggle("modal-market-configure-item-watcher");
            $("#modal-market-configure-item-watcher-ok-button").val("Create Watcher");

            if($("#market-watcher-div").find(`#watched-item-${item}`).length == 0) {
                this.createWatcherElement(item, value, lt_gt);
                $("#market-watcher-div").show();
            }
            else {
                $(`#watched-item-${item}-label`).text(`${lt_gt} ${value}`);
            }

            this.saveToLocalStorage(item, value, lt_gt);
            this.checkWatchers();
        }

        createWatcherElement(item, value, lt_gt) {
            $("#market-watcher-div").children().last().after(`
            <div id="watched-item-${item}" class="market-tradable-item p-1 m-1 hover shadow" style="background-color:#ffcccc">
                <div align="left" onclick='IdlePixelPlus.plugins.market.browseGetTable(\"${item}\"); event.stopPropagation();'>
                    <img class="hover" src="https://d1xsc8x7nc5q8t.cloudfront.net/images/search_white.png" width="15px" height="15px" title="search_white">
                </div>
                <div onclick='IdlePixelPlus.plugins.market.watchedItemOnClick(\"${item}\");' style="margin-top: -15px;">
                <div style="display: block;">
                    <img src="https://idlepixel.s3.us-east-2.amazonaws.com/images/${item}.png" width="50px" height="50px">
                </div>
                <div style="display: block;">
                    <img src="https://d1xsc8x7nc5q8t.cloudfront.net/images/coins.png" title="coins">
                    <span class="market-watched-item" id="watched-item-${item}-label">${lt_gt} ${value}</span>
                </div>
                </div>
            </div>`);
        }

        deleteMarketWatcher(item) {
            $(`#watched-item-${item}`).remove();
            if($("#market-watcher-div").find(".market-watched-item").length == 0) {
                $("#market-watcher-div").hide();
            }
            this.removeFromLocalStorage(item);
        }

        configureItemWatcherModal(item, create) {
            $("#modal-market-configure-item-watcher-image").attr("src", `https://idlepixel.s3.us-east-2.amazonaws.com/images/${item}.png`);
            $("#modal-market-configure-item-watcher-label").text(item.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" "));
            if(create){
                $("#modal-market-configure-item-watcher-price-each").val("");
                $("#modal-market-configure-item-watcher-ok-button").prop("value", `Create Watcher`);
                $("#modal-market-configure-item-watcher-cancel-button").prop("value", "Cancel");
                $("#modal-market-configure-item-watcher-cancel-button").attr("onclick", "");
            }
            else {
                $("#modal-market-configure-item-watcher-price-each").val($(`#watched-item-${item}-label`).text().match(/[0-9]+/)[0]);
                $("#modal-market-configure-item-watcher-ok-button").prop("value", `Edit Watcher`);
                $("#modal-market-configure-item-watcher-cancel-button").prop("value", "Delete Watcher");
                $("#modal-market-configure-item-watcher-cancel-button").attr("onclick", `IdlePixelPlus.plugins.market.deleteMarketWatcher(\"${item}\")`);
            }
        }

        watchItemOnClick() {
            this.configureItemWatcherModal(this.lastBrowsedItem, true);
            Modals.toggle("modal-market-configure-item-watcher");
        }

        watchedItemOnClick(item) {
            this.configureItemWatcherModal(item, false);
            Modals.toggle("modal-market-configure-item-watcher");
        }

        checkWatchers() {
            var itemTriggered = false;
            $(".market-watched-item").each(async function() {
                const id = $(this).attr("id");
                const item = id.match(/watched-item-([a-zA-Z0-9_]+)-label/)[1];
                const price = $(this).text().match(/[0-9]+/)[0];
                const lt_gt = $(this).text().match(/[><]/)[0];
                //console.log("Running watcher checks..");

                const response = await fetch(`../../market/browse/${item}/`);
                const data = await response.json();

                const sorted = data.map(datum => datum.market_item_price_each * 1.01).toSorted((a, b) => a - b);
                if(sorted.length > 0 && (lt_gt === ">" && sorted[0] >= price) || (lt_gt === "<" && sorted[0] <= price)) {
                    itemTriggered = true;
                    $(`#watched-item-${item}`).css("background-color", "#99ffcc");
                    //console.log("Market watcher triggered for item " + item);
                }
                else {
                    $(`#watched-item-${item}`).css("background-color", "#ffcccc");
                }
            })

            setTimeout(() => {
                const e = document.querySelector("#notification-market-watcher");
                itemTriggered ? e.classList.remove("hide") : e.classList.add("hide");
            }, 2000);
        }

        onVariableSet(key, valueBefore, valueAfter) {

        }

        saveToLocalStorage(item, value, lt_gt) {
            const ls = localStorage.getItem(LOCAL_STORAGE_KEY);
            var jsonData = {};
            if(ls) {
                jsonData = JSON.parse(ls);
                jsonData.watchers = jsonData.watchers.filter(watcher => watcher.item !== item);
                jsonData.watchers.push({
                    item: item,
                    value: value,
                    lt_gt: lt_gt
                });
            }
            else {
                jsonData = {
                    watchers: [{
                        item: item,
                        value: value,
                        lt_gt: lt_gt
                    }]
                };
            }
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(jsonData));
        }

        removeFromLocalStorage(item) {
            const ls = localStorage.getItem(LOCAL_STORAGE_KEY);
            var jsonData = {};
            if(ls) {
                jsonData = JSON.parse(ls);
                jsonData.watchers = jsonData.watchers.filter(watcher => watcher.item !== item);
            }
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(jsonData));
        }

        applyLocalStorage() {
            const ls = localStorage.getItem(LOCAL_STORAGE_KEY);
            if(ls) {
                const jsonData = JSON.parse(ls);
                if(jsonData.watchers && jsonData.watchers.length > 0) {
                    jsonData.watchers.forEach(watcher => {
                        this.createWatcherElement(watcher.item, watcher.value, watcher.lt_gt);
                    });
                    $("#market-watcher-div").show();
                }
            }
        }

        configureTableContextMenu(category) {
            const contextMenu = document.getElementById("market-sort-context-menu").getElementsByClassName("menu").item(0);
            for(let child of Array.from(contextMenu.querySelectorAll('li:not([id="context-menu-price-each-item"])'))) {
                child.remove();
            }
            if(category in CATEGORY_RATIOS) {
                for(let i = 0; i < CATEGORY_RATIOS[category].length; i++) {
                    contextMenu.innerHTML +=`<li id="ratio-${i}" onclick='IdlePixelPlus.plugins.market.contextMenuSelectOnClick(\"ratio-${i}\");'>
                                                <span> ${CATEGORY_RATIOS[category][i]}</span> 
                                            </li>`;
                }
                if(this.lastSortIndex == 0)
                    this.contextMenuChangeSelected("context-menu-price-each-item");
                else
                    this.contextMenuChangeSelected(`ratio-${this.lastSortIndex - 1}`);
            }
            else {
                this.lastSortIndex = 0;
                this.contextMenuChangeSelected("context-menu-price-each-item");
            }
        }

        contextMenuChangeSelected(menuItem) {
            const e = document.getElementById("market-sort-context-menu-selected");
            if(e)
                e.remove();
            document.getElementById(menuItem).innerHTML += `<span id="market-sort-context-menu-selected">&#x2714;</span>`;
        }

        contextMenuSelectOnClick(menuItem) {
            this.contextMenuChangeSelected(menuItem);

            const sortDataIndex = (menuItem == "context-menu-price-each-item") ? 0 : parseInt(menuItem.replace(/[^0-9]/g, "")) + 1;
            this.sortTable(sortDataIndex);
            this.updateTable();
        }

        marketHeaderOnClick(event) { 
            document.addEventListener("click", () => document.getElementById("market-sort-context-menu").style.display = "none", { once: true });

            var menu = document.getElementById("market-sort-context-menu");  
            menu.style.display = 'block'; 
            menu.style.left = event.pageX + "px"; 
            menu.style.top = event.pageY + "px";

            event.stopPropagation();
        }
    }


    const plugin = new MarketPlugin();
    IdlePixelPlus.registerPlugin(plugin);

})();