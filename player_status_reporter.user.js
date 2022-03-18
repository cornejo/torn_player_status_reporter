// ==UserScript==
// @name         Player Status Reporter
// @namespace    http://tampermonkey.net/
// @version      0.4
// @description  Reports current player state to a central server
// @author       rDacted[2670953]
// @match        https://www.torn.com/profiles.php*
// @grant        GM_xmlhttpRequest
// @connect      torn.rocks
// @connect      *
// ==/UserScript==

let server = "https://torn.rocks/api/player_state";

var apikey = '###PDA-APIKEY###';
let universalPost = null;
if (apikey[0] != '#') {
    console.log("Using TornPDA version");
    universalPost = PDA_httpPost;
} else {
    console.log("Using GM_xmlhttpRequest version")
    universalPost = function(url, headers, body) {
        return new Promise(function(resolve, reject) {
            GM_xmlhttpRequest({
                method: "POST",
                url: url,
                headers: headers,
                data: body,
                onload: function(response) {
                    if(response.status == 200) {
                        resolve(response);
                    } else {
                        console.log(response.status);
                        reject(Error(response));
                    }
                },
                onabort: function(response) { console.log("onabort"); reject(Error(response)); },
                onerror: function(response) { console.log("onerror"); reject(Error(response)); },
                ontimeout: function(response) { console.log("ontimeout"); reject(Error(response)); },
            });
        });
    };
}

function get_player_name() {
    const arrAll = document.getElementsByTagName("script");
    for(const entry of arrAll)
    {
        if(entry.hasAttribute('uid') && entry.hasAttribute("name")) {
            let uid = entry.getAttribute('uid');
            let name = entry.getAttribute('name');
            return {"name": name, "uid": uid};
            //return "" + name + "[" + uid + "]";
        }
    }
    console.log("Could not determine name");
}

function report(player_id, status, desc) {
    console.log("Player " + player_id + " has status " + status);

    let current_player = get_player_name();
    let source_player = "?";
    if(current_player != null) {
        source_player = "" + current_player.name + "[" + current_player.uid + "]";
    }

    let headers = {"Content-Type": "application/json"};
    let data = JSON.stringify({
        "player_id": player_id,
        "status": status,
        "desc": desc,
        "source_player": source_player,
    });

    universalPost(server, headers, data).then(
    resolve => {
            console.log("Success - report sent");
        },
        error => {
            console.log("Failed to send report");
        });
}

function get_description(target) {
    let desc = target.getElementsByClassName('main-desc');
    if(desc.length > 0) {
        console.log(desc);
        return desc[0].textContent;
    }
    return "";
}

function set_player_state(player_id, target) {
    let desc = get_description(target);
    let classes = target.classList;
    let options = ["hospital", "okay", "jail", "travelling", "abroad"];
    let found = false;
    for(const status of options) {
        if(classes.contains(status)) {
            report(player_id, status, desc);
            found = true;
        }
    }
    if(found == false) {
        report(player_id, "" + classes, desc);
    }
}

function start_observer() {
    let player_id = window.location.search.match(/\d+/);
    if(player_id != null) {
        player_id = player_id[0];
        console.log("Player ID " + player_id);

        // Select the target node
        let target = document.getElementsByClassName('profile-status');
        if(target.length > 0) {
            target = target[0]

            // Damnit. The player state starts off 'okay' regardless of their actual state
            // it then gets updated later - hence reporting it early is not worth it
            set_player_state(player_id, target);

            // Create an observer instance
            let observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    set_player_state(player_id, mutation.target);
                });
            });

            // Configuration of the observer:
            var config = { attributes: true, childList: false, characterData: false };

            // Pass in the target node, as well as the observer options
            observer.observe(target, config);
        } else {
            console.log("Target not found");
        }
    }
}

function start() {
    console.log("Player status reporter starting");
    start_observer();
    console.log("Player status reporter done");
}

// TODO
// This delay is needed to let the screen settle
setTimeout(function() { start(); }, 500);
